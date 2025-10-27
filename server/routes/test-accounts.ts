/**
 * Test Accounts API Endpoint
 *
 * DEVELOPMENT/STAGING ONLY - Remove or disable in production!
 *
 * Creates test provider and patient accounts via API call
 */

import express from "express";
import prisma from "../config/prisma";
import * as bcrypt from "bcrypt";

const router = express.Router();

/**
 * POST /api/test-accounts/create
 *
 * Creates test provider and patient accounts
 *
 * ⚠️ WARNING: This endpoint should ONLY be available in development/staging!
 */
router.post("/create", async (req, res) => {
  try {
    // ⚠️ SECURITY CHECK - Only allow in non-production environments
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_TEST_ACCOUNTS !== "true"
    ) {
      return res.status(403).json({
        success: false,
        error: "Test account creation is disabled in production",
      });
    }

    const results: any = {
      provider: null,
      patient: null,
      errors: [],
    };

    // ============================================================================
    // 1. CREATE TEST PROVIDER (DOCTOR)
    // ============================================================================
    const providerEmail = "testdoctor-20251027@telecheck.test";
    const providerPassword = "TestDoctor123!";

    try {
      // Check if provider already exists
      let provider = await prisma.user.findUnique({
        where: { email: providerEmail },
        include: { doctorProfile: true },
      });

      if (provider) {
        results.provider = {
          status: "already_exists",
          email: provider.email,
          userId: provider.id,
          message: "Provider account already exists",
        };
      } else {
        // Note: Prisma schema doesn't include password field (OAuth-only)
        // Create provider user without password for now
        provider = await prisma.user.create({
          data: {
            email: providerEmail,
            role: "DOCTOR",
            firstName: "Test",
            lastName: "Provider",
            dateOfBirth: new Date("1980-05-15"),
            phone: "+1-555-TEST-DOC",
          },
        });

        // Create doctor profile
        const doctorProfile = await prisma.doctorProfile.create({
          data: {
            userId: provider.id,
            specialty: "Family Medicine",
            credentials: "MD, FAAFP",
            bio: "Board-certified family medicine physician with 10 years of experience. Specializes in preventive care, chronic disease management, and telehealth services.",
            experience: 10,
            rating: 4.8,
            languages: ["English", "Spanish"],
            videoEnabled: true,
            phoneEnabled: true,
            inPersonEnabled: true,
            location: "New York, NY",
          },
        });

        results.provider = {
          status: "created",
          email: provider.email,
          userId: provider.id,
          doctorProfileId: doctorProfile.id,
          specialty: doctorProfile.specialty,
          message: "Provider account created successfully",
        };
      }
    } catch (error) {
      console.error("Error creating provider:", error);
      results.errors.push({
        type: "provider",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // ============================================================================
    // 2. CREATE TEST PATIENT
    // ============================================================================
    const patientEmail = "testpatient-20251027@telecheck.test";
    const patientPassword = "TestPatient123!";

    try {
      // Check if patient already exists
      let patient = await prisma.user.findUnique({
        where: { email: patientEmail },
      });

      if (patient) {
        results.patient = {
          status: "already_exists",
          email: patient.email,
          userId: patient.id,
          message: "Patient account already exists",
        };
      } else {
        // Note: Prisma schema doesn't include password field (OAuth-only)
        // Create patient user without password for now
        patient = await prisma.user.create({
          data: {
            email: patientEmail,
            role: "PATIENT",
            firstName: "Test",
            lastName: "Patient",
            dateOfBirth: new Date("1990-01-15"),
            phone: "+1-555-TEST-001",
            address: "123 Test Street",
            city: "Test City",
            state: "NY",
            zipCode: "10001",
          },
        });

        results.patient = {
          status: "created",
          email: patient.email,
          userId: patient.id,
          message: "Patient account created successfully",
        };
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      results.errors.push({
        type: "patient",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // ============================================================================
    // 3. RETURN RESULTS
    // ============================================================================
    const hasErrors = results.errors.length > 0;
    const allCreatedOrExist =
      (results.provider?.status === "created" ||
        results.provider?.status === "already_exists") &&
      (results.patient?.status === "created" ||
        results.patient?.status === "already_exists");

    return res.status(hasErrors ? 207 : 200).json({
      success: allCreatedOrExist && !hasErrors,
      results,
      credentials: {
        provider: {
          email: providerEmail,
          password: providerPassword,
          role: "DOCTOR",
        },
        patient: {
          email: patientEmail,
          password: patientPassword,
          role: "PATIENT",
        },
      },
      message: hasErrors
        ? "Some accounts had errors"
        : allCreatedOrExist
          ? "Test accounts ready"
          : "Unexpected state",
    });
  } catch (error) {
    console.error("Error in test account creation:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * GET /api/test-accounts/verify
 *
 * Verifies test accounts exist and are accessible
 */
router.get("/verify", async (req, res) => {
  try {
    const providerEmail = "testdoctor-20251027@telecheck.test";
    const patientEmail = "testpatient-20251027@telecheck.test";

    const provider = await prisma.user.findUnique({
      where: { email: providerEmail },
      include: { doctorProfile: true },
    });

    const patient = await prisma.user.findUnique({
      where: { email: patientEmail },
    });

    return res.json({
      success: true,
      accounts: {
        provider: provider
          ? {
              exists: true,
              email: provider.email,
              userId: provider.id,
              hasProfile: !!provider.doctorProfile,
              specialty: provider.doctorProfile?.specialty,
            }
          : { exists: false },
        patient: patient
          ? {
              exists: true,
              email: patient.email,
              userId: patient.id,
            }
          : { exists: false },
      },
    });
  } catch (error) {
    console.error("Error verifying test accounts:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * DELETE /api/test-accounts/cleanup
 *
 * Removes test accounts (for cleanup after testing)
 */
router.delete("/cleanup", async (req, res) => {
  try {
    // ⚠️ SECURITY CHECK
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_TEST_ACCOUNTS !== "true"
    ) {
      return res.status(403).json({
        success: false,
        error: "Test account cleanup is disabled in production",
      });
    }

    const providerEmail = "testdoctor-20251027@telecheck.test";
    const patientEmail = "testpatient-20251027@telecheck.test";

    // Delete provider (cascade will delete doctor profile)
    const deletedProvider = await prisma.user.deleteMany({
      where: { email: providerEmail },
    });

    // Delete patient
    const deletedPatient = await prisma.user.deleteMany({
      where: { email: patientEmail },
    });

    return res.json({
      success: true,
      deleted: {
        provider: deletedProvider.count,
        patient: deletedPatient.count,
      },
      message: "Test accounts cleaned up successfully",
    });
  } catch (error) {
    console.error("Error cleaning up test accounts:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

export default router;
