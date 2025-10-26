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
import prisma from "../config/prisma";
import { AppointmentStatus, VideoConsultationStatus } from "@prisma/client";
import type {
  ConsultationNotesRequest,
  ConsultationNotesResponse,
  ConsultationNotesError,
} from "../types/consultations";

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
      // Get appointment from database
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: true,
        },
      });

      if (!appointment) {
        return res.status(404).json({
          error: "Appointment not found",
          message: `No appointment found with ID: ${appointmentId}`,
        });
      }

      // Check if video consultation already exists
      let existingConsultation = await prisma.videoConsultation.findUnique({
        where: { appointmentId: appointmentId },
      });

      if (existingConsultation) {
        // Return existing consultation
        return res.json({
          consultationId: existingConsultation.hcwConsultationId,
          hcwUrl: existingConsultation.patientUrl,
          doctorUrl: existingConsultation.doctorUrl,
          status: existingConsultation.status,
          scheduledTime: appointment.scheduledTime,
        });
      }

      // Create HCW consultation using simplified invite API
      // This automatically creates patient/doctor records if they don't exist
      let hcwConsultation;
      try {
        hcwConsultation = await createHcwConsultation({
          telecheckAppointmentId: appointment.id,
          patientFirstName: appointment.patient.firstName,
          patientLastName: appointment.patient.lastName,
          patientEmail: appointment.patient.email,
          patientPhone: appointment.patient.phone || "",
          doctorId: appointment.doctor.email, // HCW will match or create doctor by email
          scheduledTime: appointment.scheduledTime,
          reason: appointment.reason || "Video consultation",
        });
      } catch (error) {
        console.error("Failed to create HCW consultation:", error);
        return res.status(503).json({
          error: "Video consultation service unavailable",
          message:
            "HCW@Home service is not configured or unavailable. Please contact support.",
        });
      }

      // Save video consultation to database
      const videoConsultation = await prisma.videoConsultation.create({
        data: {
          appointmentId: appointment.id,
          hcwConsultationId: hcwConsultation.id,
          patientUrl: hcwConsultation.joinUrl,
          doctorUrl: hcwConsultation.doctorUrl,
          status: VideoConsultationStatus.pending,
          metadata: {
            hcwPatientId: hcwConsultation.patientId,
            hcwDoctorId: hcwConsultation.doctorId,
          },
        },
      });

      // Update appointment status and HCW consultation ID
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.confirmed,
          hcwConsultationId: hcwConsultation.id,
        },
      });

      // Return consultation details for frontend
      res.json({
        consultationId: videoConsultation.id,
        hcwConsultationId: hcwConsultation.id,
        hcwUrl: videoConsultation.patientUrl,
        doctorUrl: videoConsultation.doctorUrl,
        status: videoConsultation.status,
        scheduledTime: appointment.scheduledTime,
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

    // Get video consultation from database
    const videoConsultation = await prisma.videoConsultation.findUnique({
      where: { appointmentId: appointmentId },
      include: { appointment: true },
    });

    if (!videoConsultation) {
      return res.status(404).json({
        error: "Consultation not found",
        message: `No video consultation found for appointment: ${appointmentId}`,
      });
    }

    // End HCW consultation
    try {
      await endHcwConsultation(videoConsultation.hcwConsultationId);
    } catch (error) {
      console.warn("Failed to end HCW consultation, continuing...", error);
    }

    // Calculate duration
    const startedAt =
      videoConsultation.startedAt || videoConsultation.createdAt;
    const endedAt = new Date();
    const durationMinutes = Math.round(
      (endedAt.getTime() - startedAt.getTime()) / 60000,
    );

    // Update video consultation status
    await prisma.videoConsultation.update({
      where: { id: videoConsultation.id },
      data: {
        status: VideoConsultationStatus.completed,
        endedAt: endedAt,
        duration: durationMinutes,
      },
    });

    // Update appointment status to completed
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.completed,
      },
    });

    res.json({
      success: true,
      message: "Consultation ended successfully",
      appointmentId,
      consultationId: videoConsultation.id,
      duration: durationMinutes,
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

  try {
    // Get appointment with video consultation
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        videoConsultation: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        error: "Appointment not found",
        message: `No appointment found with ID: ${appointmentId}`,
      });
    }

    if (!appointment.videoConsultation) {
      return res.status(404).json({
        error: "Consultation not found",
        message: "No video consultation exists for this appointment",
      });
    }

    // Optionally sync with HCW status
    let hcwStatus = null;
    try {
      hcwStatus = await getHcwConsultationStatus(
        appointment.videoConsultation.hcwConsultationId,
      );

      // Update local status if different from HCW
      if (hcwStatus && hcwStatus !== appointment.videoConsultation.status) {
        await prisma.videoConsultation.update({
          where: { id: appointment.videoConsultation.id },
          data: {
            status: hcwStatus as VideoConsultationStatus,
          },
        });
      }
    } catch (error) {
      console.warn("Failed to get HCW status, using local status:", error);
    }

    res.json({
      appointmentId,
      consultationId: appointment.videoConsultation.id,
      hcwConsultationId: appointment.videoConsultation.hcwConsultationId,
      status: hcwStatus || appointment.videoConsultation.status,
      appointmentStatus: appointment.status,
      startedAt: appointment.videoConsultation.startedAt,
      endedAt: appointment.videoConsultation.endedAt,
      duration: appointment.videoConsultation.duration,
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

/**
 * POST /api/consultations/:appointmentId/notes
 *
 * Add post-consultation notes to a completed consultation
 *
 * Simple endpoint for doctors to save consultation notes after ending a session.
 * Accepts notes, diagnosis, and treatment plan.
 */
router.post("/:appointmentId/notes", async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const { notes, diagnosis, treatmentPlan } =
    req.body as ConsultationNotesRequest;
  const userId = (req as any).user?.id; // From auth middleware

  try {
    // Validate that at least one field is provided
    if (!notes && !diagnosis && !treatmentPlan) {
      return res.status(400).json({
        error: "Missing required fields",
        message:
          "At least one of notes, diagnosis, or treatmentPlan must be provided",
      } as ConsultationNotesError);
    }

    // Get video consultation from database
    const videoConsultation = await prisma.videoConsultation.findUnique({
      where: { appointmentId: appointmentId },
      include: {
        appointment: {
          include: {
            doctor: true,
          },
        },
      },
    });

    if (!videoConsultation) {
      return res.status(404).json({
        error: "Consultation not found",
        message: `No video consultation found for appointment: ${appointmentId}`,
      } as ConsultationNotesError);
    }

    // Verify user is the doctor for this consultation (optional auth check)
    // Uncomment if using auth middleware
    // if (userId && videoConsultation.appointment.doctorId !== userId) {
    //   return res.status(403).json({
    //     error: "Not authorized",
    //     message: "Only the assigned doctor can add notes to this consultation",
    //   } as ConsultationNotesError);
    // }

    // Update video consultation with notes
    const updatedConsultation = await prisma.videoConsultation.update({
      where: { id: videoConsultation.id },
      data: {
        consultationNotes: notes,
        diagnosis: diagnosis,
        treatmentPlan: treatmentPlan,
      },
    });

    res.json({
      success: true,
      message: "Consultation notes saved successfully",
      data: {
        appointmentId,
        consultationId: updatedConsultation.id,
        notes: updatedConsultation.consultationNotes,
        diagnosis: updatedConsultation.diagnosis,
        treatmentPlan: updatedConsultation.treatmentPlan,
        updatedAt: updatedConsultation.updatedAt,
      },
    } as ConsultationNotesResponse);
  } catch (error) {
    console.error("Failed to save consultation notes:", error);
    res.status(500).json({
      error: "Failed to save notes",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    } as ConsultationNotesError);
  }
});

export default router;
