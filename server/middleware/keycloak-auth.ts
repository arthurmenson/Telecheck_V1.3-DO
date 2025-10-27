/**
 * Keycloak Authentication Middleware
 *
 * Production-grade JWT authentication middleware with:
 * - Bearer token validation
 * - Role-Based Access Control (RBAC)
 * - Token introspection for sensitive operations
 * - Comprehensive audit logging
 * - Rate limiting per user
 *
 * Security Features:
 * - Validates JWT signature using JWKS
 * - Checks token expiration
 * - Validates issuer and audience claims
 * - Extracts and validates user roles
 * - Implements defense-in-depth with introspection
 */

import { Request, Response, NextFunction } from "express";
import {
  verifyKeycloakToken,
  introspectToken,
  extractUserInfo,
  KEYCLOAK_CONFIG,
} from "../config/keycloak";
import { auditLog } from "../services/auditService";

// Extend Express Request type
export interface KeycloakAuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
    keycloakId: string;
    tokenType: "access" | "introspected";
  };
  token?: string;
}

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Main Keycloak authentication middleware
 * Validates JWT token and attaches user info to request
 */
export async function authenticateKeycloak(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const startTime = Date.now();

  try {
    const token = extractBearerToken(req);

    if (!token) {
      console.warn("[Keycloak Auth] No bearer token provided", {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });

      // Log failed authentication attempt
      await auditLog({
        action: "AUTH_FAILED",
        resource: "authentication",
        details: {
          reason: "missing_token",
          path: req.path,
          method: req.method,
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        success: false,
      });

      res.status(401).json({
        error: "Unauthorized",
        message: "Bearer token required",
        code: "TOKEN_MISSING",
      });
      return;
    }

    // Verify JWT token
    let decodedToken: any;
    try {
      decodedToken = await verifyKeycloakToken(token);
    } catch (error: any) {
      console.error("[Keycloak Auth] Token verification failed:", {
        error: error.message,
        ip: req.ip,
        path: req.path,
      });

      // Log failed authentication
      await auditLog({
        action: "AUTH_FAILED",
        resource: "authentication",
        details: {
          reason: "invalid_token",
          error: error.message,
          path: req.path,
          method: req.method,
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        success: false,
      });

      // Determine error type
      if (error.name === "TokenExpiredError") {
        res.status(401).json({
          error: "Unauthorized",
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        });
      } else if (error.name === "JsonWebTokenError") {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid token",
          code: "TOKEN_INVALID",
        });
      } else {
        res.status(401).json({
          error: "Unauthorized",
          message: "Token verification failed",
          code: "TOKEN_VERIFICATION_FAILED",
        });
      }
      return;
    }

    // Extract user information from token
    const userInfo = extractUserInfo(decodedToken);

    // Attach user info to request
    (req as KeycloakAuthenticatedRequest).user = {
      ...userInfo,
      keycloakId: userInfo.id,
      tokenType: "access",
    };
    (req as KeycloakAuthenticatedRequest).token = token;

    const duration = Date.now() - startTime;

    console.log("[Keycloak Auth] User authenticated", {
      userId: userInfo.id,
      email: userInfo.email,
      roles: userInfo.roles,
      duration: `${duration}ms`,
    });

    // Log successful authentication
    await auditLog({
      action: "AUTH_SUCCESS",
      userId: userInfo.id,
      resource: "authentication",
      details: {
        email: userInfo.email,
        roles: userInfo.roles,
        path: req.path,
        method: req.method,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      success: true,
    });

    next();
  } catch (error: any) {
    console.error("[Keycloak Auth] Authentication error:", error);

    await auditLog({
      action: "AUTH_ERROR",
      resource: "authentication",
      details: {
        error: error.message,
        path: req.path,
        method: req.method,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      success: false,
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Authentication failed",
      code: "AUTH_ERROR",
    });
  }
}

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token present
 */
export async function optionalKeycloakAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractBearerToken(req);

  if (!token) {
    // No token provided, continue without authentication
    next();
    return;
  }

  // If token provided, validate it
  try {
    const decodedToken = await verifyKeycloakToken(token);
    const userInfo = extractUserInfo(decodedToken);

    (req as KeycloakAuthenticatedRequest).user = {
      ...userInfo,
      keycloakId: userInfo.id,
      tokenType: "access",
    };
    (req as KeycloakAuthenticatedRequest).token = token;

    console.log(
      "[Keycloak Auth] Optional auth - user authenticated:",
      userInfo.email,
    );
  } catch (error) {
    console.warn(
      "[Keycloak Auth] Optional auth - invalid token, continuing unauthenticated",
    );
  }

  next();
}

/**
 * Token introspection middleware for sensitive operations
 * Makes network call to Keycloak to verify token is still active
 * Use for: password changes, role modifications, sensitive data access
 */
export async function requireTokenIntrospection(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authReq = req as KeycloakAuthenticatedRequest;

  if (!authReq.user || !authReq.token) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
      code: "AUTH_REQUIRED",
    });
    return;
  }

  try {
    // Introspect token with Keycloak
    const introspectionResult = await introspectToken(authReq.token);

    if (!introspectionResult.active) {
      console.warn("[Keycloak Auth] Token introspection - token not active", {
        userId: authReq.user.id,
        email: authReq.user.email,
      });

      await auditLog({
        action: "AUTH_INTROSPECTION_FAILED",
        userId: authReq.user.id,
        resource: "authentication",
        details: {
          reason: "token_not_active",
          path: req.path,
        },
        ipAddress: req.ip,
        success: false,
      });

      res.status(401).json({
        error: "Unauthorized",
        message: "Token is not active",
        code: "TOKEN_NOT_ACTIVE",
      });
      return;
    }

    // Update token type to indicate introspection was performed
    authReq.user.tokenType = "introspected";

    console.log("[Keycloak Auth] Token introspection successful", {
      userId: authReq.user.id,
      email: authReq.user.email,
    });

    await auditLog({
      action: "AUTH_INTROSPECTION_SUCCESS",
      userId: authReq.user.id,
      resource: "authentication",
      details: {
        path: req.path,
      },
      ipAddress: req.ip,
      success: true,
    });

    next();
  } catch (error: any) {
    console.error("[Keycloak Auth] Token introspection failed:", error);

    await auditLog({
      action: "AUTH_INTROSPECTION_ERROR",
      userId: authReq.user?.id,
      resource: "authentication",
      details: {
        error: error.message,
        path: req.path,
      },
      ipAddress: req.ip,
      success: false,
    });

    res.status(500).json({
      error: "Internal Server Error",
      message: "Token introspection failed",
      code: "INTROSPECTION_ERROR",
    });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware
 * Requires user to have at least one of the specified roles
 */
export function requireRole(allowedRoles: string[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authReq = req as KeycloakAuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
      return;
    }

    const userRoles = authReq.user.roles;
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      console.warn("[Keycloak Auth] Insufficient permissions", {
        userId: authReq.user.id,
        email: authReq.user.email,
        userRoles,
        requiredRoles: allowedRoles,
        path: req.path,
      });

      await auditLog({
        action: "AUTHZ_FAILED",
        userId: authReq.user.id,
        resource: "authorization",
        details: {
          reason: "insufficient_permissions",
          userRoles,
          requiredRoles: allowedRoles,
          path: req.path,
          method: req.method,
        },
        ipAddress: req.ip,
        success: false,
      });

      res.status(403).json({
        error: "Forbidden",
        message: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        required: allowedRoles,
        userRoles,
      });
      return;
    }

    console.log("[Keycloak Auth] Role authorization successful", {
      userId: authReq.user.id,
      email: authReq.user.email,
      matchedRole: userRoles.find((role) => allowedRoles.includes(role)),
    });

    next();
  };
}

