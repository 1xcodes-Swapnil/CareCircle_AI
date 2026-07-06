import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db.js';
import { User } from '../src/types.js';

if (!process.env.JWT_SECRET) {
  console.error('[Auth] FATAL: JWT_SECRET environment variable is not set. Authentication will be non-functional. Set JWT_SECRET in your .env file.');
}
const SECRET_KEY = process.env.JWT_SECRET || '';

// Simple, secure token encoder/decoder (fully compliant for preview containers)
export interface AuthRequest extends Request {
  user?: User;
}

export class AuthController {
  /**
   * Secure PBKDF2 password hashing
   */
  public static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verify PBKDF2 password
   */
  public static verifyPassword(password: string, stored: string): boolean {
    try {
      const [salt, hash] = stored.split(':');
      if (!salt || !hash) return false;
      const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      return hash === verifyHash;
    } catch {
      return false;
    }
  }

  /**
   * Generates a simple, secure, signed, and expiring session token containing user ID & role
   */
  public static generateToken(userId: string, role: 'caregiver' | 'carerecipient'): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      userId,
      role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiration
      iat: Date.now()
    })).toString('base64url');
    
    const signature = crypto.createHmac('sha256', SECRET_KEY)
      .update(`${header}.${payload}`)
      .digest('base64url');
      
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Decodes and validates the signed session token
   */
  public static decodeToken(token: string): { userId: string; role: 'caregiver' | 'carerecipient' } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [header, payload, signature] = parts;
      
      const expectedSignature = crypto.createHmac('sha256', SECRET_KEY)
        .update(`${header}.${payload}`)
        .digest('base64url');
        
      if (signature !== expectedSignature) {
        console.error('[Auth] Cryptographic verification failed: Signature mismatch');
        return null;
      }
      
      const decodedPayloadStr = Buffer.from(payload, 'base64url').toString('utf-8');
      const decodedPayload = JSON.parse(decodedPayloadStr);
      
      if (decodedPayload.exp && Date.now() > decodedPayload.exp) {
        console.warn('[Auth] Token verification failed: Session has expired');
        return null;
      }
      
      if (decodedPayload && decodedPayload.userId && decodedPayload.role) {
        return {
          userId: decodedPayload.userId,
          role: decodedPayload.role
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Middleware to authenticate incoming requests via Authorization header
   */
  public static authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = AuthController.decodeToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Authentication token is corrupted or expired' });
    }

    const user = db.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }

    req.user = user;
    next();
  }

  /**
   * Middleware helper to restrict routes by role
   */
  public static authorize(allowedRoles: ('caregiver' | 'carerecipient')[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied: Insufficient privileges' });
      }

      next();
    };
  }
}
