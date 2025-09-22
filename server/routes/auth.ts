import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { dbPool } from "../config/database";
import { redisClient } from "../config/database";
import {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validateUpdateProfile,
} from "../middleware/validation";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret";

type MemoryUserRecord = {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  last_login_at: Date | null;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  created_at: Date;
  updated_at: Date;
};

const useInMemoryStore = !dbPool;
const memoryUsersById = useInMemoryStore
  ? new Map<string, MemoryUserRecord>()
  : null;
const memoryUsersByEmail = useInMemoryStore
  ? new Map<string, MemoryUserRecord>()
  : null;

type RefreshTokenStore = {
  set: (userId: string, token: string) => Promise<void>;
  validate: (userId: string, token: string) => Promise<boolean>;
  delete: (userId: string) => Promise<void>;
  clear?: () => Promise<void>;
};

const createRefreshTokenStore = (
  client: typeof redisClient | null,
): RefreshTokenStore => {
  if (client && typeof client.setEx === "function") {
    return {
      async set(userId: string, token: string) {
        await client.setEx(
          `refresh_token:${userId}`,
          REFRESH_TOKEN_TTL_SECONDS,
          token,
        );
      },
      async validate(userId: string, token: string) {
        const stored = await client.get(`refresh_token:${userId}`);
        return stored === token;
      },
      async delete(userId: string) {
        await client.del(`refresh_token:${userId}`);
      },
      async clear() {
        if (typeof client.keys !== "function") {
          return;
        }

        const keys = await client.keys("refresh_token:*");
        if (keys.length > 0) {
          await client.del(...keys);
        }
      },
    };
  }

  const store = new Map<string, Array<{ value: string; expiresAt: number }>>();
  return {
    async set(userId: string, token: string) {
      const entries = store.get(userId) ?? [];
      entries.push({
        value: token,
        expiresAt: Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000,
      });
      store.set(userId, entries);
    },
    async validate(userId: string, token: string) {
      const entries = store.get(userId);
      if (!entries) {
        return false;
      }

      const now = Date.now();
      const validEntries = entries.filter((entry) => entry.expiresAt > now);

      if (validEntries.length !== entries.length) {
        store.set(userId, validEntries);
      }

      return validEntries.some((entry) => entry.value === token);
    },
    async delete(userId: string) {
      store.delete(userId);
    },
    async clear() {
      store.clear();
    },
  };
};

const refreshTokens = createRefreshTokenStore(redisClient ?? null);

const getMemoryUserByEmail = (email: string): MemoryUserRecord | null => {
  if (!memoryUsersByEmail) {
    return null;
  }

  return memoryUsersByEmail.get(email.toLowerCase()) ?? null;
};

const getMemoryUserById = (id: string): MemoryUserRecord | null => {
  if (!memoryUsersById) {
    return null;
  }

  return memoryUsersById.get(id) ?? null;
};

const persistMemoryUser = (user: MemoryUserRecord) => {
  if (!memoryUsersById || !memoryUsersByEmail) {
    return;
  }

  memoryUsersById.set(user.id, user);
  memoryUsersByEmail.set(user.email.toLowerCase(), user);
};

const toSerializableDate = (value: unknown) =>
  value instanceof Date ? value.toISOString() : (value ?? null);

const buildPublicUser = (user: MemoryUserRecord | any) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  role: user.role,
  phone: user.phone ?? null,
});

const buildProfileUser = (user: MemoryUserRecord | any) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  role: user.role,
  phone: user.phone ?? null,
  avatarUrl: user.avatar_url ?? null,
  lastLoginAt: toSerializableDate(user.last_login_at),
  createdAt: toSerializableDate(user.created_at),
  updatedAt: toSerializableDate(user.updated_at),
});

const signAccessToken = (user: { id: string; email: string; role: string }) =>
  jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: "24h" },
  );

const signRefreshToken = (userId: string) =>
  jwt.sign({ userId, type: "refresh" }, getJwtSecret(), { expiresIn: "7d" });

