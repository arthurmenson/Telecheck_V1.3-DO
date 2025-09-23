import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { server, start } from "../../src/app";

describe("Labs Service", () => {
  beforeAll(async () => {
    if (!server.listening) {
      await start();
    }
  });

  afterAll(async () => {
    if (server.listening) {
      await server.close();
    }
  });

  it("GET /labs/results returns empty results", async () => {
    const res = await server.inject({ method: "GET", url: "/labs/results" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
  });

  it("POST /labs/analyze returns analysisId", async () => {
    const res = await server.inject({ method: "POST", url: "/labs/analyze" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body).toMatchObject({ analysisId: "a1", status: "ok" });
  });

  it("GET /labs/analysis returns status", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/labs/analysis?id=a1",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body).toHaveProperty("status");
  });
});
