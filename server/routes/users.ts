import { Router, Request, Response } from "express";
import { dbPool } from "../config/database";
import {
  validateUpdateProfile,
  validateUserId,
  validatePagination,
  validateSearch,
} from "../middleware/validation";
import {
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = Router();

// Get all users (admin only)
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  validatePagination,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.q as string;
      const offset = (page - 1) * limit;

      let query = `
      SELECT id, email, first_name, last_name, role, phone, avatar_url, 
             is_active, last_login_at, created_at, updated_at
      FROM users
    `;
      let countQuery = "SELECT COUNT(*) FROM users";
      let params: any[] = [];
      let paramIndex = 1;

      if (search) {
        const searchCondition = `
        WHERE (email ILIKE $${paramIndex} OR 
               first_name ILIKE $${paramIndex} OR 
               last_name ILIKE $${paramIndex})
      `;
        query += searchCondition;
        countQuery += searchCondition;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const [usersResult, countResult] = await Promise.all([
        dbPool.query(query, params),
        dbPool.query(countQuery, search ? params.slice(0, -2) : []),
      ]);

      const totalUsers = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalUsers / limit);

      res.json({
        users: usersResult.rows.map((user) => ({
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatar_url,
          isActive: user.is_active,
          lastLoginAt: user.last_login_at,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        })),
        pagination: {
          page,
          limit,
          totalUsers,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Get user by ID (admin only)
router.get(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateUserId,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.id;

      const result = await dbPool.query(
        `SELECT id, email, first_name, last_name, role, phone, avatar_url, 
              is_active, last_login_at, created_at, updated_at
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
          isActive: user.is_active,
          lastLoginAt: user.last_login_at,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Update user by ID (admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateUserId,
  validateUpdateProfile,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.id;
      const { firstName, lastName, phone, role, isActive } = req.body;

      // Check if user exists
      const existingUser = await dbPool.query(
        "SELECT id FROM users WHERE id = $1",
        [userId],
      );

      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      const result = await dbPool.query(
        `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           role = COALESCE($4, role),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, email, first_name, last_name, role, phone, avatar_url, is_active, updated_at`,
        [firstName, lastName, phone, role, isActive, userId],
      );

      const user = result.rows[0];

      res.json({
        message: "User updated successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatar_url,
          isActive: user.is_active,
          updatedAt: user.updated_at,
        },
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Delete user (admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateUserId,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.params.id;

      // Check if user exists
      const existingUser = await dbPool.query(
        "SELECT id FROM users WHERE id = $1",
        [userId],
      );

      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      // Soft delete - set is_active to false
      await dbPool.query(
        "UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [userId],
      );

      res.json({
        message: "User deactivated successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Invite new user (admin only)
router.post(
  "/invite",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { email, firstName, lastName, role, phone } = req.body;

      // Validate required fields
      if (!email || !firstName || !lastName || !role) {
        return res.status(400).json({
          error: "Missing required fields",
          code: "MISSING_FIELDS",
        });
      }

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

      // Generate temporary password
      const tempPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).toUpperCase().slice(-4) +
        "1";

      // Hash temporary password
      const bcrypt = require("bcryptjs");
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

      // Create user
      const result = await dbPool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, email, first_name, last_name, role, created_at`,
        [email, passwordHash, firstName, lastName, role, phone],
      );

      const user = result.rows[0];

      // TODO: Send invitation email with temporary password
      // For now, return the temporary password (remove in production)
      res.status(201).json({
        message: "User invited successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        temporaryPassword: tempPassword, // Remove this in production
      });
    } catch (error) {
      console.error("Invite user error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// Get user statistics (admin only)
router.get(
  "/stats/overview",
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = await dbPool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
        COUNT(CASE WHEN role = 'patient' THEN 1 END) as patients,
        COUNT(CASE WHEN role = 'doctor' THEN 1 END) as doctors,
        COUNT(CASE WHEN role = 'pharmacist' THEN 1 END) as pharmacists,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN last_login_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_last_7_days,
        COUNT(CASE WHEN last_login_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as active_last_30_days
      FROM users
    `);

      const userStats = stats.rows[0];

      res.json({
        stats: {
          totalUsers: parseInt(userStats.total_users),
          activeUsers: parseInt(userStats.active_users),
          inactiveUsers: parseInt(userStats.inactive_users),
          patients: parseInt(userStats.patients),
          doctors: parseInt(userStats.doctors),
          pharmacists: parseInt(userStats.pharmacists),
          admins: parseInt(userStats.admins),
          activeLast7Days: parseInt(userStats.active_last_7_days),
          activeLast30Days: parseInt(userStats.active_last_30_days),
        },
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

export default router;
