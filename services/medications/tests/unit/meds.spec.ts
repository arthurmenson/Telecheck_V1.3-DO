import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { server, start } from "../../src/app";

describe("Medications Service", () => {
  beforeAll(async () => {
    if (!server.listening) await start();
  });
  afterAll(async () => {
    if (server.listening) await server.close();
  });

  it("GET /medications returns items array", async () => {
    const res = await server.inject({ method: "GET", url: "/medications" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body).toHaveProperty("items");
    expect(Array.isArray(body.items)).toBe(true);
  });

  it("GET /medications/interactions returns expected interaction", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/medications/interactions?drugA=lipitor&drugB=warfarin",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.interactions?.[0]?.severity).toBe("major");
  });

  it("GET /medications/search returns lipitor when q matches", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/medications/search?q=lipitor",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.items?.[0]?.id).toBe("lipitor");
  });
});
