import { Router, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { dbPool } from "../config/database";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Validation schema for settings update
const settingsUpdateSchema = z.object({
  // Notification preferences
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  appointmentNotifications: z.boolean().optional(),
  labResultNotifications: z.boolean().optional(),
  messageNotifications: z.boolean().optional(),
  reminderNotifications: z.boolean().optional(),

  // Privacy controls
  dataSharing: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
  thirdPartySharing: z.boolean().optional(),

  // Communication preferences
  preferredContactMethod: z.enum(["email", "sms", "phone"]).optional(),
  languagePreference: z.enum(["en", "es", "fr"]).optional(),
});

// Password change schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// GET /api/patient/settings - Get current patient's settings
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
          email_notifications, sms_notifications, push_notifications,
          appointment_notifications, lab_result_notifications,
          message_notifications, reminder_notifications,
          data_sharing, marketing_consent, third_party_sharing,
          preferred_contact_method, language_preference,
          two_factor_enabled
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
        settings: {
          notifications: {
            email: user.email_notifications,
            sms: user.sms_notifications,
            push: user.push_notifications,
            appointments: user.appointment_notifications,
            labResults: user.lab_result_notifications,
            messages: user.message_notifications,
            reminders: user.reminder_notifications,
          },
          privacy: {
            dataSharing: user.data_sharing,
            marketingConsent: user.marketing_consent,
            thirdPartySharing: user.third_party_sharing,
          },
          communication: {
            preferredContactMethod: user.preferred_contact_method,
            languagePreference: user.language_preference,
          },
          security: {
            twoFactorEnabled: user.two_factor_enabled,
          },
        },
      });
    } catch (error) {
      console.error("Get patient settings error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// PUT /api/patient/settings - Update patient settings
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
      const validation = settingsUpdateSchema.safeParse(req.body);
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

      if (data.emailNotifications !== undefined) {
        updateFields.push(`email_notifications = $${paramIndex++}`);
        values.push(data.emailNotifications);
      }
      if (data.smsNotifications !== undefined) {
        updateFields.push(`sms_notifications = $${paramIndex++}`);
        values.push(data.smsNotifications);
      }
      if (data.pushNotifications !== undefined) {
        updateFields.push(`push_notifications = $${paramIndex++}`);
        values.push(data.pushNotifications);
      }
      if (data.appointmentNotifications !== undefined) {
        updateFields.push(`appointment_notifications = $${paramIndex++}`);
        values.push(data.appointmentNotifications);
      }
      if (data.labResultNotifications !== undefined) {
        updateFields.push(`lab_result_notifications = $${paramIndex++}`);
        values.push(data.labResultNotifications);
      }
      if (data.messageNotifications !== undefined) {
        updateFields.push(`message_notifications = $${paramIndex++}`);
        values.push(data.messageNotifications);
      }
      if (data.reminderNotifications !== undefined) {
        updateFields.push(`reminder_notifications = $${paramIndex++}`);
        values.push(data.reminderNotifications);
      }
      if (data.dataSharing !== undefined) {
        updateFields.push(`data_sharing = $${paramIndex++}`);
        values.push(data.dataSharing);
      }
      if (data.marketingConsent !== undefined) {
        updateFields.push(`marketing_consent = $${paramIndex++}`);
        values.push(data.marketingConsent);
      }
      if (data.thirdPartySharing !== undefined) {
        updateFields.push(`third_party_sharing = $${paramIndex++}`);
        values.push(data.thirdPartySharing);
      }
      if (data.preferredContactMethod !== undefined) {
        updateFields.push(`preferred_contact_method = $${paramIndex++}`);
        values.push(data.preferredContactMethod);
      }
      if (data.languagePreference !== undefined) {
        updateFields.push(`language_preference = $${paramIndex++}`);
        values.push(data.languagePreference);
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
          email_notifications, sms_notifications, push_notifications,
          appointment_notifications, lab_result_notifications,
          message_notifications, reminder_notifications,
          data_sharing, marketing_consent, third_party_sharing,
          preferred_contact_method, language_preference,
          two_factor_enabled
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
        message: "Settings updated successfully",
        settings: {
          notifications: {
            email: user.email_notifications,
            sms: user.sms_notifications,
            push: user.push_notifications,
            appointments: user.appointment_notifications,
            labResults: user.lab_result_notifications,
            messages: user.message_notifications,
            reminders: user.reminder_notifications,
          },
          privacy: {
            dataSharing: user.data_sharing,
            marketingConsent: user.marketing_consent,
            thirdPartySharing: user.third_party_sharing,
          },
          communication: {
            preferredContactMethod: user.preferred_contact_method,
            languagePreference: user.language_preference,
          },
          security: {
            twoFactorEnabled: user.two_factor_enabled,
          },
        },
      });
    } catch (error) {
      console.error("Update patient settings error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// POST /api/patient/settings/2fa/enable - Enable 2FA
router.post(
  "/2fa/enable",
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

      // Check if 2FA is already enabled
      const checkResult = await dbPool.query(
        "SELECT two_factor_enabled FROM users WHERE id = $1",
        [userId],
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      if (checkResult.rows[0].two_factor_enabled) {
        return res.status(400).json({
          error: "2FA already enabled",
          code: "2FA_ALREADY_ENABLED",
        });
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Telecheck (${req.user?.email})`,
        length: 32,
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

      // Store secret temporarily (in production, use session or temp storage)
      await dbPool.query(
        "UPDATE users SET two_factor_secret = $1 WHERE id = $2",
        [secret.base32, userId],
      );

      res.json({
        message: "2FA setup initiated",
        secret: secret.base32,
        qrCode: qrCodeUrl,
      });
    } catch (error) {
      console.error("Enable 2FA error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// POST /api/patient/settings/2fa/verify - Verify and activate 2FA
router.post(
  "/2fa/verify",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { token } = req.body;

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }

      if (!token) {
        return res.status(400).json({
          error: "Token required",
          code: "TOKEN_REQUIRED",
        });
      }

      // Get stored secret
      const result = await dbPool.query(
        "SELECT two_factor_secret FROM users WHERE id = $1",
        [userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      const secret = result.rows[0].two_factor_secret;

      if (!secret) {
        return res.status(400).json({
          error: "2FA not initiated",
          code: "2FA_NOT_INITIATED",
        });
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        window: 2,
      });

      if (!verified) {
        return res.status(400).json({
          error: "Invalid token",
          code: "INVALID_TOKEN",
        });
      }

      // Enable 2FA
      await dbPool.query(
        "UPDATE users SET two_factor_enabled = true WHERE id = $1",
        [userId],
      );

      res.json({
        message: "2FA enabled successfully",
      });
    } catch (error) {
      console.error("Verify 2FA error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// POST /api/patient/settings/2fa/disable - Disable 2FA
router.post(
  "/2fa/disable",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { token } = req.body;

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }

      if (!token) {
        return res.status(400).json({
          error: "Token required",
          code: "TOKEN_REQUIRED",
        });
      }

      // Get stored secret
      const result = await dbPool.query(
        "SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = $1",
        [userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      if (!result.rows[0].two_factor_enabled) {
        return res.status(400).json({
          error: "2FA not enabled",
          code: "2FA_NOT_ENABLED",
        });
      }

      const secret = result.rows[0].two_factor_secret;

      // Verify token before disabling
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        window: 2,
      });

      if (!verified) {
        return res.status(400).json({
          error: "Invalid token",
          code: "INVALID_TOKEN",
        });
      }

      // Disable 2FA
      await dbPool.query(
        "UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE id = $1",
        [userId],
      );

      res.json({
        message: "2FA disabled successfully",
      });
    } catch (error) {
      console.error("Disable 2FA error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

// POST /api/patient/settings/password - Change password
router.post(
  "/password",
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
      const validation = passwordChangeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: validation.error.errors,
        });
      }

      const { currentPassword, newPassword } = validation.data;

      // Get current password hash
      const result = await dbPool.query(
        "SELECT password_hash FROM users WHERE id = $1",
        [userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      const passwordHash = result.rows[0].password_hash;

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, passwordHash);

      if (!isValid) {
        return res.status(401).json({
          error: "Invalid current password",
          code: "INVALID_PASSWORD",
        });
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await dbPool.query(
        "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [newPasswordHash, userId],
      );

      res.json({
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  },
);

export default router;
