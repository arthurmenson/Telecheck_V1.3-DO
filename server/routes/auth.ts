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

// Register new user
router.post(
  "/register",
  validateRegister,
  async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, role, phone } = req.body;

      // Check if user already exists
      const existingUser = await dbPool.query(
        "SELECT id FROM users WHERE email = $1",
        [email],
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          error: "User already exists",
          code: "USER_EXISTS",
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await dbPool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, created_at`,
        [email, passwordHash, firstName, lastName, role, phone],
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" },
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { userId: user.id, type: "refresh" },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" },
      );

      // Store refresh token in Redis
      await redisClient.setEx(
        `refresh_token:${user.id}`,
        7 * 24 * 60 * 60,
        refreshToken,
      );

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
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

    // Find user by email
    const result = await dbPool.query(
      "SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Update last login
    await dbPool.query(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id],
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: "refresh" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60,
      refreshToken,
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
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
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        error: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Check if refresh token exists in Redis
    const storedToken = await redisClient.get(
      `refresh_token:${decoded.userId}`,
    );
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({
        error: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Get user info
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

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );

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

      // Remove refresh token from Redis
      await redisClient.del(`refresh_token:${userId}`);

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

      // Check if user exists
      const result = await dbPool.query(
        "SELECT id, email, first_name FROM users WHERE email = $1 AND is_active = true",
        [email],
      );

      if (result.rows.length === 0) {
        // Don't reveal if user exists or not
        return res.json({
          message:
            "If an account with that email exists, a password reset link has been sent",
        });
      }

      const user = result.rows[0];

      // Generate reset token
      const resetToken = uuidv4();
      const resetTokenHash = await bcrypt.hash(resetToken, 10);

      // Store reset token in database with expiration
      await dbPool.query(
        "UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3",
        [resetTokenHash, new Date(Date.now() + 3600000), user.id], // 1 hour expiration
      );

      // TODO: Send email with reset link
      // For now, just return the token (in production, send via email)
      res.json({
        message: "Password reset link sent",
        resetToken, // Remove this in production
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

    // Find user with valid reset token
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

    // Find the user with the matching token
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

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await dbPool.query(
      "UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2",
      [newPasswordHash, user.id],
    );

    // Invalidate all refresh tokens
    await redisClient.del(`refresh_token:${user.id}`);

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
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatar_url,
          lastLoginAt: user.last_login_at,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
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
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatar_url,
          updatedAt: user.updated_at,
        },
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
