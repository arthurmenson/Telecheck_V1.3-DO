import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { server, start } from "../../src/app";

let started = false;

async function ensureServer() {
  if (!started) {
    await start();
    started = true;
  }
}

describe("Billing Service", () => {
  beforeAll(async () => {
    await ensureServer();
  });

  afterAll(async () => {
    if (server.server?.listening) {
      await server.close();
    }
    started = false;
  });

  it("POST /eligibility/270 generates an X12 payload", async () => {
    await ensureServer();
    const response = await server.inject({
      method: "POST",
      url: "/eligibility/270",
      payload: {
        subscriber: {
          firstName: "Jane",
          lastName: "Doe",
          memberId: "ABC12345",
          dob: "1980-05-01",
          gender: "F",
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as any;
    expect(body).toMatchObject({ status: "generated" });
    expect(typeof body.id).toBe("string");
    expect(body.x12Length).toBeGreaterThan(0);
  });

  it("POST /billing/837 queues claim for processing", async () => {
    await ensureServer();
    const response = await server.inject({
      method: "POST",
      url: "/billing/837",
      payload: { claimId: "CLM-123" },
    });

    expect(response.statusCode).toBe(202);
    const body = response.json() as any;
    expect(body).toMatchObject({ status: "queued" });
    expect(typeof body.id).toBe("string");
    expect(body.x12Length).toBeGreaterThan(0);
  });

  it("GET /health reports healthy status", async () => {
    await ensureServer();
    const response = await server.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    const body = response.json() as any;
    expect(body).toMatchObject({ status: "healthy", service: "billing" });
  });
});
