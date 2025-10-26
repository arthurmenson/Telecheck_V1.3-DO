/**
 * Consultation API Routes
 *
 * Handles HCW@Home televisit consultation integration
 */

import { Router, Request, Response } from "express";
import {
  createHcwPatient,
  createHcwDoctor,
  createHcwConsultation,
  endHcwConsultation,
  getHcwConsultationStatus,
} from "../services/hcwService";

const router = Router();

/**
 * POST /api/consultations/:appointmentId/hcw-session
 *
 * Creates or retrieves HCW@Home consultation session for a Telecheck appointment
 *
 * Flow:
 * 1. Get appointment from Telecheck database
 * 2. Get or create HCW patient record
 * 3. Get or create HCW doctor record
 * 4. Create HCW consultation with Mediasoup room
 * 5. Return consultation URL for embedding
 */
router.post(
  "/:appointmentId/hcw-session",
  async (req: Request, res: Response) => {
    const { appointmentId } = req.params;
    const userId = (req as any).user?.id; // From auth middleware

    try {
      // TODO: Get appointment from Telecheck database
      // For now, using mock data until DATABASE_URL is configured
      const appointment = {
        id: appointmentId,
        patientId: "patient-123",
        doctorId: "doctor-456",
        scheduledTime: new Date(),
        reason: "Televisit consultation",
      };

      // Mock patient and doctor data
      // TODO: Fetch from Telecheck database when DATABASE_URL configured
      const patient = {
        id: appointment.patientId,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
      };

      const doctor = {
        id: appointment.doctorId,
        firstName: "Dr. Jane",
        lastName: "Smith",
        email: "jane.smith@hospital.com",
        specialty: "General Practice",
      };

      // Create HCW consultation using simplified invite API
      // This automatically creates patient/doctor records if they don't exist
      let consultation;
      try {
        consultation = await createHcwConsultation({
          telecheckAppointmentId: appointment.id,
          patientFirstName: patient.firstName,
          patientLastName: patient.lastName,
          patientEmail: patient.email,
          patientPhone: patient.phone,
          doctorId: doctor.email, // HCW will match or create doctor by email
          scheduledTime: appointment.scheduledTime,
          reason: appointment.reason,
        });
      } catch (error) {
        console.error("Failed to create HCW consultation:", error);
        return res.status(503).json({
          error: "Video consultation service unavailable",
          message:
            "HCW@Home service is not configured or unavailable. Please contact support.",
        });
      }

      // Return consultation details for frontend
      res.json({
        consultationId: consultation.id,
        hcwUrl: consultation.joinUrl,
        status: consultation.status,
        scheduledTime: consultation.scheduledDate,
      });
    } catch (error) {
      console.error("Failed to create HCW consultation session:", error);
      res.status(500).json({
        error: "Failed to create consultation",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
);

/**
 * POST /api/consultations/:appointmentId/end
 *
 * Ends an active HCW@Home consultation
 *
 * Flow:
 * 1. Get consultation ID from request
 * 2. End HCW consultation (closes Mediasoup room)
 * 3. Update Telecheck appointment status
 */
router.post("/:appointmentId/end", async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const { consultationId } = req.body;

  try {
    if (!consultationId) {
      return res.status(400).json({
        error: "Missing consultationId",
        message: "consultationId is required to end consultation",
      });
    }

    // End HCW consultation
    await endHcwConsultation(consultationId);

    // TODO: Update Telecheck appointment status to 'completed'
    // When DATABASE_URL is configured

    res.json({
      success: true,
      message: "Consultation ended successfully",
      appointmentId,
      consultationId,
    });
  } catch (error) {
    console.error("Failed to end consultation:", error);
    res.status(500).json({
      error: "Failed to end consultation",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

/**
 * GET /api/consultations/:appointmentId/status
 *
 * Gets the current status of a consultation
 */
router.get("/:appointmentId/status", async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const { consultationId } = req.query;

  try {
    if (!consultationId || typeof consultationId !== "string") {
      return res.status(400).json({
        error: "Missing consultationId",
        message: "consultationId query parameter is required",
      });
    }

    const status = await getHcwConsultationStatus(consultationId);

    res.json({
      appointmentId,
      consultationId,
      status,
    });
  } catch (error) {
    console.error("Failed to get consultation status:", error);
    res.status(500).json({
      error: "Failed to get status",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export default router;
