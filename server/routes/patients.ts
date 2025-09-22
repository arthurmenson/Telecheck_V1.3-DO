import express from "express";
import {
  PatientService,
  UpdatePatientRequest,
  PatientSearchFilters,
} from "../services/patient.service";
import { authenticateToken } from "../middleware/auth";
import { handleValidationErrors } from "../middleware/validation";
import { body, param, query } from "express-validator";
import { allowDemoAuthBypass } from "../config/env";

const router = express.Router();

// Validation rules
const createPatientValidation = [
  body("firstName").notEmpty().trim().isLength({ min: 1, max: 50 }),
  body("lastName").notEmpty().trim().isLength({ min: 1, max: 50 }),
  body("email").isEmail().normalizeEmail(),
  body("phone").optional().isMobilePhone("any"),
  body("dateOfBirth").isISO8601().toDate(),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer_not_to_say"]),
  body("address").optional().trim().isLength({ max: 200 }),
  body("city").optional().trim().isLength({ max: 100 }),
  body("state").optional().trim().isLength({ max: 50 }),
  body("zipCode").optional().isPostalCode("any"),
  body("allergies").optional().isArray(),
  body("emergencyContacts").optional().isObject(),
  body("insuranceInfo").optional().isObject(),
  body("primaryProviderId").optional().isUUID(),
  body("password").optional().isLength({ min: 8 }),
];

const updatePatientValidation = [
  param("id").isUUID(),
  body("firstName").optional().trim().isLength({ min: 1, max: 50 }),
  body("lastName").optional().trim().isLength({ min: 1, max: 50 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("phone").optional().isMobilePhone("any"),
  body("dateOfBirth").optional().isISO8601().toDate(),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer_not_to_say"]),
  body("address").optional().trim().isLength({ max: 200 }),
  body("city").optional().trim().isLength({ max: 100 }),
  body("state").optional().trim().isLength({ max: 50 }),
  body("zipCode").optional().isPostalCode("any"),
  body("allergies").optional().isArray(),
  body("emergencyContacts").optional().isObject(),
  body("insuranceInfo").optional().isObject(),
  body("primaryProviderId").optional().isUUID(),
  body("status").optional().isIn(["active", "inactive", "archived"]),
];

const searchValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("query").optional().trim(),
  query("status").optional().isIn(["active", "inactive", "archived"]),
  query("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer_not_to_say"]),
  query("ageMin").optional().isInt({ min: 0, max: 150 }).toInt(),
  query("ageMax").optional().isInt({ min: 0, max: 150 }).toInt(),
  query("providerId").optional().isUUID(),
  query("lastAppointmentAfter").optional().isISO8601().toDate(),
  query("lastAppointmentBefore").optional().isISO8601().toDate(),
];

// Authorization helper
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        requiredRoles: roles,
      });
    }
    next();
  };
};

const demoAuthMiddleware = (req: any, _res: any, next: any) => {
  req.user = req.user || { id: "demo", role: "admin" };
  next();
};

const authenticateOrDemo = allowDemoAuthBypass
  ? demoAuthMiddleware
  : authenticateToken;

const requireRolesOrSkip = (roles: string[]) =>
  allowDemoAuthBypass
    ? (req: any, res: any, next: any) => next()
    : requireRole(roles);

/**
 * @route GET /api/patients/stats
 * @desc Get patient statistics
 * @access Admin, Doctor, Nurse (or public in development)
 */
router.get(
  "/stats",
  // Optional demo bypass controlled by ENABLE_DEMO_AUTH_BYPASS
  authenticateOrDemo,
  requireRolesOrSkip(["admin", "doctor", "nurse"]),
  async (req, res) => {
    try {
      const stats = await PatientService.getPatientStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching patient stats:", error);
      res.status(500).json({
        error: "Failed to fetch patient statistics",
        details: error.message,
      });
    }
  },
);

/**
 * @route GET /api/patients/search
 * @desc Search patients with filters and pagination
 * @access Admin, Doctor, Nurse (or public in development)
 */
router.get(
  "/search",
  // Optional demo bypass controlled by ENABLE_DEMO_AUTH_BYPASS
  authenticateOrDemo,
  requireRolesOrSkip(["admin", "doctor", "nurse"]),
  searchValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        query,
        status,
        gender,
        ageMin,
        ageMax,
        providerId,
        lastAppointmentAfter,
        lastAppointmentBefore,
      } = req.query;

      const filters = {
        query: query as string,
        status: status as any,
        gender: gender as string,
        ageMin: ageMin as number,
        ageMax: ageMax as number,
        providerId: providerId as string,
        lastAppointmentAfter: lastAppointmentAfter as string,
        lastAppointmentBefore: lastAppointmentBefore as string,
      };

      const result = await PatientService.searchPatients(
        filters as PatientSearchFilters,
        page as number,
        limit as number,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Error searching patients:", error);
      res.status(500).json({
        error: "Failed to search patients",
        details: error.message,
      });
    }
  },
);

