import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { CloudflareBindings, User, AuthResponse } from '../types';
import { AuthUtils, SessionManager } from '../utils/auth';
import { rateLimit } from '../middleware/auth';

type Env = { Bindings: CloudflareBindings };

const auth = new Hono<Env>();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2).max(100),
  role: z.enum(['student', 'instructor']).optional().default('student')
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6)
});

// Login endpoint
auth.post('/login', 
  rateLimit(5, 15), // 5 attempts per 15 minutes
  zValidator('json', loginSchema),
  async (c) => {
    const { email, password } = c.req.valid('json');

    try {
      // Get user from database
      const user = await c.env.DB.prepare(
        'SELECT * FROM users WHERE email = ? AND is_active = 1'
      ).bind(email).first<User & { password_hash: string }>();

      if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Verify password
      const isValid = await AuthUtils.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Check if user is verified
      if (!user.is_verified) {
        return c.json({ error: 'Please verify your email first' }, 403);
      }

      // Generate JWT token
      const jwtSecret = c.env.JWT_SECRET || 'eduplatform-secret-key-2024';
      const token = await AuthUtils.generateToken(user, jwtSecret);

      // Create session in KV
      const sessionManager = new SessionManager(c.env.CACHE);
      const sessionId = await sessionManager.createSession(user.id, {
        email: user.email,
        role: user.role
      });

      // Log activity
      await c.env.DB.prepare(`
        INSERT INTO activity_logs (user_id, action, entity_type, ip_address, user_agent)
        VALUES (?, 'login', 'auth', ?, ?)
      `).bind(
        user.id,
        c.req.header('CF-Connecting-IP') || 'unknown',
        c.req.header('User-Agent') || 'unknown'
      ).run();

      // Remove password from response
      const { password_hash, ...userData } = user;

      const response: AuthResponse = {
        user: userData,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      return c.json({
        success: true,
        data: response
      });

    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Login failed' }, 500);
    }
  }
);

// Register endpoint
auth.post('/register',
  rateLimit(3, 60), // 3 registrations per hour
  zValidator('json', registerSchema),
  async (c) => {
    const { email, password, full_name, role } = c.req.valid('json');

    try {
      // Check if user already exists
      const existing = await c.env.DB.prepare(
        'SELECT id FROM users WHERE email = ?'
      ).bind(email).first();

      if (existing) {
        return c.json({ error: 'Email already registered' }, 400);
      }

      // Hash password
      const passwordHash = await AuthUtils.hashPassword(password);
      const userId = AuthUtils.generateId();

      // Create user
      await c.env.DB.prepare(`
        INSERT INTO users (id, email, password_hash, full_name, role, is_verified, is_active)
        VALUES (?, ?, ?, ?, ?, 0, 1)
      `).bind(userId, email, passwordHash, full_name, role).run();

      // Generate verification token
      const verificationToken = AuthUtils.generateId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await c.env.DB.prepare(`
        INSERT INTO email_verifications (user_id, token, expires_at)
        VALUES (?, ?, ?)
      `).bind(userId, verificationToken, expiresAt).run();

      // TODO: Send verification email via email service
      // For now, return the token in development
      const isDev = c.env.ENVIRONMENT === 'development';

      return c.json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        ...(isDev && { verification_token: verificationToken })
      });

    } catch (error) {
      console.error('Registration error:', error);
      return c.json({ error: 'Registration failed' }, 500);
    }
  }
);

// Verify email endpoint
auth.get('/verify-email/:token', async (c) => {
  const token = c.req.param('token');

  try {
    // Get verification record
    const verification = await c.env.DB.prepare(`
      SELECT * FROM email_verifications 
      WHERE token = ? AND expires_at > datetime('now')
    `).bind(token).first<{ user_id: string }>();

    if (!verification) {
      return c.json({ error: 'Invalid or expired token' }, 400);
    }

    // Update user as verified
    await c.env.DB.prepare(`
      UPDATE users SET is_verified = 1 WHERE id = ?
    `).bind(verification.user_id).run();

    // Delete verification record
    await c.env.DB.prepare(`
      DELETE FROM email_verifications WHERE token = ?
    `).bind(token).run();

    return c.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });

  } catch (error) {
    console.error('Verification error:', error);
    return c.json({ error: 'Verification failed' }, 500);
  }
});

// Forgot password endpoint
auth.post('/forgot-password',
  rateLimit(3, 60),
  zValidator('json', forgotPasswordSchema),
  async (c) => {
    const { email } = c.req.valid('json');

    try {
      const user = await c.env.DB.prepare(
        'SELECT id FROM users WHERE email = ? AND is_active = 1'
      ).bind(email).first();

      // Always return success to prevent email enumeration
      if (!user) {
        return c.json({
          success: true,
          message: 'If an account exists, a reset link has been sent.'
        });
      }

      // Generate reset token
      const resetToken = AuthUtils.generateId();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      // Store in KV with expiration
      await c.env.CACHE.put(
        `password-reset:${resetToken}`,
        JSON.stringify({ userId: user.id, email }),
        { expirationTtl: 3600 }
      );

      // TODO: Send reset email
      const isDev = c.env.ENVIRONMENT === 'development';

      return c.json({
        success: true,
        message: 'If an account exists, a reset link has been sent.',
        ...(isDev && { reset_token: resetToken })
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      return c.json({ error: 'Request failed' }, 500);
    }
  }
);

// Reset password endpoint
auth.post('/reset-password',
  zValidator('json', resetPasswordSchema),
  async (c) => {
    const { token, password } = c.req.valid('json');

    try {
      // Get reset data from KV
      const resetData = await c.env.CACHE.get(`password-reset:${token}`);
      
      if (!resetData) {
        return c.json({ error: 'Invalid or expired token' }, 400);
      }

      const { userId } = JSON.parse(resetData);

      // Hash new password
      const passwordHash = await AuthUtils.hashPassword(password);

      // Update password
      await c.env.DB.prepare(`
        UPDATE users SET password_hash = ? WHERE id = ?
      `).bind(passwordHash, userId).run();

      // Delete reset token
      await c.env.CACHE.delete(`password-reset:${token}`);

      return c.json({
        success: true,
        message: 'Password reset successful. You can now login.'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      return c.json({ error: 'Reset failed' }, 500);
    }
  }
);

// Logout endpoint (invalidate session)
auth.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = AuthUtils.extractBearerToken(authHeader);

  if (token) {
    // Add token to blacklist in KV with expiration
    await c.env.CACHE.put(
      `blacklist:${token}`,
      'true',
      { expirationTtl: 24 * 60 * 60 } // 24 hours
    );
  }

  return c.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default auth;