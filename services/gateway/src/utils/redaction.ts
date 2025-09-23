/**
 * PII/PHI redaction utilities for logging and compliance
 */

import crypto from "crypto";

// PII/PHI patterns to redact
const PII_PATTERNS = [
  // Email patterns
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Phone patterns
  /\b(\+?1?[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g,
  // SSN patterns
  /\b\d{3}-?\d{2}-?\d{4}\b/g,
  // Credit card patterns (basic)
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  // Date of birth patterns
  /\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(19|20)\d{2}\b/g,
];

// Fields that should always be redacted
const REDACTED_FIELDS = [
  "password",
  "ssn",
  "socialSecurityNumber",
  "creditCard",
  "cardNumber",
  "cvv",
  "pin",
  "secret",
  "token",
  "apiKey",
  "privateKey",
  "dateOfBirth",
  "dob",
  "phoneNumber",
  "phone",
  "email",
  "emergencyContact",
  "address",
  "medicalRecordNumber",
  "patientId",
  "insuranceNumber",
  "memberNumber",
];

/**
 * Redact PII/PHI from a string
 */
export function redactString(text: string): string {
  if (!text || typeof text !== "string") {
    return text;
  }

  let redacted = text;

  // Apply pattern-based redaction
  for (const pattern of PII_PATTERNS) {
    redacted = redacted.replace(pattern, "[REDACTED]");
  }

  return redacted;
}

/**
 * Redact PII/PHI from an object
 */
export function redactObject(obj: any, depth = 0): any {
  // Prevent infinite recursion
  if (depth > 10) {
    return "[MAX_DEPTH_REACHED]";
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return redactString(obj);
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, depth + 1));
  }

  if (typeof obj === "object") {
    const redacted: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // Check if field should be completely redacted
      if (REDACTED_FIELDS.some((field) => lowerKey.includes(field))) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactObject(value, depth + 1);
      }
    }

    return redacted;
  }

  return obj;
}

/**
 * Redact PII from HTTP request object
 */
export function redactPII(req: any): any {
  if (!req) return req;

  const redacted = {
    id: req.id,
    method: req.method,
    url: redactString(req.url || ""),
    headers: redactObject({
      ...req.headers,
      authorization: req.headers?.authorization ? "[REDACTED]" : undefined,
      cookie: req.headers?.cookie ? "[REDACTED]" : undefined,
    }),
    query: redactObject(req.query),
    params: redactObject(req.params),
    body: redactObject(req.body),
    ip: hashIP(req.ip),
    hostname: req.hostname,
    protocol: req.protocol,
  };

  // Remove undefined fields
  return Object.fromEntries(
    Object.entries(redacted).filter(([_, value]) => value !== undefined),
  );
}

/**
 * Hash IP address for privacy while maintaining uniqueness for tracking
 */
export function hashIP(ip: string): string {
  if (!ip) return "";

  // Create a hash of the IP for privacy
  return crypto
    .createHash("sha256")
    .update(ip + process.env.IP_SALT || "default-salt")
    .digest("hex")
    .substring(0, 16);
}

/**
 * Redact sensitive data from error messages
 */
export function redactError(error: Error | any): any {
  if (!error) return error;

  return {
    name: error.name,
    message: redactString(error.message || ""),
    code: error.code,
    statusCode: error.statusCode,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === "development" && {
      stack: redactString(error.stack || ""),
    }),
  };
}

/**
 * Create a HIPAA-compliant audit log entry
 */
export function createAuditLogEntry(event: {
  userId?: string;
  action: string;
  resource: string;
  result: "success" | "failure";
  details?: any;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}): any {
  return {
    timestamp: new Date().toISOString(),
    userId: event.userId ? hashUserId(event.userId) : null,
    action: event.action,
    resource: redactString(event.resource),
    result: event.result,
    details: redactObject(event.details),
    ip: event.ip ? hashIP(event.ip) : null,
    userAgent: redactString(event.userAgent || ""),
    requestId: event.requestId,
    auditId: crypto.randomUUID(),
  };
}

/**
 * Hash user ID for audit logs while maintaining traceability
 */
function hashUserId(userId: string): string {
  return crypto
    .createHash("sha256")
    .update(userId + process.env.USER_ID_SALT || "default-user-salt")
    .digest("hex")
    .substring(0, 16);
}
