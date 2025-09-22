import type { Request } from "express";
import { Router } from "express";

import { env } from "../config/env";
import { metrics } from "../utils/metrics";

const router = Router();

const isLocalRequest = (ip: string | undefined) => {
  if (!ip) {
    return false;
  }

  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip);
};

const getClientIp = (reqIp: string, forwardedFor?: string | string[]) => {
  if (!forwardedFor) {
    return reqIp;
  }

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0];
  }

  const [first] = forwardedFor.split(",");
  return (first || reqIp).trim();
};

const authorizeMetrics = (req: Request) => {
  if (!metrics.isEnabled) {
    return false;
  }

  const token = env.metricsToken;
  const headerToken = req.get("x-metrics-token");
  const authHeader = req.get("authorization");
  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp = getClientIp(
    req.ip,
    forwardedFor as string | string[] | undefined,
  );

  if (token) {
    const bearer = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    if (token === headerToken || token === bearer) {
      return true;
    }

    return false;
  }

  if (env.metricsAllowedIps.length > 0) {
    return env.metricsAllowedIps.includes(clientIp);
  }

  return isLocalRequest(clientIp);
};

router.get("/metrics", async (req, res) => {
  if (!metrics.isEnabled) {
    return res.status(404).json({ error: "metrics_disabled" });
  }

  if (!authorizeMetrics(req)) {
    return res.status(403).json({ error: "metrics_access_denied" });
  }

  const body = await metrics.snapshot();

  res.setHeader("content-type", metrics.contentType);
  res.status(200).send(`${body}\n`);
});

export default router;
