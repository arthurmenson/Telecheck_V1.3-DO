import express from "express";
import type { RequestHandler } from "express";

import { allowDemoAuthBypass } from "../config/env";
import {
  getAllFeatureFlags,
  getFeatureFlagMetadata,
  setFeatureFlag,
} from "../config/featureFlags";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { AuditLogger } from "../utils/auditLogger";

const router = express.Router();

const demoBypassAuth: RequestHandler = (req, _res, next) => {
  if (!(req as AuthenticatedRequest).user) {
    (req as AuthenticatedRequest).user = {
      id: "demo-admin",
      email: "demo-admin@example.com",
      role: "admin",
    };
  }
  next();
};

const requireAuth = allowDemoAuthBypass
  ? demoBypassAuth
  : (authenticateToken as RequestHandler);

const requireAdmin: RequestHandler = (req, res, next) => {
  const role = (req as AuthenticatedRequest).user?.role;
  if (role !== "admin") {
    return res.status(403).json({
      error: "Administrator role required to manage feature flags",
    });
  }
  return next();
};

const coerceBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  return null;
};

router.get("/", requireAuth, requireAdmin, (_req, res) => {
  const flags = getAllFeatureFlags();
  const metadata = getFeatureFlagMetadata();

  res.json({
    flags,
    metadata,
  });
});

router.patch("/", requireAuth, requireAdmin, (req, res) => {
  const updates = req.body?.flags;

  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return res.status(400).json({
      error:
        "Request body must include a 'flags' object mapping keys to boolean values",
      code: "INVALID_PAYLOAD",
    });
  }

  const applied: Record<string, boolean> = {};
  const invalid: string[] = [];

  for (const [flag, rawValue] of Object.entries(updates)) {
    const coerced = coerceBoolean(rawValue);
    if (coerced === null) {
      invalid.push(flag);
      continue;
    }

    setFeatureFlag(flag, coerced);
    applied[flag] = coerced;
  }

  if (invalid.length > 0 && Object.keys(applied).length === 0) {
    return res.status(400).json({
      error: "No valid feature flag updates found",
      code: "INVALID_FLAG_VALUES",
      invalidFlags: invalid,
    });
  }

  const user = (req as AuthenticatedRequest).user;
  const actorId = user?.id ?? "unknown";

  for (const [flag, value] of Object.entries(applied)) {
    AuditLogger.logEvent({
      userId: actorId,
      action: "FEATURE_FLAG_UPDATED",
      resourceType: "feature_flag",
      resourceId: flag,
      details: { value },
      severity: "MEDIUM",
    });
  }

  const flags = getAllFeatureFlags();
  const metadata = getFeatureFlagMetadata();

  res.json({
    flags,
    metadata,
    updated: Object.keys(applied),
    invalid,
  });
});

export default router;
