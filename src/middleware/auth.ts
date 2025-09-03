import { Context, Next } from 'hono';
import { CloudflareBindings, User } from '../types';
import { AuthUtils } from '../utils/auth';

type Env = { Bindings: CloudflareBindings };

// Authentication middleware
export const authenticate = async (c: Context<Env>, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = AuthUtils.extractBearerToken(authHeader);

    if (!token) {
      return c.json({ error: 'No token provided' }, 401);
    }

    // Get JWT secret from environment
    const jwtSecret = c.env.JWT_SECRET || 'eduplatform-secret-key-2024';
    
    // Verify token
    const payload = await AuthUtils.verifyToken(token, jwtSecret);

    // Get user from database
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ? AND is_active = 1'
    ).bind(payload.sub).first<User>();

    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }

    // Attach user to context
    c.set('user', user);
    c.set('userId', user.id);
    c.set('userRole', user.role);

    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Role-based access control middleware
export const authorize = (...roles: string[]) => {
  return async (c: Context<Env>, next: Next) => {
    const userRole = c.get('userRole');

    if (!userRole || !roles.includes(userRole)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (c: Context<Env>, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = AuthUtils.extractBearerToken(authHeader);

    if (token) {
      const jwtSecret = c.env.JWT_SECRET || 'eduplatform-secret-key-2024';
      const payload = await AuthUtils.verifyToken(token, jwtSecret);

      const user = await c.env.DB.prepare(
        'SELECT * FROM users WHERE id = ? AND is_active = 1'
      ).bind(payload.sub).first<User>();

      if (user) {
        c.set('user', user);
        c.set('userId', user.id);
        c.set('userRole', user.role);
      }
    }
  } catch (error) {
    // Silent fail - continue without auth
  }

  await next();
};

// Rate limiting middleware using KV
export const rateLimit = (requests: number = 100, windowMinutes: number = 15) => {
  return async (c: Context<Env>, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const key = `rate-limit:${ip}`;
    
    const current = await c.env.CACHE.get(key);
    const count = current ? parseInt(current) : 0;

    if (count >= requests) {
      return c.json({ error: 'Too many requests' }, 429);
    }

    await c.env.CACHE.put(
      key,
      String(count + 1),
      { expirationTtl: windowMinutes * 60 }
    );

    await next();
  };
};

// CORS middleware configuration
export const corsConfig = {
  origin: ['http://localhost:3000', 'https://eduplatform.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400,
  credentials: true
};