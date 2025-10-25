/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * Provides comprehensive role and permission checking for Telecheck V2.0
 * Implements defense-in-depth security with audit logging
 */

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { auditLog } from "../services/auditService";

// Role hierarchy (higher number = more permissions)
export enum Role {
  PATIENT = "patient",
  PHARMACIST = "pharmacist",
  DOCTOR = "doctor",
  ADMIN = "admin",
}

const roleHierarchy: Record<Role, number> = {
  [Role.PATIENT]: 1,
  [Role.PHARMACIST]: 2,
  [Role.DOCTOR]: 3,
  [Role.ADMIN]: 4,
};

// Permission definitions
export enum Permission {
  // User management
  USER_CREATE = "user:create",
  USER_READ = "user:read",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",
  USER_LIST = "user:list",

  // Role management
  ROLE_ASSIGN = "role:assign",
  ROLE_VIEW = "role:view",

  // Patient data
  PATIENT_READ_OWN = "patient:read:own",
  PATIENT_READ_ALL = "patient:read:all",
  PATIENT_UPDATE_OWN = "patient:update:own",
  PATIENT_UPDATE_ALL = "patient:update:all",

  // Medical records
  MEDICAL_RECORD_CREATE = "medical:create",
  MEDICAL_RECORD_READ = "medical:read",
  MEDICAL_RECORD_UPDATE = "medical:update",
  MEDICAL_RECORD_DELETE = "medical:delete",

  // Prescriptions
  PRESCRIPTION_CREATE = "prescription:create",
  PRESCRIPTION_READ = "prescription:read",
  PRESCRIPTION_DISPENSE = "prescription:dispense",

  // System administration
  SYSTEM_CONFIG = "system:config",
  AUDIT_VIEW = "audit:view",
  ANALYTICS_VIEW = "analytics:view",
}

