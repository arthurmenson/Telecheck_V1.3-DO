/**
 * Audit Logging Service
 *
 * Provides centralized audit logging functionality for security events,
 * user actions, and system activities. All logs are stored in the audit_logs table.
 *
 * @module services/auditService
 */

import { Pool } from "pg";

// Lazy load dbPool to avoid import errors when database is not configured
let dbPool: Pool | null = null;
try {
  const dbModule = await import("../config/database.js");
  dbPool = dbModule.dbPool || dbModule.default;
} catch (error) {
  console.warn("[AUDIT] Database not configured, audit logging disabled");
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  userId?: string;
  action: string;
  description?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: "info" | "warning" | "error" | "critical";
  category?:
    | "authentication"
    | "authorization"
    | "data_access"
    | "data_modification"
    | "system"
    | "security";
}

/**
 * Audit action types
 */
export enum AuditAction {
  // Authentication events
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGOUT = "LOGOUT",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_COMPLETE = "PASSWORD_RESET_COMPLETE",
  MFA_ENABLED = "MFA_ENABLED",
  MFA_DISABLED = "MFA_DISABLED",

  // Authorization events
  RBAC_PERMISSION_GRANTED = "RBAC_PERMISSION_GRANTED",
  RBAC_PERMISSION_DENIED = "RBAC_PERMISSION_DENIED",
  ROLE_ESCALATION_ATTEMPT = "ROLE_ESCALATION_ATTEMPT",
  UNAUTHORIZED_ACCESS_ATTEMPT = "UNAUTHORIZED_ACCESS_ATTEMPT",

  // User management
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_DELETED = "USER_DELETED",
  USER_DEACTIVATED = "USER_DEACTIVATED",
  USER_REACTIVATED = "USER_REACTIVATED",
  USER_ROLE_CHANGED = "USER_ROLE_CHANGED",
  USER_INVITED = "USER_INVITED",

  // Data access
  PATIENT_DATA_ACCESSED = "PATIENT_DATA_ACCESSED",
  MEDICAL_RECORD_VIEWED = "MEDICAL_RECORD_VIEWED",
  LAB_RESULTS_VIEWED = "LAB_RESULTS_VIEWED",
  PRESCRIPTION_VIEWED = "PRESCRIPTION_VIEWED",

  // Data modification
  PATIENT_DATA_CREATED = "PATIENT_DATA_CREATED",
  PATIENT_DATA_UPDATED = "PATIENT_DATA_UPDATED",
  PATIENT_DATA_DELETED = "PATIENT_DATA_DELETED",
  PRESCRIPTION_CREATED = "PRESCRIPTION_CREATED",
  PRESCRIPTION_MODIFIED = "PRESCRIPTION_MODIFIED",

  // System events
  SYSTEM_CONFIG_CHANGED = "SYSTEM_CONFIG_CHANGED",
  SECURITY_SETTING_CHANGED = "SECURITY_SETTING_CHANGED",
  ENCRYPTION_KEY_ROTATED = "ENCRYPTION_KEY_ROTATED",
  BACKUP_CREATED = "BACKUP_CREATED",
  BACKUP_RESTORED = "BACKUP_RESTORED",

  // Security events
  BRUTE_FORCE_DETECTED = "BRUTE_FORCE_DETECTED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",
  CSRF_VIOLATION = "CSRF_VIOLATION",
}

/**
 * Log an audit entry to the database
 *
 * @param entry - Audit log entry details
 * @returns Promise resolving to the created audit log ID
 */
