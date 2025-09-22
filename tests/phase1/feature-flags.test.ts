import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";

const buildAdminPayload = () => ({
  email: `admin-${Math.random().toString(16).slice(2)}@example.com`,
  password: "SecurePassword123!",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  phone: "+15555551212",
});

describe("Feature Flag API", () => {
  let testApp: any;
  let authToken: string;

  beforeEach(async () => {
    testApp = global.testApp;

    const payload = buildAdminPayload();
    const registerResponse = await request(testApp)
      .post("/api/auth/register")
      .send(payload)
      .expect(201);

    expect(registerResponse.body).toHaveProperty("token");
    authToken = registerResponse.body.token;
  });

  it("returns the current feature flag state for admins", async () => {
    const response = await request(testApp)
      .get("/api/feature-flags")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      flags: expect.any(Object),
      metadata: expect.objectContaining({
        totalFlags: expect.any(Number),
      }),
    });
  });

  it("allows admins to update feature flags and returns applied changes", async () => {
    const updateResponse = await request(testApp)
      .patch("/api/feature-flags")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        flags: {
          "beta-dashboard": true,
          "legacy-mode": false,
        },
      })
      .expect(200);

    expect(updateResponse.body.updated).toEqual(
      expect.arrayContaining(["beta-dashboard", "legacy-mode"]),
    );
    expect(updateResponse.body.flags).toMatchObject({
      "beta-dashboard": true,
      "legacy-mode": false,
    });
  });

  it("rejects invalid payloads without changing feature flags", async () => {
    const response = await request(testApp)
      .patch("/api/feature-flags")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ flags: { "beta-dashboard": "definitely" } })
      .expect(400);

    expect(response.body).toMatchObject({
      code: "INVALID_FLAG_VALUES",
    });
  });

  it("requires authentication", async () => {
    await request(testApp).get("/api/feature-flags").expect(401);
  });
});