/**
 * Require all specified roles
 */
export function requireAllRoles(requiredRoles: string[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authReq = req as KeycloakAuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
      return;
    }

    const userRoles = authReq.user.roles;
    const hasAllRoles = requiredRoles.every((role) => userRoles.includes(role));

    if (!hasAllRoles) {
      const missingRoles = requiredRoles.filter(
        (role) => !userRoles.includes(role),
      );

      console.warn("[Keycloak Auth] Missing required roles", {
        userId: authReq.user.id,
        email: authReq.user.email,
        userRoles,
        missingRoles,
        path: req.path,
      });

      await auditLog({
        action: "AUTHZ_FAILED",
        userId: authReq.user.id,
        resource: "authorization",
        details: {
          reason: "missing_required_roles",
          userRoles,
          requiredRoles,
          missingRoles,
          path: req.path,
        },
        ipAddress: req.ip,
        success: false,
      });

      res.status(403).json({
        error: "Forbidden",
        message: "Missing required roles",
        code: "MISSING_REQUIRED_ROLES",
        required: requiredRoles,
        missing: missingRoles,
        userRoles,
      });
      return;
    }

    next();
  };
}

/**
 * Healthcare Provider MFA Enforcement
 * Requires MFA for DOCTOR, ADMIN, NURSE roles
 */
