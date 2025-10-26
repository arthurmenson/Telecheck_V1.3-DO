/**
 * Consultation Notes API Routes
 *
 * Handles post-consultation documentation including notes, prescriptions,
 * and patient summaries.
 */

import { Router, Request, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import {
  saveConsultationNote,
  signConsultationNote,
  getConsultationNote,
  getPatientConsultationNotes,
  getConsultationNoteAuditTrail,
  autoSaveDraft,
} from "../services/consultationNotesService";
import {
  createAndSendSummary,
  getPatientSummary,
} from "../services/summaryService";
import prisma from "../config/prisma";
import { ErxVendorAdapter } from "../utils/erxVendorAdapter";

const router = Router();

/**
 * POST /api/consultation-notes/:appointmentId
 *
 * Save consultation notes (create or update)
 */
router.post(
  "/:appointmentId",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get appointment to verify access and get patient ID
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: true, patient: true },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Verify user is the doctor for this appointment
      if (appointment.doctorId !== userId && req.user?.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: "Not authorized to edit this consultation note" });
      }

      const noteData = {
        appointmentId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        chiefComplaint: req.body.chiefComplaint,
        historyOfPresent: req.body.historyOfPresent,
        assessment: req.body.assessment,
        clinicalNotes: req.body.clinicalNotes,
        diagnosisCodes: req.body.diagnosisCodes,
        treatmentPlan: req.body.treatmentPlan,
        followUpInstructions: req.body.followUpInstructions,
        prescriptionIds: req.body.prescriptionIds,
        followUpDate: req.body.followUpDate
          ? new Date(req.body.followUpDate)
          : undefined,
        followUpType: req.body.followUpType,
        isDraft: req.body.isDraft !== false, // Default to draft
      };

      const note = await saveConsultationNote(noteData, userId, req);

      res.json({
        success: true,
        data: note,
      });
    } catch (error) {
      console.error("Failed to save consultation note:", error);
      res.status(500).json({
        error: "Failed to save consultation note",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * POST /api/consultation-notes/:appointmentId/auto-save
 *
 * Auto-save draft note (periodic saves from frontend)
 */
router.post(
  "/:appointmentId/auto-save",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get appointment to verify access
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      if (appointment.doctorId !== userId && req.user?.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: "Not authorized to edit this consultation note" });
      }

      const noteData = {
        appointmentId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        ...req.body,
      };

      const note = await autoSaveDraft(noteData, userId, req);

      res.json({
        success: true,
        data: note,
        message: "Draft auto-saved",
      });
    } catch (error) {
      console.error("Failed to auto-save draft:", error);
      res.status(500).json({
        error: "Failed to auto-save draft",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * GET /api/consultation-notes/:appointmentId
 *
 * Get consultation note for an appointment
 */
router.get(
  "/:appointmentId",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get appointment to verify access
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Verify user has access (doctor, patient, or admin)
      const hasAccess =
        appointment.doctorId === userId ||
        appointment.patientId === userId ||
        req.user?.role === "ADMIN";

      if (!hasAccess) {
        return res
          .status(403)
          .json({ error: "Not authorized to view this consultation note" });
      }

      const note = await getConsultationNote(appointmentId, userId, req);

      if (!note) {
        return res.status(404).json({ error: "Consultation note not found" });
      }

      res.json({
        success: true,
        data: note,
      });
    } catch (error) {
      console.error("Failed to get consultation note:", error);
      res.status(500).json({
        error: "Failed to get consultation note",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * POST /api/consultation-notes/:noteId/sign
 *
 * Sign/finalize consultation note
 */
router.post(
  "/:noteId/sign",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { noteId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const note = await signConsultationNote(noteId, userId, req);

      res.json({
        success: true,
        data: note,
        message: "Consultation note signed successfully",
      });
    } catch (error) {
      console.error("Failed to sign consultation note:", error);
      res.status(400).json({
        error: "Failed to sign consultation note",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * GET /api/consultation-notes/:noteId/audit
 *
 * Get audit trail for consultation note
 */
router.get(
  "/:noteId/audit",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { noteId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Only admins and the authoring doctor can view audit trail
      const note = await prisma.consultationNote.findUnique({
        where: { id: noteId },
      });

      if (!note) {
        return res.status(404).json({ error: "Consultation note not found" });
      }

      if (note.doctorId !== userId && req.user?.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: "Not authorized to view audit trail" });
      }

      const auditTrail = await getConsultationNoteAuditTrail(noteId);

      res.json({
        success: true,
        data: auditTrail,
      });
    } catch (error) {
      console.error("Failed to get audit trail:", error);
      res.status(500).json({
        error: "Failed to get audit trail",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * POST /api/consultation-notes/:appointmentId/prescription
 *
 * Create and attach prescription to consultation
 */
router.post(
  "/:appointmentId/prescription",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get appointment to verify access
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      if (appointment.doctorId !== userId && req.user?.role !== "ADMIN") {
        return res.status(403).json({ error: "Not authorized" });
      }

      // Create prescription via eRx
      const { medication, dosageInstruction } = req.body;

      if (!medication) {
        return res.status(400).json({ error: "Medication is required" });
      }

      const prescription = await ErxVendorAdapter.submitPrescription({
        patientId: appointment.patientId,
        medication,
        dosageInstruction,
        requestedByUserId: userId,
      });

      // Get or create consultation note
      let note = await prisma.consultationNote.findFirst({
        where: { appointmentId },
      });

      const prescriptionId = prescription.externalId || `rx_${Date.now()}`;
      const currentPrescriptionIds = (note?.prescriptionIds as string[]) || [];

      if (note) {
        // Update existing note with prescription ID
        note = await prisma.consultationNote.update({
          where: { id: note.id },
          data: {
            prescriptionIds: [...currentPrescriptionIds, prescriptionId] as any,
          },
        });
      } else {
        // Create note with prescription ID
        note = await prisma.consultationNote.create({
          data: {
            appointmentId,
            doctorId: appointment.doctorId,
            patientId: appointment.patientId,
            prescriptionIds: [prescriptionId] as any,
            isDraft: true,
            status: "draft",
          },
        });
      }

      res.json({
        success: true,
        data: {
          prescription,
          note,
        },
        message: "Prescription created and attached to consultation",
      });
    } catch (error) {
      console.error("Failed to create prescription:", error);
      res.status(500).json({
        error: "Failed to create prescription",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * POST /api/consultation-notes/:appointmentId/summary
 *
 * Generate and send patient summary
 */
router.post(
  "/:appointmentId/summary",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get appointment to verify access
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      if (appointment.doctorId !== userId && req.user?.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: "Not authorized to send summary" });
      }

      const summary = await createAndSendSummary(appointmentId);

      res.json({
        success: true,
        data: summary,
        message: "Patient summary generated and sent successfully",
      });
    } catch (error) {
      console.error("Failed to create summary:", error);
      res.status(500).json({
        error: "Failed to create summary",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * GET /api/consultation-notes/:appointmentId/summary
 *
 * Get patient summary for an appointment
 */
router.get(
  "/:appointmentId/summary",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { appointmentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get appointment to verify access
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Patients can only view their own summaries
      if (req.user?.role === "PATIENT") {
        if (appointment.patientId !== userId) {
          return res.status(403).json({ error: "Not authorized" });
        }
        const summary = await getPatientSummary(appointmentId, userId);
        return res.json({
          success: true,
          data: summary,
        });
      }

      // Doctors and admins can view any summary
      const summary = await prisma.patientConsultationSummary.findUnique({
        where: { appointmentId },
      });

      if (!summary) {
        return res.status(404).json({ error: "Summary not found" });
      }

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Failed to get summary:", error);
      res.status(500).json({
        error: "Failed to get summary",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * GET /api/consultation-notes/patient/:patientId/history
 *
 * Get consultation notes history for a patient
 */
router.get(
  "/patient/:patientId/history",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { patientId } = req.params;
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Verify authorization
      if (req.user?.role === "PATIENT" && patientId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const notes = await getPatientConsultationNotes(patientId, limit);

      res.json({
        success: true,
        data: notes,
      });
    } catch (error) {
      console.error("Failed to get consultation history:", error);
      res.status(500).json({
        error: "Failed to get consultation history",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * GET /api/consultation-notes/templates
 *
 * Get available medical templates
 */
router.get(
  "/templates",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { category, specialty } = req.query;

      const templates = await prisma.medicalTemplate.findMany({
        where: {
          isActive: true,
          ...(category && { category: category as string }),
          ...(specialty && { specialty: specialty as string }),
        },
        orderBy: [{ usageCount: "desc" }, { name: "asc" }],
      });

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error("Failed to get templates:", error);
      res.status(500).json({
        error: "Failed to get templates",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * POST /api/consultation-notes/templates/:templateId/use
 *
 * Increment template usage count
 */
router.post(
  "/templates/:templateId/use",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { templateId } = req.params;

      const template = await prisma.medicalTemplate.update({
        where: { id: templateId },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      console.error("Failed to update template usage:", error);
      res.status(500).json({
        error: "Failed to update template usage",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

export default router;