/**
 * @route GET /api/patients
 * @desc Get all patients (paginated)
 * @access Admin, Doctor, Nurse (or public in development)
 */
router.get(
  "/",
  // Optional demo bypass controlled by ENABLE_DEMO_AUTH_BYPASS
  authenticateOrDemo,
  requireRolesOrSkip(["admin", "doctor", "nurse"]),
  searchValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status = "active" } = req.query;

      const filters = {
        status: status as any,
      };

      const result = await PatientService.searchPatients(
        filters as PatientSearchFilters,
        page as number,
        limit as number,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      res.status(500).json({
        error: "Failed to fetch patients",
        details: error.message,
      });
    }
  },
);

/**
 * @route POST /api/patients
 * @desc Create a new patient
 * @access Admin, Doctor, Nurse (or public in development)
 */
router.post(
  "/",
  // Optional demo bypass controlled by ENABLE_DEMO_AUTH_BYPASS
  authenticateOrDemo,
  requireRolesOrSkip(["admin", "doctor", "nurse"]),
  createPatientValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      console.log("[Patient Creation] Request received:", {
        body: req.body,
        user: req.user,
        headers: {
          "content-type": req.headers["content-type"],
          authorization: req.headers.authorization ? "Present" : "Missing",
        },
      });

      const patientData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        allergies: req.body.allergies,
        emergencyContacts: req.body.emergencyContacts,
        insuranceInfo: req.body.insuranceInfo,
        primaryProviderId: req.body.primaryProviderId,
        password: req.body.password,
      };

      console.log("[Patient Creation] Processed patient data:", patientData);

      const patient = await PatientService.createPatient(
        patientData,
        req.user?.id || "system",
      );

      console.log(
        "[Patient Creation] Patient created successfully:",
        patient.id,
      );

      res.status(201).json({
        success: true,
        data: patient,
        message: "Patient created successfully",
      });
    } catch (error: any) {
      console.error("[Patient Creation] Error creating patient:", {
        error: error.message,
        stack: error.stack,
        code: error.code,
        errno: error.errno,
      });

      if (error.code === "23505") {
        // Unique constraint violation
        return res.status(409).json({
          error: "Patient with this email already exists",
          field: "email",
        });
      }

      res.status(500).json({
        error: "Failed to create patient",
        details: error.message,
      });
    }
  },
);

/**
 * @route GET /api/patients/:id
 * @desc Get patient by ID
 * @access Admin, Doctor, Nurse, Patient (own record), or public in development
 */
router.get(
  "/:id",
  // Optional demo bypass controlled by ENABLE_DEMO_AUTH_BYPASS
  authenticateOrDemo,
  param("id").isUUID().withMessage("Patient ID must be a valid UUID"),
  handleValidationErrors,
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const user = req.user;

      // Check if user can access this patient
      if (user.role === "patient") {
        // Patients can only access their own record
        const patient = await PatientService.getPatientById(patientId);
        if (!patient || patient.userId !== user.id) {
          return res.status(403).json({
            error: "Access denied",
          });
        }
      } else if (!["admin", "doctor", "nurse"].includes(user.role)) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      console.log(`[Patients] Looking up patient with ID: ${patientId}`);
      const patient = await PatientService.getPatientById(patientId);
      console.log(
        `[Patients] Patient lookup result:`,
        patient ? "Found" : "Not found",
      );

      if (!patient) {
        console.log(`[Patients] Patient ${patientId} not found`);
        return res.status(404).json({
          error: "Patient not found",
          patientId: patientId,
        });
      }

      res.json({
        success: true,
        data: patient,
      });
    } catch (error: any) {
      console.error("Error fetching patient:", error);
      res.status(500).json({
        error: "Failed to fetch patient",
        details: error.message,
      });
    }
  },
);

/**
 * @route PUT /api/patients/:id
 * @desc Update patient
 * @access Admin, Doctor, Nurse, Patient (own record, limited fields)
 */
