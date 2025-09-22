import express from "express";
import { allowDemoAuthBypass } from "../config/env";
import { dbPool } from "../config/database";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

const demoBypassAuth = (
  req: any,
  _res: express.Response,
  next: express.NextFunction,
) => {
  if (!req.user) {
    req.user = { id: "demo", role: "admin" };
  }
  next();
};

const requireAuth = allowDemoAuthBypass
  ? demoBypassAuth
  : (authenticateToken as express.RequestHandler);

const AUDIT_ROLES = new Set(["admin", "compliance", "security"]);

const requireAuditRole: express.RequestHandler = (req, res, next) => {
  const role = (req as any).user?.role as string | undefined;
  if (!role || !AUDIT_ROLES.has(role)) {
    return res.status(403).json({
      error: "Insufficient permissions to review audit logs",
      requiredRoles: Array.from(AUDIT_ROLES),
    });
  }
  next();
};

const parseDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const sanitizePagination = (rawPage?: string, rawPageSize?: string) => {
  const page = Math.max(parseInt(rawPage || "1", 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(rawPageSize || "50", 10) || 50, 1),
    500,
  );
  return { page, pageSize };
};

const ALLOWED_SEVERITIES = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

const buildFilters = (query: Record<string, unknown>) => {
  const clauses: string[] = [];
  const params: unknown[] = [];

  const push = (clause: string, value: unknown) => {
    clauses.push(`${clause} $${params.length + 1}`);
    params.push(value);
  };

  if (query.userId) {
    push("user_id =", query.userId);
  }

  if (query.category) {
    push("event_category =", query.category);
  }

  if (query.resourceType) {
    push("resource_type =", query.resourceType);
  }

  if (
    query.severity &&
    ALLOWED_SEVERITIES.has(String(query.severity).toUpperCase())
  ) {
    push("severity =", String(query.severity).toUpperCase());
  }

  const startDate = parseDate(query.start);
  if (startDate) {
    push("occurred_at >=", startDate);
  }

  const endDate = parseDate(query.end);
  if (endDate) {
    push("occurred_at <=", endDate);
  }

  if (query.search) {
    const term = `%${String(query.search).trim()}%`;
    const placeholder = `$${params.length + 1}`;
    clauses.push(
      `(operation ILIKE ${placeholder} OR resource_type ILIKE ${placeholder} OR resource_id ILIKE ${placeholder} OR payload::text ILIKE ${placeholder})`,
    );
    params.push(term);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
};

const mapRow = (row: any) => ({
  eventId: row.event_id,
  occurredAt: row.occurred_at,
  userId: row.user_id,
  category: row.event_category,
  operation: row.operation,
  resourceType: row.resource_type,
  resourceId: row.resource_id,
  severity: row.severity,
  ipAddress: row.ip_address,
  userAgent: row.user_agent,
  sessionId: row.session_id,
  payload: row.payload,
  compliance: row.compliance,
});

router.get("/", requireAuth, requireAuditRole, async (req, res) => {
  if (!dbPool) {
    return res.status(503).json({ error: "Database not configured" });
  }

  const { page, pageSize } = sanitizePagination(
    req.query.page as string | undefined,
    req.query.pageSize as string | undefined,
  );
  const offset = (page - 1) * pageSize;

  const { where, params } = buildFilters(req.query as Record<string, unknown>);

  try {
    const [rowsResult, countResult] = await Promise.all([
      dbPool.query(
        `SELECT event_id, occurred_at, user_id, event_category, operation, resource_type, resource_id, severity, ip_address, user_agent, session_id, payload, compliance FROM audit_logs ${where} ORDER BY occurred_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSize, offset],
      ),
      dbPool.query(
        `SELECT COUNT(*)::int AS total FROM audit_logs ${where}`,
        params,
      ),
    ]);

    const total = countResult.rows[0]?.total ?? 0;

    res.json({
      data: rowsResult.rows.map(mapRow),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error("Failed to fetch audit logs", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

router.get("/export", requireAuth, requireAuditRole, async (req, res) => {
  if (!dbPool) {
    return res.status(503).json({ error: "Database not configured" });
  }

  const format = String(req.query.format || "csv").toLowerCase();
  if (!["csv", "json"].includes(format)) {
    return res.status(400).json({ error: "Unsupported export format" });
  }

  const limit = Math.min(
    parseInt(String(req.query.limit || "5000"), 10) || 5000,
    10000,
  );
  const { where, params } = buildFilters(req.query as Record<string, unknown>);

  try {
    const result = await dbPool.query(
      `SELECT event_id, occurred_at, user_id, event_category, operation, resource_type, resource_id, severity, ip_address, user_agent, session_id, payload, compliance FROM audit_logs ${where} ORDER BY occurred_at DESC LIMIT $${params.length + 1}`,
      [...params, limit],
    );

    const logs = result.rows.map(mapRow);

    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=audit-logs.json",
      );
      return res.send(JSON.stringify({ data: logs }, null, 2));
    }

    const headers = [
      "event_id",
      "occurred_at",
      "user_id",
      "event_category",
      "operation",
      "resource_type",
      "resource_id",
      "severity",
      "ip_address",
      "user_agent",
      "session_id",
      "payload",
      "compliance",
    ];

    const rows = logs.map((log) =>
      [
        log.eventId,
        new Date(log.occurredAt).toISOString(),
        log.userId ?? "",
        log.category ?? "",
        log.operation ?? "",
        log.resourceType ?? "",
        log.resourceId ?? "",
        log.severity ?? "",
        log.ipAddress ?? "",
        log.userAgent ?? "",
        log.sessionId ?? "",
        log.payload ? JSON.stringify(log.payload) : "",
        log.compliance ? JSON.stringify(log.compliance) : "",
      ]
        .map((value) => {
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value ?? "");
        })
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=audit-logs.csv");
    return res.send(csv);
  } catch (error) {
    console.error("Failed to export audit logs", error);
    res.status(500).json({ error: "Failed to export audit logs" });
  }
});

export default router;
