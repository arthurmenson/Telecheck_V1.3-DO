/**
 * Consultation Notes Service
 *
 * Handles creation, updating, and management of consultation notes
 * with HIPAA-compliant audit logging.
 *
 * @module services/consultationNotesService
 */

import prisma from "../config/prisma";
import { Request } from "express";

/**
 * Interface for consultation note data
 */
export interface ConsultationNoteData {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  chiefComplaint?: string;
  historyOfPresent?: string;
  assessment?: string;
  clinicalNotes?: string;
  diagnosisCodes?: Array<{
    code: string;
    description: string;
    type?: string; // ICD-10, SNOMED, etc.
  }>;
  treatmentPlan?: string;
  followUpInstructions?: string;
  prescriptionIds?: string[];
  followUpDate?: Date;
  followUpType?: string;
  isDraft?: boolean;
}

/**
 * Create or update consultation note
 *
 * @param data - Consultation note data
 * @param userId - User making the change
 * @param req - Express request object for audit trail
 * @returns Promise resolving to created/updated note
 */
export async function saveConsultationNote(
  data: ConsultationNoteData,
  userId: string,
  req?: Request,
): Promise<any> {
  // Check if note already exists for this appointment
  const existingNote = await prisma.consultationNote.findFirst({
    where: { appointmentId: data.appointmentId },
  });

  let note;
  const isUpdate = !!existingNote;

  if (existingNote) {
    // Update existing note
    note = await prisma.consultationNote.update({
      where: { id: existingNote.id },
      data: {
        chiefComplaint: data.chiefComplaint,
        historyOfPresent: data.historyOfPresent,
        assessment: data.assessment,
        clinicalNotes: data.clinicalNotes,
        diagnosisCodes: data.diagnosisCodes as any,
        treatmentPlan: data.treatmentPlan,
        followUpInstructions: data.followUpInstructions,
        prescriptionIds: data.prescriptionIds as any,
        followUpDate: data.followUpDate,
        followUpType: data.followUpType,
        isDraft: data.isDraft !== false, // Default to draft
        status: data.isDraft !== false ? "draft" : "completed",
        version: existingNote.version + 1,
      },
    });

    // Audit trail - track what changed
    await auditNoteChange(
      existingNote.id,
      userId,
      "updated",
      existingNote,
      note,
      req,
    );
  } else {
    // Create new note
    note = await prisma.consultationNote.create({
      data: {
        appointmentId: data.appointmentId,
        doctorId: data.doctorId,
        patientId: data.patientId,
        chiefComplaint: data.chiefComplaint,
        historyOfPresent: data.historyOfPresent,
        assessment: data.assessment,
        clinicalNotes: data.clinicalNotes,
        diagnosisCodes: data.diagnosisCodes as any,
        treatmentPlan: data.treatmentPlan,
        followUpInstructions: data.followUpInstructions,
        prescriptionIds: data.prescriptionIds as any,
        followUpDate: data.followUpDate,
        followUpType: data.followUpType,
        isDraft: data.isDraft !== false,
        status: data.isDraft !== false ? "draft" : "completed",
      },
    });

    // Audit trail
    await auditNoteChange(note.id, userId, "created", null, note, req);
  }

  return note;
}

/**
 * Sign/finalize consultation note
 *
 * @param noteId - Note ID
 * @param userId - User signing the note
 * @param req - Express request object
 * @returns Promise resolving to signed note
 */
export async function signConsultationNote(
  noteId: string,
  userId: string,
  req?: Request,
): Promise<any> {
  const note = await prisma.consultationNote.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    throw new Error("Consultation note not found");
  }

  if (note.doctorId !== userId) {
    throw new Error("Only the authoring doctor can sign the note");
  }

  if (!note.isDraft) {
    throw new Error("Note is already signed");
  }

  const updatedNote = await prisma.consultationNote.update({
    where: { id: noteId },
    data: {
      isDraft: false,
      status: "signed",
      signedAt: new Date(),
    },
  });

  // Audit trail
  await auditNoteChange(noteId, userId, "signed", note, updatedNote, req);

  return updatedNote;
}

/**
 * Get consultation note by appointment ID
 *
 * @param appointmentId - Appointment ID
 * @param userId - User requesting the note
 * @param req - Express request object
 * @returns Promise resolving to note or null
 */
export async function getConsultationNote(
  appointmentId: string,
  userId: string,
  req?: Request,
): Promise<any> {
  const note = await prisma.consultationNote.findFirst({
    where: { appointmentId },
  });

  if (note) {
    // Audit note access
    await auditNoteChange(note.id, userId, "viewed", null, null, req);
  }

  return note;
}

/**
 * Get consultation notes for a patient
 *
 * @param patientId - Patient ID
 * @param limit - Number of notes to return
 * @returns Promise resolving to array of notes
 */
export async function getPatientConsultationNotes(
  patientId: string,
  limit: number = 10,
): Promise<any[]> {
  return prisma.consultationNote.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Audit note change
 *
 * @param noteId - Note ID
 * @param userId - User making the change
 * @param action - Action type
 * @param oldNote - Previous note state
 * @param newNote - New note state
 * @param req - Express request object
 */
async function auditNoteChange(
  noteId: string,
  userId: string,
  action: "created" | "updated" | "signed" | "viewed",
  oldNote: any,
  newNote: any,
  req?: Request,
): Promise<void> {
  const ipAddress = req?.ip || req?.socket?.remoteAddress || null;
  const userAgent = req?.get("user-agent") || null;

  // For updates, track specific field changes
  if (action === "updated" && oldNote && newNote) {
    const fields = [
      "chiefComplaint",
      "historyOfPresent",
      "assessment",
      "clinicalNotes",
      "diagnosisCodes",
      "treatmentPlan",
      "followUpInstructions",
      "prescriptionIds",
      "followUpDate",
      "followUpType",
    ];

    for (const field of fields) {
      const oldValue = oldNote[field];
      const newValue = newNote[field];

      // Check if field changed
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        await prisma.consultationNoteAudit.create({
          data: {
            noteId,
            userId,
            action,
            fieldChanged: field,
            oldValue:
              typeof oldValue === "object"
                ? JSON.stringify(oldValue)
                : String(oldValue || ""),
            newValue:
              typeof newValue === "object"
                ? JSON.stringify(newValue)
                : String(newValue || ""),
            ipAddress,
            userAgent,
          },
        });
      }
    }
  } else {
    // For other actions, just log the action
    await prisma.consultationNoteAudit.create({
      data: {
        noteId,
        userId,
        action,
        ipAddress,
        userAgent,
      },
    });
  }
}

/**
 * Get audit trail for a consultation note
 *
 * @param noteId - Note ID
 * @returns Promise resolving to audit trail
 */
export async function getConsultationNoteAuditTrail(
  noteId: string,
): Promise<any[]> {
  return prisma.consultationNoteAudit.findMany({
    where: { noteId },
    orderBy: { timestamp: "desc" },
  });
}

/**
 * Auto-save draft note (called periodically from frontend)
 *
 * @param data - Consultation note data
 * @param userId - User ID
 * @param req - Express request object
 * @returns Promise resolving to saved note
 */
export async function autoSaveDraft(
  data: ConsultationNoteData,
  userId: string,
  req?: Request,
): Promise<any> {
  // Force draft mode for auto-save
  data.isDraft = true;

  return saveConsultationNote(data, userId, req);
}

export default {
  saveConsultationNote,
  signConsultationNote,
  getConsultationNote,
  getPatientConsultationNotes,
  getConsultationNoteAuditTrail,
  autoSaveDraft,
};
