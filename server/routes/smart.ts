import { Router, Response } from "express";

const router = Router();

// SMART on FHIR discovery
router.get("/.well-known/smart-configuration", (_req, res: Response) => {
  res.json({
    issuer: process.env.SMART_ISSUER || "http://localhost:3001/api/smart",
    authorization_endpoint: "/api/smart/authorize",
    token_endpoint: "/api/smart/token",
    introspection_endpoint: "/api/smart/introspect",
    scopes_supported: [
      "launch/patient",
      "patient/*.read",
      "patient/*.write",
      "openid",
      "fhirUser",
      "offline_access",
    ],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "client_credentials"],
  });
});

// Authorization endpoint (stub)
router.get("/authorize", (req, res: Response) => {
  const { redirect_uri, state } = req.query as any;
  const code = `auth_${Date.now()}`;
  const url = new URL(redirect_uri);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state);
  res.redirect(url.toString());
});

// Token endpoint (stub)
router.post("/token", (req, res: Response) => {
  res.json({
    access_token: `smart_${Date.now()}`,
    token_type: "Bearer",
    expires_in: 3600,
    scope: "patient/*.read",
    patient: "demo-patient",
  });
});

// Introspection endpoint (stub)
router.post("/introspect", (req, res: Response) => {
  res.json({ active: true });
});

export default router;
