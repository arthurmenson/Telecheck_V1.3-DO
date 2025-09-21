import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { getTestPool } from "../utils/database";
import { getTestRedisClient } from "../utils/redis";

describe("Authentication API", () => {
  let testApp: any;
  let authToken: string;
  let refreshToken: string;
  let userId: string;

  beforeEach(async () => {
    testApp = global.testApp;
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user with valid data", async () => {
      const userData = {
        email: "test@example.com",
        password: "TestPassword123",
        firstName: "John",
        lastName: "Doe",
        role: "patient",
        phone: "+1234567890",
      };

      const response = await request(testApp)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully",
      );
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
      expect(response.body.user.lastName).toBe(userData.lastName);
      expect(response.body.user.role).toBe(userData.role);

      // Store for other tests
      authToken = response.body.token;
      refreshToken = response.body.refreshToken;
      userId = response.body.user.id;
    });

    it("should reject registration with invalid email", async () => {
      const userData = {
        email: "invalid-email",
        password: "TestPassword123",
        firstName: "John",
        lastName: "Doe",
        role: "patient",
      };

      const response = await request(testApp)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
      expect(response.body).toHaveProperty("code", "VALIDATION_ERROR");
    });

    it("should reject registration with weak password", async () => {
      const userData = {
        email: "test2@example.com",
        password: "weak",
        firstName: "John",
        lastName: "Doe",
        role: "patient",
      };

      const response = await request(testApp)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });

    it("should reject registration with invalid role", async () => {
      const userData = {
        email: "test3@example.com",
        password: "TestPassword123",
        firstName: "John",
        lastName: "Doe",
        role: "invalid-role",
      };

      const response = await request(testApp)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });

    it("should reject duplicate email registration", async () => {
      const userData = {
        email: "test@example.com",
        password: "TestPassword123",
        firstName: "Jane",
        lastName: "Doe",
        role: "patient",
      };

      const response = await request(testApp)
        .post("/api/auth/register")
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty("error", "User already exists");
      expect(response.body).toHaveProperty("code", "USER_EXISTS");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "TestPassword123",
      };

      const response = await request(testApp)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user.email).toBe(loginData.email);
    });

    it("should reject login with invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "TestPassword123",
      };

      const response = await request(testApp)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("error", "Invalid credentials");
      expect(response.body).toHaveProperty("code", "INVALID_CREDENTIALS");
    });

    it("should reject login with invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "WrongPassword123",
      };

      const response = await request(testApp)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("error", "Invalid credentials");
      expect(response.body).toHaveProperty("code", "INVALID_CREDENTIALS");
    });

    it("should reject login with invalid email format", async () => {
      const loginData = {
        email: "invalid-email",
        password: "TestPassword123",
      };

      const response = await request(testApp)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh token with valid refresh token", async () => {
      const response = await request(testApp)
        .post("/api/auth/refresh")
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Token refreshed successfully",
      );
      expect(response.body).toHaveProperty("token");
      expect(response.body.token).not.toBe(authToken); // Should be different
    });

    it("should reject refresh with missing token", async () => {
      const response = await request(testApp)
        .post("/api/auth/refresh")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error", "Refresh token required");
      expect(response.body).toHaveProperty("code", "REFRESH_TOKEN_MISSING");
    });

    it("should reject refresh with invalid token", async () => {
      const response = await request(testApp)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" })
        .expect(401);

      expect(response.body).toHaveProperty("error", "Invalid refresh token");
      expect(response.body).toHaveProperty("code", "INVALID_REFRESH_TOKEN");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully with valid token", async () => {
      const response = await request(testApp)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Logout successful");
    });

    it("should reject logout without token", async () => {
      const response = await request(testApp)
        .post("/api/auth/logout")
        .expect(401);

      expect(response.body).toHaveProperty("error", "Access token required");
      expect(response.body).toHaveProperty("code", "TOKEN_MISSING");
    });

    it("should reject logout with invalid token", async () => {
      const response = await request(testApp)
        .post("/api/auth/logout")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body).toHaveProperty("error", "Invalid token");
      expect(response.body).toHaveProperty("code", "TOKEN_INVALID");
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should send password reset for existing user", async () => {
      const response = await request(testApp)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" })
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Password reset link sent",
      );
      expect(response.body).toHaveProperty("resetToken");
    });

    it("should not reveal if user exists for non-existent email", async () => {
      const response = await request(testApp)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" })
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "If an account with that email exists, a password reset link has been sent",
      );
    });

    it("should reject with invalid email format", async () => {
      const response = await request(testApp)
        .post("/api/auth/forgot-password")
        .send({ email: "invalid-email" })
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should reset password with valid token", async () => {
      // First get a reset token
      const forgotResponse = await request(testApp)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" });

      const resetToken = forgotResponse.body.resetToken;

      const response = await request(testApp)
        .post("/api/auth/reset-password")
        .send({
          token: resetToken,
          newPassword: "NewPassword123",
        })
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Password reset successfully",
      );
    });

    it("should reject reset with missing fields", async () => {
      const response = await request(testApp)
        .post("/api/auth/reset-password")
        .send({ token: "some-token" })
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Token and new password required",
      );
      expect(response.body).toHaveProperty("code", "MISSING_FIELDS");
    });

    it("should reject reset with invalid token", async () => {
      const response = await request(testApp)
        .post("/api/auth/reset-password")
        .send({
          token: "invalid-token",
          newPassword: "NewPassword123",
        })
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Invalid or expired reset token",
      );
      expect(response.body).toHaveProperty("code", "INVALID_RESET_TOKEN");
    });
  });

  describe("GET /api/auth/profile", () => {
    it("should get user profile with valid token", async () => {
      const response = await request(testApp)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("email");
      expect(response.body.user).toHaveProperty("firstName");
      expect(response.body.user).toHaveProperty("lastName");
      expect(response.body.user).toHaveProperty("role");
    });

    it("should reject profile access without token", async () => {
      const response = await request(testApp)
        .get("/api/auth/profile")
        .expect(401);

      expect(response.body).toHaveProperty("error", "Access token required");
      expect(response.body).toHaveProperty("code", "TOKEN_MISSING");
    });

    it("should reject profile access with invalid token", async () => {
      const response = await request(testApp)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body).toHaveProperty("error", "Invalid token");
      expect(response.body).toHaveProperty("code", "TOKEN_INVALID");
    });
  });

  describe("PUT /api/auth/profile", () => {
    it("should update user profile with valid data", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith",
        phone: "+1987654321",
      };

      const response = await request(testApp)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Profile updated successfully",
      );
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.firstName).toBe(updateData.firstName);
      expect(response.body.user.lastName).toBe(updateData.lastName);
      expect(response.body.user.phone).toBe(updateData.phone);
    });

    it("should reject profile update with invalid phone number", async () => {
      const updateData = {
        phone: "invalid-phone",
      };

      const response = await request(testApp)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Validation failed");
    });

    it("should reject profile update without token", async () => {
      const updateData = {
        firstName: "Jane",
      };

      const response = await request(testApp)
        .put("/api/auth/profile")
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty("error", "Access token required");
    });
  });
});
