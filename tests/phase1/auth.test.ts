import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";

const buildUserPayload = (overrides: Record<string, unknown> = {}) => ({
  email: `test-${Math.random().toString(16).slice(2)}@example.com`,
  password: "TestPassword123!",
  firstName: "Test",
  lastName: "User",
  role: "patient",
  phone: "+15555550123",
  ...overrides,
});

describe("Authentication API", () => {
  let testApp: any;

  beforeEach(() => {
    testApp = global.testApp;
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user with valid data", async () => {
      const payload = buildUserPayload();

      const response = await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        message: "User registered successfully",
        user: {
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: payload.role,
        },
      });
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("rejects registration with invalid email", async () => {
      const payload = buildUserPayload({ email: "invalid-email" });

      const response = await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
      });
    });

    it("rejects registration with weak password", async () => {
      const payload = buildUserPayload({ password: "weak" });

      const response = await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });

    it("rejects registration with invalid role", async () => {
      const payload = buildUserPayload({ role: "invalid-role" });

      const response = await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });

    it("rejects duplicate email registration", async () => {
      const payload = buildUserPayload({ email: "duplicate@example.com" });

      await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(201);

      const response = await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(409);

      expect(response.body).toMatchObject({
        error: "User already exists",
        code: "USER_EXISTS",
      });
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with valid credentials", async () => {
      const payload = buildUserPayload();

      await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(201);

      const response = await request(testApp)
        .post("/api/auth/login")
        .send({ email: payload.email, password: payload.password })
        .expect(200);

      expect(response.body).toMatchObject({
        message: "Login successful",
        user: { email: payload.email },
      });
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("rejects login with unknown email", async () => {
      const response = await request(testApp)
        .post("/api/auth/login")
        .send({ email: "unknown@example.com", password: "TestPassword123!" })
        .expect(401);

      expect(response.body).toMatchObject({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    });

    it("rejects login with invalid password", async () => {
      const payload = buildUserPayload();

      await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(201);

      const response = await request(testApp)
        .post("/api/auth/login")
        .send({ email: payload.email, password: "WrongPassword123" })
        .expect(401);

      expect(response.body).toMatchObject({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    });

    it("rejects login with invalid email format", async () => {
      const response = await request(testApp)
        .post("/api/auth/login")
        .send({ email: "invalid-email", password: "TestPassword123!" })
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("refreshes the token with a valid refresh token", async () => {
      const payload = buildUserPayload();

      const registerResponse = await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(201);

      const response = await request(testApp)
        .post("/api/auth/refresh")
        .send({ refreshToken: registerResponse.body.refreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        message: "Token refreshed successfully",
      });
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it("rejects refresh with missing token", async () => {
      const response = await request(testApp)
        .post("/api/auth/refresh")
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        error: "Refresh token required",
        code: "REFRESH_TOKEN_MISSING",
      });
    });

    it("rejects refresh with invalid token", async () => {
      const response = await request(testApp)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" })
        .expect(401);

      expect(response.body).toMatchObject({
        error: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    });

    it("rejects refresh after logout", async () => {
      const payload = buildUserPayload();

      const registerResponse = await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(201);

      await request(testApp)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${registerResponse.body.token}`)
        .expect(200);

      const refreshResponse = await request(testApp)
        .post("/api/auth/refresh")
        .send({ refreshToken: registerResponse.body.refreshToken })
        .expect(401);

      expect(refreshResponse.body).toMatchObject({
        error: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    });
  });

  describe("POST /api/auth/logout", () => {
    it("logs out the current user and invalidates refresh token", async () => {
      const payload = buildUserPayload();

      const registerResponse = await request(testApp)
        .post("/api/auth/register")
        .send(payload)
        .expect(201);

      const response = await request(testApp)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${registerResponse.body.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        message: "Logout successful",
      });

      await request(testApp)
        .post("/api/auth/refresh")
        .send({ refreshToken: registerResponse.body.refreshToken })
        .expect(401);
    });

    it("rejects logout without an access token", async () => {
      const response = await request(testApp)
        .post("/api/auth/logout")
        .expect(401);

      expect(response.body).toMatchObject({
        error: "Access token required",
        code: "TOKEN_MISSING",
      });
    });
  });
});