export async function auditLog(entry: AuditLogEntry): Promise<string | null> {
  try {
    // If database is not configured, just log to console
    if (!dbPool) {
      console.log("[AUDIT]", JSON.stringify(entry));
      return null;
    }

    const {
      userId = null,
      action,
      description = null,
      details = null,
      ipAddress = null,
      userAgent = null,
      severity = "info",
      category = "system",
    } = entry;

    // Sanitize sensitive data from details
    const sanitizedDetails = sanitizeDetails(details);

    const result = await dbPool.query(
      `INSERT INTO audit_logs
       (user_id, action, description, details, ip_address, user_agent, severity, category, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        userId,
        action,
        description,
        sanitizedDetails ? JSON.stringify(sanitizedDetails) : null,
        ipAddress,
        userAgent,
        severity,
        category,
      ],
    );

    // For critical security events, also log to console
    if (severity === "critical" || severity === "error") {
      console.error("[AUDIT]", {
        severity,
        action,
        userId,
        description,
        timestamp: new Date().toISOString(),
      });
    }

    return result.rows[0]?.id || null;
  } catch (error) {
    // Log audit failures to console but don't throw
    // We don't want audit logging failures to break application functionality
    console.error("[AUDIT ERROR] Failed to write audit log:", error);
    console.error("[AUDIT ERROR] Entry:", entry);
    return null;
  }
}

/**
 * Sanitize details object to remove sensitive information
 *
 * @param details - Details object to sanitize
 * @returns Sanitized details object
 */
function sanitizeDetails(
  details: Record<string, any> | null,
): Record<string, any> | null {
  if (!details) return null;

  const sanitized = { ...details };

  // Remove sensitive fields
  const sensitiveFields = [
    "password",
    "passwordHash",
    "password_hash",
    "currentPassword",
    "newPassword",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
    "apiKey",
    "privateKey",
    "ssn",
    "creditCard",
    "cvv",
  ];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeDetails(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Query audit logs with filters
 *
 * @param filters - Query filters
 * @returns Promise resolving to array of audit logs
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  action?: string;
  category?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  try {
    // If database is not configured, return empty array
    if (!dbPool) {
      console.warn("[AUDIT] Database not configured, cannot query logs");
      return [];
    }

    const {
      userId,
      action,
      category,
      severity,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = filters;

    let query = `
      SELECT
        al.id,
        al.user_id,
        al.action,
        al.description,
        al.details,
        al.ip_address,
        al.user_agent,
        al.severity,
        al.category,
        al.timestamp,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.role as user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (userId) {
      query += ` AND al.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (action) {
      query += ` AND al.action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    if (category) {
      query += ` AND al.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (severity) {
      query += ` AND al.severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND al.timestamp >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND al.timestamp <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY al.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await dbPool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("[AUDIT ERROR] Failed to query audit logs:", error);
    throw error;
  }
}

/**
 * Get audit statistics
 *
 * @param userId - Optional user ID to filter by
 * @param days - Number of days to look back (default: 30)
 * @returns Promise resolving to audit statistics
 */
export async function getAuditStats(
  userId?: string,
  days: number = 30,
): Promise<any> {
  try {
    // If database is not configured, return default stats
    if (!dbPool) {
      return {
        total_events: 0,
        unique_users: 0,
        critical_events: 0,
        error_events: 0,
        warning_events: 0,
        auth_events: 0,
        authz_events: 0,
        security_events: 0,
        failed_attempts: 0,
      };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = `
      SELECT
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_events,
        COUNT(CASE WHEN severity = 'error' THEN 1 END) as error_events,
        COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning_events,
        COUNT(CASE WHEN category = 'authentication' THEN 1 END) as auth_events,
        COUNT(CASE WHEN category = 'authorization' THEN 1 END) as authz_events,
        COUNT(CASE WHEN category = 'security' THEN 1 END) as security_events,
        COUNT(CASE WHEN action LIKE '%_DENIED' OR action LIKE '%_ATTEMPT' THEN 1 END) as failed_attempts
      FROM audit_logs
      WHERE timestamp >= $1
    `;

    const params: any[] = [startDate];

    if (userId) {
      query += ` AND user_id = $2`;
      params.push(userId);
    }

    const result = await dbPool.query(query, params);
    return result.rows[0];
  } catch (error) {
    console.error("[AUDIT ERROR] Failed to get audit stats:", error);
    throw error;
  }
}

/**
 * Get recent security events
 *
 * @param limit - Number of events to return
 * @returns Promise resolving to array of recent security events
 */
export async function getRecentSecurityEvents(
  limit: number = 50,
): Promise<any[]> {
  return queryAuditLogs({
    category: "security",
    limit,
    offset: 0,
  });
}

/**
 * Delete old audit logs (for retention policy)
 *
 * @param retentionDays - Number of days to retain logs
 * @returns Promise resolving to number of deleted rows
 */
export async function cleanupOldAuditLogs(
  retentionDays: number = 365,
): Promise<number> {
  try {
    // If database is not configured, return 0
    if (!dbPool) {
      console.warn("[AUDIT] Database not configured, cannot cleanup logs");
      return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await dbPool.query(
      `DELETE FROM audit_logs WHERE timestamp < $1 AND severity != 'critical'`,
      [cutoffDate],
    );

    const deletedCount = result.rowCount || 0;

    // Log the cleanup action
    await auditLog({
      action: AuditAction.SYSTEM_CONFIG_CHANGED,
      description: `Cleaned up ${deletedCount} audit logs older than ${retentionDays} days`,
      severity: "info",
      category: "system",
    });

    return deletedCount;
  } catch (error) {
    console.error("[AUDIT ERROR] Failed to cleanup old audit logs:", error);
    throw error;
  }
}

export default {
  auditLog,
  queryAuditLogs,
  getAuditStats,
  getRecentSecurityEvents,
  cleanupOldAuditLogs,
  AuditAction,
};
