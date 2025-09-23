import { describe, it, expect } from "vitest";
import { server } from "../../src/app";

describe("Gateway public routes", () => {
  it("returns health", async () => {
    const res = await server.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.status).toBe("healthy");
  });

  it("returns api docs", async () => {
    const res = await server.inject({ method: "GET", url: "/api/docs" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(Array.isArray(body.services)).toBe(true);
  });
});
