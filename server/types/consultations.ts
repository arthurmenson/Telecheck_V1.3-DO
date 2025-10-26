/**
 * TypeScript types for consultation notes
 */

export interface ConsultationNotesRequest {
  notes?: string;
  diagnosis?: string;
  treatmentPlan?: string;
}

export interface ConsultationNotesResponse {
  success: boolean;
  message: string;
  data: {
    appointmentId: string;
    consultationId: string;
    notes: string | null;
    diagnosis: string | null;
    treatmentPlan: string | null;
    updatedAt: Date;
  };
}

export interface ConsultationNotesError {
  error: string;
  message: string;
}