router.put(
  "/:id",
  authenticateToken,
  updatePatientValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const user = req.user;

      // Check if user can update this patient
      if (user.role === "patient") {
        // Patients can only update their own record and limited fields
        const patient = await PatientService.getPatientById(patientId);
        if (!patient || patient.userId !== user.id) {
          return res.status(403).json({
            error: "Access denied",
          });
        }

        // Restrict fields that patients can update
        const allowedFields = [
          "phone",
          "address",
          "city",
          "state",
          "zipCode",
          "emergencyContacts",
        ];
        const restrictedFields = Object.keys(req.body).filter(
          (field) => !allowedFields.includes(field),
        );

        if (restrictedFields.length > 0) {
          return res.status(403).json({
            error: "Patients can only update: " + allowedFields.join(", "),
            restrictedFields,
          });
        }
      } else if (!["admin", "doctor", "nurse"].includes(user.role)) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      const updateData: UpdatePatientRequest = req.body;
      const updatedPatient = await PatientService.updatePatient(
        patientId,
        updateData,
        user.id,
      );

      if (!updatedPatient) {
        return res.status(404).json({
          error: "Patient not found",
        });
      }

      res.json({
        success: true,
        data: updatedPatient,
        message: "Patient updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating patient:", error);

      if (error.code === "23505") {
        // Unique constraint violation
        return res.status(409).json({
          error: "Email already exists",
          field: "email",
        });
      }

      res.status(500).json({
        error: "Failed to update patient",
        details: error.message,
      });
    }
  },
);

/**
 * @route DELETE /api/patients/:id
 * @desc Archive patient (soft delete)
 * @access Admin, Doctor
 */
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin", "doctor"]),
  param("id").isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const success = await PatientService.archivePatient(
        patientId,
        req.user.id,
      );

      if (!success) {
        return res.status(404).json({
          error: "Patient not found or already archived",
        });
      }

      res.json({
        success: true,
        message: "Patient archived successfully",
      });
    } catch (error: any) {
      console.error("Error archiving patient:", error);
      res.status(500).json({
        error: "Failed to archive patient",
        details: error.message,
      });
    }
  },
);

/**
 * @route GET /api/patients/:id/appointments
 * @desc Get patient appointments
 * @access Admin, Doctor, Nurse, Patient (own record), or public in development
 */
router.get(
  "/:id/appointments",
  // Optional demo bypass controlled by ENABLE_DEMO_AUTH_BYPASS
  authenticateOrDemo,
  param("id").isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const user = req.user;

      // Check authorization (same logic as getting patient)
      if (user.role === "patient") {
        const patient = await PatientService.getPatientById(patientId);
        if (!patient || patient.userId !== user.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else if (!["admin", "doctor", "nurse"].includes(user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      // Get patient to validate existence and get user_id
      console.log(`[Appointments] Looking up patient with ID: ${patientId}`);
      const patient = await PatientService.getPatientById(patientId);
      console.log(
        `[Appointments] Patient lookup result:`,
        patient ? "Found" : "Not found",
      );

      if (!patient) {
        console.log(
          `[Appointments] Patient ${patientId} not found for appointments`,
        );
        return res.status(404).json({
          error: "Patient not found",
          patientId: patientId,
        });
      }

      const appointments =
        await PatientService.getPatientAppointments(patientId);

      res.json({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      console.error("Error fetching patient appointments:", error);
      res.status(500).json({
        error: "Failed to fetch appointments",
        details: error.message,
      });
    }
  },
);

/**
 * @route GET /api/patients/:id/vitals
 * @desc Get patient vital signs
 * @access Admin, Doctor, Nurse, Patient (own record), or public in development
 */
router.get(
  "/:id/vitals",
  // Optional demo bypass controlled by ENABLE_DEMO_AUTH_BYPASS
  authenticateOrDemo,
  param("id").isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const patientId = req.params.id;
      const user = req.user;
      const { limit = 20, offset = 0 } = req.query;

      // Check authorization
      if (user.role === "patient") {
        const patient = await PatientService.getPatientById(patientId);
        if (!patient || patient.userId !== user.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else if (!["admin", "doctor", "nurse"].includes(user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const patient = await PatientService.getPatientById(patientId);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      const vitals = await PatientService.getPatientVitals(patientId, {
        limit: Number(limit),
        offset: Number(offset),
      });

      res.json({
        success: true,
        data: vitals,
      });
    } catch (error: any) {
      console.error("Error fetching patient vitals:", error);
      res.status(500).json({
        error: "Failed to fetch vital signs",
        details: error.message,
      });
    }
  },
);

export default router;
