import { Router, Response } from "express";
import { z } from "zod";
import { dbPool } from "../config/database";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Validation schema for patient profile
const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(20).optional(),
  dateOfBirth: z.string().optional(), // ISO date string
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(20).optional(),
  emergencyContactRelation: z.string().max(50).optional(),
  insuranceProvider: z.string().max(100).optional(),
  insurancePolicyNumber: z.string().max(50).optional(),
  insuranceGroupNumber: z.string().max(50).optional(),
});

// GET /api/patient/profile - Get current patient's profile
router.get(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }

      const result = await dbPool.query(
        `SELECT
          id, email, first_name, last_name, date_of_birth, phone, gender,
          address, city, state, zip_code,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
          insurance_provider, insurance_policy_number, insurance_group_number,
          created_at, updated_at
        FROM users
        WHERE id = $1`,
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
        profile: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          dateOfBirth: user.date_of_birth,
          phone: user.phone,
          gender: user.gender,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zip_code,
          emergencyContactName: user.emergency_contact_name,
          emergencyContactPhone: user.emergency_contact_phone,
          emergencyContactRelation: user.emergency_contact_relation,
          insuranceProvider: user.insurance_provider,
          insurancePolicyNumber: user.insurance_policy_number,
          insuranceGroupNumber: user.insurance_group_number,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });
    } catch (error) {
      console.error("Get patient profile error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// PUT /api/patient/profile - Update patient profile
router.put(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }

      // Validate request body
      const validation = profileUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: validation.error.errors,
        });
      }

      const data = validation.data;

      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.firstName !== undefined) {
        updateFields.push(`first_name = $${paramIndex++}`);
        values.push(data.firstName);
      }
      if (data.lastName !== undefined) {
        updateFields.push(`last_name = $${paramIndex++}`);
        values.push(data.lastName);
      }
      if (data.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(data.email);
      }
      if (data.phone !== undefined) {
        updateFields.push(`phone = $${paramIndex++}`);
        values.push(data.phone);
      }
      if (data.dateOfBirth !== undefined) {
        updateFields.push(`date_of_birth = $${paramIndex++}`);
        values.push(data.dateOfBirth);
      }
      if (data.gender !== undefined) {
        updateFields.push(`gender = $${paramIndex++}`);
        values.push(data.gender);
      }
      if (data.address !== undefined) {
        updateFields.push(`address = $${paramIndex++}`);
        values.push(data.address);
      }
      if (data.city !== undefined) {
        updateFields.push(`city = $${paramIndex++}`);
        values.push(data.city);
      }
      if (data.state !== undefined) {
        updateFields.push(`state = $${paramIndex++}`);
        values.push(data.state);
      }
      if (data.zipCode !== undefined) {
        updateFields.push(`zip_code = $${paramIndex++}`);
        values.push(data.zipCode);
      }
      if (data.emergencyContactName !== undefined) {
        updateFields.push(`emergency_contact_name = $${paramIndex++}`);
        values.push(data.emergencyContactName);
      }
      if (data.emergencyContactPhone !== undefined) {
        updateFields.push(`emergency_contact_phone = $${paramIndex++}`);
        values.push(data.emergencyContactPhone);
      }
      if (data.emergencyContactRelation !== undefined) {
        updateFields.push(`emergency_contact_relation = $${paramIndex++}`);
        values.push(data.emergencyContactRelation);
      }
      if (data.insuranceProvider !== undefined) {
        updateFields.push(`insurance_provider = $${paramIndex++}`);
        values.push(data.insuranceProvider);
      }
      if (data.insurancePolicyNumber !== undefined) {
        updateFields.push(`insurance_policy_number = $${paramIndex++}`);
        values.push(data.insurancePolicyNumber);
      }
      if (data.insuranceGroupNumber !== undefined) {
        updateFields.push(`insurance_group_number = $${paramIndex++}`);
        values.push(data.insuranceGroupNumber);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          error: "No fields to update",
          code: "NO_FIELDS",
        });
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      const query = `
        UPDATE users
        SET ${updateFields.join(", ")}
        WHERE id = $${paramIndex}
        RETURNING
          id, email, first_name, last_name, date_of_birth, phone, gender,
          address, city, state, zip_code,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
          insurance_provider, insurance_policy_number, insurance_group_number,
          updated_at
      `;

      const result = await dbPool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      const user = result.rows[0];

      res.json({
        message: "Profile updated successfully",
        profile: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          dateOfBirth: user.date_of_birth,
          phone: user.phone,
          gender: user.gender,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zip_code,
          emergencyContactName: user.emergency_contact_name,
          emergencyContactPhone: user.emergency_contact_phone,
          emergencyContactRelation: user.emergency_contact_relation,
          insuranceProvider: user.insurance_provider,
          insurancePolicyNumber: user.insurance_policy_number,
          insuranceGroupNumber: user.insurance_group_number,
          updatedAt: user.updated_at,
        },
      });
    } catch (error) {
      console.error("Update patient profile error:", error);

      // Handle unique constraint violations (e.g., duplicate email)
      if ((error as any).code === "23505") {
        return res.status(409).json({
          error: "Email already in use",
          code: "EMAIL_IN_USE",
        });
      }

      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

export default router;
