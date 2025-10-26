/**
 * Type definitions for video consultations
 * Used by DoctorVideoConsultations component
 */

export type ConsultationStatus =
  | "scheduled"
  | "active"
  | "completed"
  | "cancelled"
  | "no-show";
export type ConsultationType = "video" | "phone" | "in-person";

export interface VideoConsultation {
  id: string;
  appointmentId: string;
  hcwConsultationId?: string;
  hcwUrl?: string;
  status: ConsultationStatus;
  startedAt?: string;
  endedAt?: string;
  duration?: number; // in minutes
  recordingUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledTime: string;
  type: ConsultationType;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  reason?: string;
  notes?: string;
  patient: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    dateOfBirth?: string;
  };
  doctor: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  videoConsultation?: VideoConsultation;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentsListResponse {
  appointments: ConsultationAppointment[];
  total: number;
  limit: number;
  offset: number;
}

export interface ConsultationFilters {
  status?: ConsultationStatus;
  type?: ConsultationType;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface ConsultationStats {
  totalToday: number;
  upcoming: number;
  completed: number;
  averageDuration: number;
  noShowRate: number;
}

export interface HcwSessionResponse {
  consultationId: string;
  hcwUrl: string;
  status: string;
  scheduledTime: string;
}
