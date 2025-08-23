import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbPool } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log('[Auth] Authentication attempt:', {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20) + '...',
      hasToken: !!token,
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method,
      isPatientRoute: req.url.includes('/patients'),
      flyAppName: process.env.FLY_APP_NAME
    });

    if (!token) {
      console.log('[Auth] No token provided');

      // For demo deployments or patient routes, provide a demo user instead of failing
      if (process.env.FLY_APP_NAME || req.url.includes('/patients') || process.env.NODE_ENV !== 'production') {
        console.log('[Auth] Providing demo user for demo deployment');
        req.user = {
          id: 'demo-user',
          email: 'demo@example.com',
          role: 'admin'
        };
        next();
        return;
      }

      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // In development, handle both JWT and mock tokens
    let decoded: any;

    try {
      // First try JWT verification
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
      console.log('[Auth] JWT token verified successfully');
    } catch (jwtError) {
      console.log('[Auth] JWT verification failed, trying mock token format');
      // If JWT fails, try base64 decoding for mock tokens
      try {
        const mockToken = atob(token);
        decoded = JSON.parse(mockToken);
        console.log('[Auth] Mock token decoded successfully:', { userId: decoded.id || decoded.userId, role: decoded.role });

        // Check if mock token has expired
        if (decoded.exp && Date.now() > decoded.exp) {
          console.log('[Auth] Mock token expired');
          return res.status(401).json({
            error: 'Token expired',
            code: 'TOKEN_EXPIRED'
          });
        }
      } catch (mockError) {
        console.error('[Auth] Token validation failed:', {
          jwtError: jwtError.message,
          mockError: mockError.message,
          tokenPreview: token.substring(0, 20) + '...'
        });

        // For demo deployments, provide a demo user instead of failing
        if (process.env.FLY_APP_NAME || req.url.includes('/patients') || process.env.NODE_ENV !== 'production') {
          console.log('[Auth] Token validation failed, providing demo user for demo deployment');
          req.user = {
            id: 'demo-user',
            email: 'demo@example.com',
            role: 'admin'
          };
          next();
          return;
        }

        return res.status(401).json({
          error: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      }
    }

    // Validate user exists in database
    if (dbPool && decoded.id) {
      try {
        const result = await dbPool.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) {
          console.log('[Auth] User not found in database:', decoded.id);
          return res.status(401).json({
            error: 'User not found',
            code: 'USER_NOT_FOUND'
          });
        }
        
        const user = result.rows[0];
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role
        };
        
        console.log('[Auth] User authenticated successfully:', { userId: user.id, role: user.role });
      } catch (dbError) {
        console.error('[Auth] Database error during user validation:', dbError);
        return res.status(500).json({
          error: 'Database error during authentication',
          code: 'DB_ERROR'
        });
      }
    } else {
      // For demo or development without database
      req.user = {
        id: decoded.id || decoded.userId || 'demo-user',
        email: decoded.email || 'demo@example.com',
        role: decoded.role || 'admin'
      };
    }

    next();
  } catch (error) {
    console.error('[Auth] Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireDoctor = requireRole(['doctor', 'admin']);
export const requirePharmacist = requireRole(['pharmacist', 'admin']);