// Register new user
router.post(
  "/register",
  validateRegister,
  async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, role, phone } = req.body;
      const normalizedEmail = String(email).toLowerCase();

      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      if (!dbPool) {
        const existingUser = getMemoryUserByEmail(normalizedEmail);
        if (existingUser) {
          return res.status(409).json({
            error: "User already exists",
            code: "USER_EXISTS",
          });
        }

        const now = new Date();
        const newUser: MemoryUserRecord = {
          id: uuidv4(),
          email: normalizedEmail,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          role,
          phone: phone ?? null,
          avatar_url: null,
          is_active: true,
          last_login_at: null,
          password_reset_token: null,
          password_reset_expires: null,
          created_at: now,
          updated_at: now,
        };

        persistMemoryUser(newUser);

        const token = signAccessToken(newUser);
        const refreshToken = signRefreshToken(newUser.id);
        await refreshTokens.set(newUser.id, refreshToken);

        res.status(201).json({
          message: "User registered successfully",
          user: buildPublicUser(newUser),
          token,
          refreshToken,
        });
        return;
      }

      const existingUser = await dbPool.query(
        "SELECT id FROM users WHERE email = $1",
        [normalizedEmail],
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          error: "User already exists",
          code: "USER_EXISTS",
        });
      }

      const result = await dbPool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, created_at`,
        [normalizedEmail, passwordHash, firstName, lastName, role, phone],
      );

      const user = result.rows[0];

      const token = signAccessToken(user);
      const refreshToken = signRefreshToken(user.id);
      await refreshTokens.set(user.id, refreshToken);

      res.status(201).json({
        message: "User registered successfully",
        user: buildPublicUser(user),
        token,
        refreshToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Login user
router.post("/login", validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email).toLowerCase();

    if (!dbPool) {
      const user = getMemoryUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          error: "Account is deactivated",
          code: "ACCOUNT_DEACTIVATED",
        });
      }

      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isValidPassword) {
        return res.status(401).json({
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      }

      const updatedUser: MemoryUserRecord = {
        ...user,
        last_login_at: new Date(),
        updated_at: new Date(),
      };
      persistMemoryUser(updatedUser);

      const token = signAccessToken(updatedUser);
      const refreshToken = signRefreshToken(updatedUser.id);
      await refreshTokens.set(updatedUser.id, refreshToken);

      res.json({
        message: "Login successful",
        user: buildPublicUser(updatedUser),
        token,
        refreshToken,
      });
      return;
    }

    const result = await dbPool.query(
      "SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1",
      [normalizedEmail],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    await dbPool.query(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id],
    );

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user.id);
    await refreshTokens.set(user.id, refreshToken);

    res.json({
      message: "Login successful",
      user: buildPublicUser(user),
      token,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

// Refresh token
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token required",
        code: "REFRESH_TOKEN_MISSING",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, getJwtSecret()) as any;

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        error: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Check if refresh token exists in Redis
    const isValidRefresh = await refreshTokens.validate(
      decoded.userId,
      refreshToken,
    );
    if (!isValidRefresh) {
      return res.status(401).json({
        error: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    if (!dbPool) {
      const user = getMemoryUserById(decoded.userId);
      if (!user || !user.is_active) {
        return res.status(401).json({
          error: "User not found or inactive",
          code: "USER_INVALID",
        });
      }

      const newToken = signAccessToken(user);
      res.json({
        message: "Token refreshed successfully",
        token: newToken,
      });
      return;
    }

    const result = await dbPool.query(
      "SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1",
      [decoded.userId],
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({
        error: "User not found or inactive",
        code: "USER_INVALID",
      });
    }

    const user = result.rows[0];

    const newToken = signAccessToken(user);

    res.json({
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      error: "Invalid refresh token",
      code: "INVALID_REFRESH_TOKEN",
    });
  }
});

// Logout user
router.post(
  "/logout",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      await refreshTokens.delete(userId);

      res.json({
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Forgot password
router.post(
  "/forgot-password",
  validatePasswordReset,
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const normalizedEmail = String(email).toLowerCase();

      if (!dbPool) {
        const user = getMemoryUserByEmail(normalizedEmail);
        if (!user || !user.is_active) {
          return res.json({
            message:
              "If an account with that email exists, a password reset link has been sent",
          });
        }

        const resetToken = uuidv4();
        const resetTokenHash = await bcrypt.hash(resetToken, 10);

        const updatedUser: MemoryUserRecord = {
          ...user,
          password_reset_token: resetTokenHash,
          password_reset_expires: new Date(Date.now() + 3600000),
          updated_at: new Date(),
        };
        persistMemoryUser(updatedUser);

        res.json({
          message: "Password reset link sent",
          resetToken,
        });
        return;
      }

      const result = await dbPool.query(
        "SELECT id, email, first_name FROM users WHERE email = $1 AND is_active = true",
        [normalizedEmail],
      );

      if (result.rows.length === 0) {
        return res.json({
          message:
            "If an account with that email exists, a password reset link has been sent",
        });
      }

      const user = result.rows[0];

      const resetToken = uuidv4();
      const resetTokenHash = await bcrypt.hash(resetToken, 10);

      await dbPool.query(
        "UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3",
        [resetTokenHash, new Date(Date.now() + 3600000), user.id],
      );

      res.json({
        message: "Password reset link sent",
        resetToken,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Reset password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Token and new password required",
        code: "MISSING_FIELDS",
      });
    }

    if (!dbPool) {
      const candidates = memoryUsersById
        ? Array.from(memoryUsersById.values())
        : [];
      let matchedUser: MemoryUserRecord | null = null;

      for (const record of candidates) {
        if (
          record.password_reset_token &&
          record.password_reset_expires &&
          record.password_reset_expires.getTime() > Date.now()
        ) {
          const isValid = await bcrypt.compare(
            token,
            record.password_reset_token,
          );
          if (isValid) {
            matchedUser = record;
            break;
          }
        }
      }

      if (!matchedUser) {
        return res.status(400).json({
          error: "Invalid or expired reset token",
          code: "INVALID_RESET_TOKEN",
        });
      }

      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      const updatedUser: MemoryUserRecord = {
        ...matchedUser,
        password_hash: newPasswordHash,
        password_reset_token: null,
        password_reset_expires: null,
        updated_at: new Date(),
      };
      persistMemoryUser(updatedUser);
      await refreshTokens.delete(updatedUser.id);

      res.json({
        message: "Password reset successfully",
      });
      return;
    }

    const result = await dbPool.query(
      "SELECT id, password_reset_token FROM users WHERE password_reset_token IS NOT NULL AND password_reset_expires > CURRENT_TIMESTAMP",
      [],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
        code: "INVALID_RESET_TOKEN",
      });
    }

    let user = null;
    for (const row of result.rows) {
      const isValidToken = await bcrypt.compare(
        token,
        row.password_reset_token,
      );
      if (isValidToken) {
        user = row;
        break;
      }
    }

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
        code: "INVALID_RESET_TOKEN",
      });
    }

    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await dbPool.query(
      "UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2",
      [newPasswordHash, user.id],
    );

    await refreshTokens.delete(user.id);

    res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

// Get current user profile
router.get(
  "/profile",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      if (!dbPool) {
        const user = getMemoryUserById(userId);
        if (!user) {
          return res.status(404).json({
            error: "User not found",
            code: "USER_NOT_FOUND",
          });
        }

        res.json({
          user: buildProfileUser(user),
        });
        return;
      }

      const result = await dbPool.query(
        `SELECT id, email, first_name, last_name, role, phone, avatar_url,
              last_login_at, created_at, updated_at
       FROM users WHERE id = $1`,
        [userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      const user = result.rows[0];

      res.json({
        user: buildProfileUser(user),
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  validateUpdateProfile,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { firstName, lastName, phone } = req.body;

      if (!dbPool) {
        const user = getMemoryUserById(userId);
        if (!user) {
          return res.status(404).json({
            error: "User not found",
            code: "USER_NOT_FOUND",
          });
        }

        const updatedUser: MemoryUserRecord = {
          ...user,
          first_name: firstName ?? user.first_name,
          last_name: lastName ?? user.last_name,
          phone: phone ?? user.phone ?? null,
          updated_at: new Date(),
        };
        persistMemoryUser(updatedUser);

        res.json({
          message: "Profile updated successfully",
          user: buildProfileUser(updatedUser),
        });
        return;
      }

      const result = await dbPool.query(
        `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, first_name, last_name, role, phone, avatar_url, updated_at`,
        [firstName, lastName, phone, userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      const user = result.rows[0];

      res.json({
        message: "Profile updated successfully",
        user: buildProfileUser(user),
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

export default router;

export async function __resetAuthStateForTests() {
  if (memoryUsersById) {
    memoryUsersById.clear();
  }

  if (memoryUsersByEmail) {
    memoryUsersByEmail.clear();
  }

  if (typeof refreshTokens.clear === "function") {
    await refreshTokens.clear();
  }
}
