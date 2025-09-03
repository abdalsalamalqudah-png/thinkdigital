import { CloudflareBindings, User } from '../types';

// JWT utilities for authentication
export class AuthUtils {
  private static readonly ALGORITHM = 'HS256';
  private static readonly EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

  // Generate JWT token
  static async generateToken(user: User, secret: string): Promise<string> {
    const header = {
      alg: this.ALGORITHM,
      typ: 'JWT'
    };

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.full_name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + this.EXPIRY_TIME) / 1000)
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = await this.createSignature(`${encodedHeader}.${encodedPayload}`, secret);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Verify JWT token
  static async verifyToken(token: string, secret: string): Promise<any> {
    try {
      const [header, payload, signature] = token.split('.');
      
      if (!header || !payload || !signature) {
        throw new Error('Invalid token format');
      }

      // Verify signature
      const expectedSignature = await this.createSignature(`${header}.${payload}`, secret);
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      // Decode and verify payload
      const decodedPayload = JSON.parse(this.base64UrlDecode(payload));
      
      // Check expiration
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return decodedPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Hash password using Web Crypto API (bcrypt alternative for edge)
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'edu-platform-salt-2024');
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hash);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  // Create HMAC signature
  private static async createSignature(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(data)
    );
    
    return this.base64UrlEncode(this.bufferToString(signature));
  }

  // Helper functions
  private static base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private static base64UrlDecode(str: string): string {
    str += '=='.slice(0, (4 - str.length % 4) % 4);
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    return atob(str);
  }

  private static bufferToString(buffer: ArrayBuffer): string {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
  }

  private static bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Generate random ID
  static generateId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Extract bearer token from Authorization header
  static extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

// Session management - simplified without KV
export class SessionManager {
  // In production, this would use KV or a database
  // For now, sessions are managed via JWT only
  
  static createSessionToken(userId: string, data: any): string {
    return AuthUtils.generateId();
  }

  static validateSession(token: string): boolean {
    // Session validation happens via JWT
    return true;
  }
}