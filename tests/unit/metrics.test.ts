import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = {
  METRICS_ENABLED: process.env.METRICS_ENABLED,
  METRICS_TOKEN: process.env.METRICS_TOKEN,
  METRICS_ALLOWED_IPS: process.env.METRICS_ALLOWED_IPS,
};

const buildApp = async () => {
  const metricsModule = await import("../../server/utils/metrics");
  metricsModule.metrics.resetForTests();

  const { metricsMiddleware } = await import("../../server/middleware/metrics");
  const internalRoutesModule = await import("../../server/routes/internal");
  const internalRouter = internalRoutesModule.default;

  const app = express();
  app.use(metricsMiddleware);
  app.use("/internal", internalRouter);
  app.get("/api/example/:patientId", (_req, res) => {
    res.status(204).end();
  });

  return { app, metrics: metricsModule.metrics };
};

describe("metrics instrumentation", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NODE_ENV = "test";
    delete process.env.METRICS_ENABLED;
    delete process.env.METRICS_TOKEN;
    delete process.env.METRICS_ALLOWED_IPS;
  });

  afterEach(() => {
    if (ORIGINAL_ENV.METRICS_ENABLED) {
      process.env.METRICS_ENABLED = ORIGINAL_ENV.METRICS_ENABLED;
    } else {
      delete process.env.METRICS_ENABLED;
    }

    if (ORIGINAL_ENV.METRICS_TOKEN) {
      process.env.METRICS_TOKEN = ORIGINAL_ENV.METRICS_TOKEN;
    } else {
      delete process.env.METRICS_TOKEN;
    }

    if (ORIGINAL_ENV.METRICS_ALLOWED_IPS) {
      process.env.METRICS_ALLOWED_IPS = ORIGINAL_ENV.METRICS_ALLOWED_IPS;
    } else {
      delete process.env.METRICS_ALLOWED_IPS;
    }
  });

  it("returns 404 when metrics are disabled", async () => {
    process.env.METRICS_ENABLED = "false";
    const { app } = await buildApp();

    const response = await request(app).get("/internal/metrics");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: "metrics_disabled" });
  });

  it("allows loopback scrapes when metrics are enabled", async () => {
    process.env.METRICS_ENABLED = "true";
    const { app } = await buildApp();

    await request(app).get("/api/example/123").expect(204);

    const response = await request(app).get("/internal/metrics");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/plain");
    expect(response.text).toContain("telecheck_http_requests_total");
    expect(response.text).toContain('route="/api/example/:id"');
  });

  it("requires a token when METRICS_TOKEN is configured", async () => {
    process.env.METRICS_ENABLED = "true";
    process.env.METRICS_TOKEN = "metrics-secret";
    const { app } = await buildApp();

    const denied = await request(app).get("/internal/metrics");
    expect(denied.status).toBe(403);
    expect(denied.body).toMatchObject({ error: "metrics_access_denied" });

    const allowed = await request(app)
      .get("/internal/metrics")
      .set("Authorization", "Bearer metrics-secret");

    expect(allowed.status).toBe(200);
    expect(allowed.text).toContain("telecheck_metrics_last_snapshot");
  });
});
