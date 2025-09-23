import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { server, start } from "../../src/app";

describe("RPM Service", () => {
  beforeAll(async () => {
    if (!server.listening) await start();
  });
  afterAll(async () => {
    if (server.listening) await server.close();
  });

  it("GET /vitals/trends returns series array", async () => {
    const res = await server.inject({ method: "GET", url: "/vitals/trends" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(Array.isArray(body.series)).toBe(true);
  });

  it("GET /rpm/patients/:id/vitals returns structure", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/rpm/patients/123/vitals?days=7",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body).toHaveProperty("patientId");
    expect(body).toHaveProperty("vitals");
  });
});
