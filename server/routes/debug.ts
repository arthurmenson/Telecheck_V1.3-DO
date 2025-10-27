/**
 * Debug Routes - TEMPORARY FOR TROUBLESHOOTING
 *
 * ⚠️ REMOVE IN PRODUCTION! These endpoints expose environment info
 */

import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/debug/env-check
 *
 * Checks which environment variables are available
 * WITHOUT exposing their actual values
 */
router.get("/env-check", (req: Request, res: Response) => {
  const envChecks = {
    // Database
    DATABASE_URL: !!process.env.DATABASE_URL,
    DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,

    // OAuth
    OAUTH_ENABLED: process.env.OAUTH_ENABLED,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    KEYCLOAK_CLIENT_ID: !!process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET: !!process.env.KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_AUTH_SERVER_URL: !!process.env.KEYCLOAK_AUTH_SERVER_URL,

    // Other secrets
    JWT_SECRET: !!process.env.JWT_SECRET,
    REDIS_URL: !!process.env.REDIS_URL,

    // Debug info
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  res.json({
    message: "Environment variable check (values hidden for security)",
    checks: envChecks,
    note: "⚠️ This endpoint should be removed in production",
  });
});

/**
 * GET /api/debug/keycloak-config
 *
 * Shows Keycloak configuration status (without secrets)
 */
router.get("/keycloak-config", (req: Request, res: Response) => {
  const keycloakConfig = {
    KEYCLOAK_URL: process.env.KEYCLOAK_URL || "not set",
    KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || "not set",
    KEYCLOAK_CLIENT_ID_present: !!process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET_present: !!process.env.KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_AUTH_SERVER_URL_present: !!process.env.KEYCLOAK_AUTH_SERVER_URL,
    KEYCLOAK_CALLBACK_URL: process.env.KEYCLOAK_CALLBACK_URL || "not set",

    // Computed status
    keycloak_enabled: !!(
      process.env.KEYCLOAK_CLIENT_ID && process.env.KEYCLOAK_CLIENT_SECRET
    ),
  };

  res.json({
    message: "Keycloak configuration status",
    config: keycloakConfig,
    note: "⚠️ This endpoint should be removed in production",
  });
});

export default router;