// Role-Permission mapping
const rolePermissions: Record<Role, Permission[]> = {
  [Role.PATIENT]: [
    Permission.PATIENT_READ_OWN,
    Permission.PATIENT_UPDATE_OWN,
    Permission.PRESCRIPTION_READ,
  ],

  [Role.PHARMACIST]: [
    Permission.PATIENT_READ_OWN,
    Permission.PATIENT_UPDATE_OWN,
    Permission.PRESCRIPTION_READ,
    Permission.PRESCRIPTION_DISPENSE,
  ],

  [Role.DOCTOR]: [
    Permission.PATIENT_READ_OWN,
    Permission.PATIENT_READ_ALL,
    Permission.PATIENT_UPDATE_OWN,
    Permission.MEDICAL_RECORD_CREATE,
    Permission.MEDICAL_RECORD_READ,
    Permission.MEDICAL_RECORD_UPDATE,
    Permission.PRESCRIPTION_CREATE,
    Permission.PRESCRIPTION_READ,
    Permission.ANALYTICS_VIEW,
  ],

  [Role.ADMIN]: [
    // Admins have all permissions
    ...Object.values(Permission),
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role has minimum required level
 */
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Middleware: Require specific role
 */
export function requireRole(...allowedRoles: Role[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        await auditLog({
          userId: "anonymous",
          action: "RBAC_CHECK_FAILED",
          description: "No authenticated user",
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        });

        return res.status(401).json({
          error: "Authentication required",
          code: "UNAUTHORIZED",
        });
      }

      const userRole = req.user.role as Role;

      if (!allowedRoles.includes(userRole)) {
        await auditLog({
          userId: req.user.id,
          action: "RBAC_PERMISSION_DENIED",
          description: `User with role ${userRole} attempted to access endpoint requiring ${allowedRoles.join(", ")}`,
          details: {
            userRole,
            requiredRoles: allowedRoles,
            endpoint: req.path,
            method: req.method,
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        });

        return res.status(403).json({
          error: "Insufficient permissions",
          code: "FORBIDDEN",
          required: allowedRoles,
          current: userRole,
        });
      }

      next();
    } catch (error) {
      console.error("RBAC middleware error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  };
}

/**
 * Middleware: Require specific permission
 */
export function requirePermission(...requiredPermissions: Permission[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
          code: "UNAUTHORIZED",
        });
      }

      const userRole = req.user.role as Role;
      const userPermissions = rolePermissions[userRole] || [];

      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
        await auditLog({
          userId: req.user.id,
          action: "RBAC_PERMISSION_DENIED",
          description: `Permission denied for ${requiredPermissions.join(", ")}`,
          details: {
            userRole,
            userPermissions,
            requiredPermissions,
            endpoint: req.path,
            method: req.method,
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        });

        return res.status(403).json({
          error: "Insufficient permissions",
          code: "FORBIDDEN",
          required: requiredPermissions,
        });
      }

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  };
}

/**
 * Middleware: Require minimum role level
 */
export function requireMinimumRole(minimumRole: Role) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
          code: "UNAUTHORIZED",
        });
      }

      const userRole = req.user.role as Role;

      if (!hasMinimumRole(userRole, minimumRole)) {
        await auditLog({
          userId: req.user.id,
          action: "RBAC_PERMISSION_DENIED",
          description: `User role ${userRole} below minimum required ${minimumRole}`,
          details: {
            userRole,
            minimumRole,
            endpoint: req.path,
            method: req.method,
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        });

        return res.status(403).json({
          error: "Insufficient permissions",
          code: "FORBIDDEN",
          minimumRequired: minimumRole,
          current: userRole,
        });
      }

      next();
    } catch (error) {
      console.error("Minimum role middleware error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  };
}

/**
 * Middleware: Only allow users to access their own resources
 */
export function requireSelfOrAdmin(userIdParam: string = "id") {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
          code: "UNAUTHORIZED",
        });
      }

      const targetUserId = req.params[userIdParam] || req.body.userId;
      const userRole = req.user.role as Role;

      // Admins can access any resource
      if (userRole === Role.ADMIN) {
        return next();
      }

      // Check if accessing own resource
      if (req.user.id !== targetUserId) {
        await auditLog({
          userId: req.user.id,
          action: "RBAC_UNAUTHORIZED_ACCESS",
          description: `User attempted to access another user's resource`,
          details: {
            requestingUserId: req.user.id,
            targetUserId,
            endpoint: req.path,
            method: req.method,
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        });

        return res.status(403).json({
          error: "Can only access own resources",
          code: "FORBIDDEN",
        });
      }

      next();
    } catch (error) {
      console.error("Self-or-admin middleware error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  };
}

/**
 * Prevent role escalation attacks
 */
export function preventRoleEscalation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
    }

    const userRole = req.user.role as Role;
    const targetRole = req.body.role as Role;

    // If not changing role, allow
    if (!targetRole) {
      return next();
    }

    // Only admins can assign admin role
    if (targetRole === Role.ADMIN && userRole !== Role.ADMIN) {
      auditLog({
        userId: req.user.id,
        action: "ROLE_ESCALATION_ATTEMPT",
        description: `Non-admin user attempted to assign admin role`,
        details: {
          userRole,
          attemptedRole: targetRole,
          endpoint: req.path,
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return res.status(403).json({
        error: "Cannot assign admin role",
        code: "ROLE_ESCALATION_DENIED",
      });
    }

    // Users cannot elevate to a role higher than their own
    if (roleHierarchy[targetRole] > roleHierarchy[userRole]) {
      auditLog({
        userId: req.user.id,
        action: "ROLE_ESCALATION_ATTEMPT",
        description: `User attempted to assign higher role than their own`,
        details: {
          userRole,
          userLevel: roleHierarchy[userRole],
          attemptedRole: targetRole,
          attemptedLevel: roleHierarchy[targetRole],
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return res.status(403).json({
        error: "Cannot assign role higher than your own",
        code: "ROLE_ESCALATION_DENIED",
        yourRole: userRole,
        attemptedRole: targetRole,
      });
    }

    next();
  } catch (error) {
    console.error("Role escalation prevention error:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
}

/**
 * Get user's permissions
 */
export function getUserPermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if user can perform action on resource
 */
export function canAccessResource(
  userRole: Role,
  userId: string,
  resourceOwnerId: string,
  requiredPermission: Permission,
): boolean {
  // Admins can access everything
  if (userRole === Role.ADMIN) {
    return true;
  }

  // User accessing own resource
  if (userId === resourceOwnerId) {
    return hasPermission(userRole, requiredPermission);
  }

  // Check if role has permission for all resources
  const allResourcePermission = requiredPermission.replace(":own", ":all");
  return hasPermission(userRole, allResourcePermission as Permission);
}

export default {
  Role,
  Permission,
  hasPermission,
  hasMinimumRole,
  requireRole,
  requirePermission,
  requireMinimumRole,
  requireSelfOrAdmin,
  preventRoleEscalation,
  getUserPermissions,
  canAccessResource,
};