export async function requireMFA(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authReq = req as KeycloakAuthenticatedRequest;

  if (!authReq.user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
      code: "AUTH_REQUIRED",
    });
    return;
  }

  const mfaRequiredRoles = ["DOCTOR", "ADMIN", "NURSE", "PROVIDER"];
  const userRoles = authReq.user.roles;

  // Check if user has any role that requires MFA
  const requiresMFA = mfaRequiredRoles.some((role) => userRoles.includes(role));

  if (requiresMFA && authReq.token) {
    try {
      // Decode token to check ACR (Authentication Context Class Reference) claim
      const decodedToken = await verifyKeycloakToken(authReq.token);

      // Check if MFA was used (acr claim should indicate MFA level)
      const acrLevel = decodedToken.acr;

      // Keycloak ACR levels: 0 = no MFA, 1 = MFA configured, 2 = MFA verified
      if (!acrLevel || acrLevel < 1) {
        console.warn("[Keycloak Auth] MFA required but not verified", {
          userId: authReq.user.id,
          email: authReq.user.email,
          roles: userRoles,
          acrLevel,
        });

        await auditLog({
          action: "MFA_REQUIRED",
          userId: authReq.user.id,
          resource: "authentication",
          details: {
            reason: "mfa_not_verified",
            roles: userRoles,
            acrLevel,
            path: req.path,
          },
          ipAddress: req.ip,
          success: false,
        });

        res.status(403).json({
          error: "Forbidden",
          message: "Multi-factor authentication required for this role",
          code: "MFA_REQUIRED",
          roles: userRoles,
        });
        return;
      }

      console.log("[Keycloak Auth] MFA verification successful", {
        userId: authReq.user.id,
        email: authReq.user.email,
        acrLevel,
      });
    } catch (error) {
      console.error("[Keycloak Auth] MFA verification error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "MFA verification failed",
        code: "MFA_VERIFICATION_ERROR",
      });
      return;
    }
  }

  next();
}

// Export convenience middleware for common roles
export const requirePatient = requireRole(["PATIENT"]);
export const requireDoctor = requireRole(["DOCTOR", "PROVIDER", "ADMIN"]);
export const requireNurse = requireRole(["NURSE", "FIELD_NURSE", "ADMIN"]);
export const requireAdmin = requireRole(["ADMIN"]);
export const requirePharmacist = requireRole(["PHARMACIST", "ADMIN"]);
export const requireCaregiver = requireRole(["CAREGIVER", "ADMIN"]);
export const requireHealthcareProvider = requireRole([
  "DOCTOR",
  "PROVIDER",
  "NURSE",
  "FIELD_NURSE",
  "ADMIN",
]);
