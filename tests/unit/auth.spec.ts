import { describe, it, expect, beforeEach, vi } from "vitest";
import express from "express";
import request from "supertest";
import bcrypt from "bcryptjs";

vi.mock("../../server/config/database", () => {
  return {
    dbPool: { query: vi.fn() },
  };
});

vi.mock("../../server/utils/redisSafe", () => {
  return {
    safeSetEx: vi.fn(async () => {}),
    safeGet: vi.fn(async () => null),
    safeDel: vi.fn(async () => {}),
  };
});

// Import after mocks
import authRoutes from "../../server/routes/auth";
import { dbPool } from "../../server/config/database";
import * as redisSafe from "../../server/utils/redisSafe";

describe("Auth routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  function makeApp() {
    const app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes as any);
    return app;
  }

  it("registers a new user and returns tokens", async () => {
    const app = makeApp();
    const email = "new@example.com";
    (dbPool.query as any)
      .mockResolvedValueOnce({ rows: [] }) // user exists check
      .mockResolvedValueOnce({
        rows: [
          {
            id: "u1",
            email,
            first_name: "New",
            last_name: "User",
            role: "patient",
          },
        ],
      }); // insert

    const res = await request(app).post("/api/auth/register").send({
      email,
      password: "Passw0rd!",
      firstName: "New",
      lastName: "User",
      role: "patient",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });

  it("logs in, then refreshes token", async () => {
    const app = makeApp();
    const email = "login@example.com";
    const hash = await bcrypt.hash("Passw0rd!", 10);
    (dbPool.query as any)
      .mockResolvedValueOnce({
        rows: [
          {
            id: "u2",
            email,
            password_hash: hash,
            first_name: "A",
            last_name: "B",
            role: "patient",
            is_active: true,
          },
        ],
      }) // login select
      .mockResolvedValueOnce({}); // update last_login

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Passw0rd!" });
    expect(login.status).toBe(200);
    const refreshToken = login.body.refreshToken;
    expect(refreshToken).toBeTruthy();

    vi.spyOn(redisSafe, "safeGet").mockResolvedValue(refreshToken);
    (dbPool.query as any).mockResolvedValueOnce({
      rows: [
        {
          id: "u2",
          email,
          first_name: "A",
          last_name: "B",
          role: "patient",
          is_active: true,
        },
      ],
    }); // user by id

    const refresh = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken });
    expect(refresh.status).toBe(200);
    expect(refresh.body.token).toBeTruthy();
  });
});
