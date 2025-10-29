/**
 * Type-safe API Service Layer
 * Domain-specific API methods with full type safety
 */

import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/api-endpoints";
import { ApiResponse } from "../../shared/types";
import {
  EHR as EHR_ENDPOINTS,
  ELIGIBILITY as ELIGIBILITY_ENDPOINTS,
  HCW as HCW_ENDPOINTS,
  APPOINTMENTS as APPOINTMENT_ENDPOINTS,
  TELEMEDICINE as TELEMEDICINE_ENDPOINTS,
} from "../lib/api-endpoints";
import type { Doctor, ProvidersQueryParams } from "../types/telemedicine";

// Type definitions for API responses
export interface User {
  id: string;
  email: string;
  name: string;
  role: "patient" | "doctor" | "admin" | "pharmacist" | "nurse";
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: string;
  notifications: boolean;
  language: string;
  timezone: string;
}

export interface LabResult {
  id: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: "normal" | "abnormal" | "critical";
  date: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  notes?: string;
}

export interface VitalSigns {
  id: string;
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  date: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  type: "rolling-start" | "fixed-start";
  duration: string;
  enrolledParticipants: number;
  maxParticipants?: number;
  status: "active" | "archived" | "draft";
  category: string;
  price: number;
  coach: string;
  image?: string;
  completionRate: number;
  rating: number;
  modules?: number;
  objectives?: string[];
  curriculum?: string[];
}

// Authentication Service
export class AuthService {
  static async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  }

  static async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  static async logout(): Promise<ApiResponse<void>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
  }

  static async resetPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
  }
}

// User Service
export class UserService {
  static async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get(API_ENDPOINTS.USERS.PROFILE);
  }

  static async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    return apiClient.get(API_ENDPOINTS.USERS.PREFERENCES);
  }

  static async updateProfile(
    userData: Partial<User>,
  ): Promise<ApiResponse<User>> {
    return apiClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, userData);
  }

  static async updatePreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<ApiResponse<UserPreferences>> {
    return apiClient.put(API_ENDPOINTS.USERS.PREFERENCES, preferences);
  }

  static async uploadAvatar(
    file: File,
  ): Promise<ApiResponse<{ avatarUrl: string }>> {
    return apiClient.upload(API_ENDPOINTS.USERS.AVATAR, file);
  }
}

// Lab Service
export class LabService {
  static async getResults(userId?: string): Promise<ApiResponse<LabResult[]>> {
    const endpoint = userId
      ? `${API_ENDPOINTS.LABS.RESULTS}/${userId}`
      : API_ENDPOINTS.LABS.RESULTS;
    return apiClient.get(endpoint);
  }

  static async uploadLabReport(
    file: File,
    userId?: string,
  ): Promise<ApiResponse<{ analysisId: string }>> {
    const formData = new FormData();
    formData.append("labReport", file);
    if (userId) formData.append("userId", userId);

    return apiClient.request(API_ENDPOINTS.LABS.ANALYZE, {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  static async getAnalysis(userId?: string): Promise<ApiResponse<any>> {
    const endpoint = userId
      ? `${API_ENDPOINTS.LABS.ANALYSIS}/${userId}`
      : API_ENDPOINTS.LABS.ANALYSIS;
    return apiClient.get(endpoint);
  }

  static async getTrends(
    userId?: string,
    days?: number,
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (days) params.append("days", days.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    const endpoint = userId
      ? `${API_ENDPOINTS.LABS.TRENDS}/${userId}${query}`
      : `${API_ENDPOINTS.LABS.TRENDS}${query}`;
    return apiClient.get(endpoint);
  }
}

// Medication Service
export class MedicationService {
  static async getMedications(
    userId?: string,
  ): Promise<ApiResponse<Medication[]>> {
    const endpoint = userId
      ? `${API_ENDPOINTS.MEDICATIONS.LIST}/${userId}`
      : API_ENDPOINTS.MEDICATIONS.LIST;
    return apiClient.get(endpoint);
  }

  static async addMedication(
    medication: Omit<Medication, "id">,
    userId?: string,
  ): Promise<ApiResponse<Medication>> {
    return apiClient.post(API_ENDPOINTS.MEDICATIONS.ADD, {
      ...medication,
      userId,
    });
  }

  static async updateMedication(
    id: string,
    medication: Partial<Medication>,
  ): Promise<ApiResponse<Medication>> {
    return apiClient.put(API_ENDPOINTS.MEDICATIONS.UPDATE(id), medication);
  }

  static async deleteMedication(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.MEDICATIONS.DELETE(id));
  }

  static async checkInteractions(userId?: string): Promise<ApiResponse<any>> {
    const endpoint = userId
      ? `${API_ENDPOINTS.MEDICATIONS.INTERACTIONS}/${userId}`
      : API_ENDPOINTS.MEDICATIONS.INTERACTIONS;
    return apiClient.get(endpoint);
  }

  static async searchMedications(query: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(
      `${API_ENDPOINTS.MEDICATIONS.SEARCH}?q=${encodeURIComponent(query)}`,
    );
  }
}

// Vital Signs Service
export class VitalService {
  static async getVitalSigns(
    userId?: string,
  ): Promise<ApiResponse<VitalSigns[]>> {
    const endpoint = userId
      ? `${API_ENDPOINTS.VITALS.LIST}/${userId}`
      : API_ENDPOINTS.VITALS.LIST;
    return apiClient.get(endpoint);
  }

  static async addVitalSigns(
    vitals: Omit<VitalSigns, "id">,
    userId?: string,
  ): Promise<ApiResponse<VitalSigns>> {
    return apiClient.post(API_ENDPOINTS.VITALS.ADD, { ...vitals, userId });
  }

  static async updateVitalSigns(
    id: string,
    vitals: Partial<VitalSigns>,
  ): Promise<ApiResponse<VitalSigns>> {
    return apiClient.put(API_ENDPOINTS.VITALS.UPDATE(id), vitals);
  }

  static async deleteVitalSigns(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.VITALS.DELETE(id));
  }

  static async getVitalTrends(
    userId?: string,
    days?: number,
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (days) params.append("days", days.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    const endpoint = userId
      ? `${API_ENDPOINTS.VITALS.TRENDS}/${userId}${query}`
      : `${API_ENDPOINTS.VITALS.TRENDS}${query}`;
    return apiClient.get(endpoint);
  }
}

// Chat Service
export class ChatService {
  static async sendMessage(
    message: string,
    context?: any,
    userId?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.CHAT.SEND, {
      message,
      context,
      userId,
    });
  }

  static async getChatHistory(userId?: string): Promise<ApiResponse<any[]>> {
    const endpoint = userId
      ? `${API_ENDPOINTS.CHAT.HISTORY}/${userId}`
      : API_ENDPOINTS.CHAT.HISTORY;
    return apiClient.get(endpoint);
  }

  static async getChatSessions(): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.CHAT.SESSIONS);
  }

  static async deleteChatSession(
    sessionId: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.CHAT.DELETE_SESSION(sessionId));
  }
}

// Program Service
export class ProgramService {
  static async getPrograms(): Promise<ApiResponse<Program[]>> {
    return apiClient.get(API_ENDPOINTS.EHR.PROGRAMS.LIST);
  }

  static async getProgram(id: string): Promise<ApiResponse<Program>> {
    return apiClient.get(API_ENDPOINTS.EHR.PROGRAMS.UPDATE(id));
  }

  static async createProgram(
    program: Omit<Program, "id">,
  ): Promise<ApiResponse<Program>> {
    return apiClient.post(API_ENDPOINTS.EHR.PROGRAMS.CREATE, program);
  }

  static async updateProgram(
    id: string,
    program: Partial<Program>,
  ): Promise<ApiResponse<Program>> {
    return apiClient.put(API_ENDPOINTS.EHR.PROGRAMS.UPDATE(id), program);
  }

  static async deleteProgram(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.EHR.PROGRAMS.DELETE(id));
  }

  static async enrollParticipant(
    programId: string,
    participantData: any,
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      API_ENDPOINTS.EHR.PROGRAMS.ENROLL(programId),
      participantData,
    );
  }

  static async getProgramParticipants(
    programId: string,
  ): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.EHR.PROGRAMS.PARTICIPANTS(programId));
  }

  static async getProgramAnalytics(
    programId: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.EHR.PROGRAMS.ANALYTICS(programId));
  }
}

// Analytics Service
export class AnalyticsService {
  static async getDashboardData(): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.DASHBOARD);
  }

  static async getReports(type?: string): Promise<ApiResponse<any[]>> {
    const params = type ? `?type=${encodeURIComponent(type)}` : "";
    return apiClient.get(`${API_ENDPOINTS.ANALYTICS.REPORTS}${params}`);
  }

  static async exportData(
    format: "csv" | "pdf" | "xlsx",
    filters?: any,
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.post(API_ENDPOINTS.ANALYTICS.EXPORT, { format, filters });
  }

  static async getPopulationHealth(): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.ANALYTICS.POPULATION_HEALTH);
  }
}

// File Service
export class FileService {
  static async uploadFile(
    file: File,
    category?: string,
  ): Promise<ApiResponse<{ fileId: string; url: string }>> {
    const formData = new FormData();
    formData.append("file", file);
    if (category) formData.append("category", category);

    return apiClient.request(API_ENDPOINTS.FILES.UPLOAD, {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  static async downloadFile(fileId: string): Promise<Response> {
    return fetch(API_ENDPOINTS.FILES.DOWNLOAD(fileId));
  }

  static async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.FILES.DELETE(fileId));
  }

  static async getFiles(): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.FILES.LIST);
  }
}

// Export all services

// Telehealth Service (open-source friendly: works with our simple endpoints)
export class TelehealthService {
  static async listSessions(): Promise<ApiResponse<any[]>> {
    return apiClient.get(EHR_ENDPOINTS.TELEHEALTH.SESSIONS);
  }

  static async createRoom(
    appointmentId: string,
  ): Promise<ApiResponse<{ roomId: string; roomUrl: string }>> {
    return apiClient.post(EHR_ENDPOINTS.TELEHEALTH.CREATE_ROOM, {
      appointmentId,
    });
  }

  static async joinRoom(
    roomId: string,
  ): Promise<ApiResponse<{ roomId: string; joinUrl: string }>> {
    return apiClient.post(EHR_ENDPOINTS.TELEHEALTH.JOIN_ROOM(roomId));
  }

  static async endSession(
    roomId: string,
  ): Promise<ApiResponse<{ roomId: string; status: string }>> {
    return apiClient.post(EHR_ENDPOINTS.TELEHEALTH.END_SESSION(roomId));
  }
}

// e-Prescribing Service (stubs)
export class ErxService {
  static async createPrescription(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.EHR.ERX.CREATE, payload);
  }

  static async getPrescription(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.EHR.ERX.GET(id));
  }

  static async cancelPrescription(id: string): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.EHR.ERX.CANCEL(id));
  }

  static async requestRefill(id: string): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.EHR.ERX.REFILL(id));
  }

  static async verifyEpcs(
    otp: string,
  ): Promise<ApiResponse<{ verified: boolean }>> {
    return apiClient.post(API_ENDPOINTS.EHR.ERX.EPCS_VERIFY, { otp });
  }

  static async getMedicationHistory(
    patientId: string,
  ): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.EHR.ERX.HISTORY(patientId));
  }
}

// Clinical Service (Conditions/Allergies/Immunizations)
export class ClinicalService {
  // Conditions
  static async listConditions(patientId?: string): Promise<ApiResponse<any[]>> {
    const url = patientId
      ? `${API_ENDPOINTS.CLINICAL.CONDITIONS.LIST}?patientId=${encodeURIComponent(patientId)}`
      : API_ENDPOINTS.CLINICAL.CONDITIONS.LIST;
    return apiClient.get(url);
  }

  static async createCondition(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.CLINICAL.CONDITIONS.CREATE, payload);
  }

  static async updateCondition(
    id: string,
    payload: any,
  ): Promise<ApiResponse<any>> {
    return apiClient.put(API_ENDPOINTS.CLINICAL.CONDITIONS.UPDATE(id), payload);
  }

  static async deleteCondition(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.CLINICAL.CONDITIONS.DELETE(id));
  }

  // Allergies
  static async listAllergies(patientId?: string): Promise<ApiResponse<any[]>> {
    const url = patientId
      ? `${API_ENDPOINTS.CLINICAL.ALLERGIES.LIST}?patientId=${encodeURIComponent(patientId)}`
      : API_ENDPOINTS.CLINICAL.ALLERGIES.LIST;
    return apiClient.get(url);
  }

  static async createAllergy(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.CLINICAL.ALLERGIES.CREATE, payload);
  }

  static async updateAllergy(
    id: string,
    payload: any,
  ): Promise<ApiResponse<any>> {
    return apiClient.put(API_ENDPOINTS.CLINICAL.ALLERGIES.UPDATE(id), payload);
  }

  static async deleteAllergy(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.CLINICAL.ALLERGIES.DELETE(id));
  }

  // Immunizations
  static async listImmunizations(
    patientId?: string,
  ): Promise<ApiResponse<any[]>> {
    const url = patientId
      ? `${API_ENDPOINTS.CLINICAL.IMMUNIZATIONS.LIST}?patientId=${encodeURIComponent(patientId)}`
      : API_ENDPOINTS.CLINICAL.IMMUNIZATIONS.LIST;
    return apiClient.get(url);
  }

  static async createImmunization(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.CLINICAL.IMMUNIZATIONS.CREATE, payload);
  }

  static async updateImmunization(
    id: string,
    payload: any,
  ): Promise<ApiResponse<any>> {
    return apiClient.put(
      API_ENDPOINTS.CLINICAL.IMMUNIZATIONS.UPDATE(id),
      payload,
    );
  }

  static async deleteImmunization(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.CLINICAL.IMMUNIZATIONS.DELETE(id));
  }

  // Encounters
  static async listEncounters(patientId?: string): Promise<ApiResponse<any[]>> {
    const url = patientId
      ? `${API_ENDPOINTS.CLINICAL.ENCOUNTERS.LIST}?patientId=${encodeURIComponent(patientId)}`
      : API_ENDPOINTS.CLINICAL.ENCOUNTERS.LIST;
    return apiClient.get(url);
  }

  static async createEncounter(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.CLINICAL.ENCOUNTERS.CREATE, payload);
  }

  static async updateEncounter(
    id: string,
    payload: any,
  ): Promise<ApiResponse<any>> {
    return apiClient.put(API_ENDPOINTS.CLINICAL.ENCOUNTERS.UPDATE(id), payload);
  }

  static async deleteEncounter(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.CLINICAL.ENCOUNTERS.DELETE(id));
  }

  // Orders
  static async listOrders(patientId?: string): Promise<ApiResponse<any[]>> {
    const url = patientId
      ? `${API_ENDPOINTS.CLINICAL.ORDERS.LIST}?patientId=${encodeURIComponent(patientId)}`
      : API_ENDPOINTS.CLINICAL.ORDERS.LIST;
    return apiClient.get(url);
  }

  static async createOrder(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.CLINICAL.ORDERS.CREATE, payload);
  }

  static async updateOrder(
    id: string,
    payload: any,
  ): Promise<ApiResponse<any>> {
    return apiClient.put(API_ENDPOINTS.CLINICAL.ORDERS.UPDATE(id), payload);
  }

  static async deleteOrder(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.CLINICAL.ORDERS.DELETE(id));
  }
}

// Reporting Service
export class ReportingService {
  static async getAuditReports(): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.REPORTING.AUDIT);
  }

  static async getMipsMeasures(): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.REPORTING.MIPS);
  }

  static async exportData(
    format: "csv" | "xlsx",
    payload?: any,
  ): Promise<ApiResponse<{ url: string }>> {
    return apiClient.post(API_ENDPOINTS.REPORTING.EXPORT, {
      format,
      filters: payload ?? {},
    });
  }
}

// Billing & Eligibility Services
export class BillingService {
  static async generate837P(
    payload: any,
  ): Promise<
    ApiResponse<{ claimId: string; trackingId: string; status: string }>
  > {
    return apiClient.post(EHR_ENDPOINTS.BILLING.X12_837P, payload);
  }

  static async getClaimStatus(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(EHR_ENDPOINTS.BILLING.CLAIM_STATUS(id));
  }
}

export class EligibilityService {
  static async checkEligibility(payload: {
    member: any;
    payer: any;
    serviceType?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(ELIGIBILITY_ENDPOINTS.CHECK, payload);
  }
}

// Pharmacy Service
export class PharmacyService {
  static async getCatalog(): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.COMMERCE.CATALOG);
  }

  static async searchCatalog(q: string): Promise<ApiResponse<any>> {
    return apiClient.get(
      `${API_ENDPOINTS.COMMERCE.SEARCH}?q=${encodeURIComponent(q)}`,
    );
  }

  static async createOrder(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.COMMERCE.ORDERS, payload);
  }

  static async getOrder(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.COMMERCE.ORDER(id));
  }
}

export interface CreateAppointmentPayload {
  patientId: string;
  doctorId: string;
  scheduledTime: string;
  type?: "video" | "phone" | "in_person";
  reason?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface AppointmentCreationResult {
  appointmentId: string;
  confirmationNumber?: string;
  meetingLink?: string;
  appointment?: any;
}

export interface HcwSessionResult {
  consultationId: string;
  hcwConsultationId?: string;
  hcwUrl?: string;
  doctorUrl?: string;
  status?: string;
  scheduledTime?: string;
}

export class SchedulingService {
  static async getTelemedicineProviders(
    params?: ProvidersQueryParams,
  ): Promise<ApiResponse<Doctor[]>> {
    const searchParams = new URLSearchParams();
    if (params?.specialty) {
      searchParams.set("specialty", params.specialty);
    }
    if (params?.videoEnabled !== undefined) {
      searchParams.set("videoEnabled", String(params.videoEnabled));
    }
    if (params?.available) {
      searchParams.set("available", params.available);
    }

    const endpoint =
      searchParams.toString().length > 0
        ? `${TELEMEDICINE_ENDPOINTS.PROVIDERS}?${searchParams.toString()}`
        : TELEMEDICINE_ENDPOINTS.PROVIDERS;

    const response = await apiClient.get<{ providers?: Doctor[] }>(endpoint);
    const raw = (response as any)?.data ?? response;
    const providers = raw?.providers ?? [];

    return {
      success: true,
      data: providers as Doctor[],
    };
  }

  static async createAppointment(
    payload: CreateAppointmentPayload,
  ): Promise<ApiResponse<AppointmentCreationResult>> {
    const response = await apiClient.post<any>(
      APPOINTMENT_ENDPOINTS.ROOT,
      payload,
    );
    const raw = (response as any)?.data ?? response;
    const appointmentId = raw?.id ?? raw?.appointmentId;

    if (!appointmentId) {
      return {
        success: false,
        error: "Failed to create appointment",
      };
    }

    return {
      success: true,
      data: {
        appointmentId,
        confirmationNumber: raw?.confirmationNumber,
        meetingLink: raw?.meetingLink,
        appointment: raw,
      },
    };
  }
}

export interface HcwCaregiver {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  credentials: string;
  bio?: string;
  phoneNumber?: string;
  email?: string;
  isActive: boolean;
  isPrimary?: boolean;
  assignmentType?: string;
  rating?: number;
  reviewCount?: number;
}

export interface HcwThread {
  caregiverId: string;
  caregiverName: string;
  caregiverSpecialty: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface HcwMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  messageType: string;
  priority?: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
}

export interface HcwVisit {
  id: string;
  scheduledTime: string;
  actualStart?: string;
  actualEnd?: string;
  visitType: string;
  purpose?: string;
  location?: string;
  status: string;
  rating?: number;
  feedback?: string;
  notes?: string;
  cancellationReason?: string;
  caregiver: {
    firstName: string;
    lastName: string;
    specialty: string;
    credentials: string;
  };
}

export class HcwService {
  static async createConsultationSession(
    appointmentId: string,
  ): Promise<ApiResponse<HcwSessionResult>> {
    const response = await apiClient.post<any>(
      HCW_ENDPOINTS.CONSULTATIONS.CREATE_SESSION(appointmentId),
    );
    const raw = (response as any)?.data ?? response;

    return {
      success: true,
      data: {
        consultationId:
          raw?.consultationId ?? raw?.hcwConsultationId ?? appointmentId,
        hcwConsultationId: raw?.hcwConsultationId,
        hcwUrl: raw?.hcwUrl ?? raw?.patientUrl,
        doctorUrl: raw?.doctorUrl,
        status: raw?.status,
        scheduledTime: raw?.scheduledTime,
      },
    };
  }

  static async endConsultation(
    appointmentId: string,
    consultationId: string,
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post<any>(
      `/api/consultations/${appointmentId}/end`,
      {
        consultationId,
      },
    );
    const raw = (response as any)?.data ?? response;

    return {
      success: raw?.success ?? true,
      data: raw,
    };
  }

  static async getAssignedCaregivers(): Promise<ApiResponse<HcwCaregiver[]>> {
    const raw = await apiClient.get<{ caregivers?: HcwCaregiver[] }>(
      HCW_ENDPOINTS.CAREGIVERS.ASSIGNED,
    );

    const caregivers = (raw as any)?.caregivers ?? [];
    return {
      success: true,
      data: caregivers,
    };
  }

  static async getMessages(): Promise<ApiResponse<HcwThread[]>> {
    const raw = await apiClient.get<{ threads?: HcwThread[] }>(
      HCW_ENDPOINTS.MESSAGES.LIST,
    );

    const threads = (raw as any)?.threads ?? [];
    return {
      success: true,
      data: threads,
    };
  }

  static async getMessagesForCaregiver(
    caregiverId: string,
  ): Promise<ApiResponse<HcwMessage[]>> {
    const raw = await apiClient.get<{ messages?: HcwMessage[] }>(
      HCW_ENDPOINTS.MESSAGES.THREAD(caregiverId),
    );

    const messages = (raw as any)?.messages ?? [];
    return {
      success: true,
      data: messages,
    };
  }

  static async sendMessage(payload: {
    recipientId: string;
    content: string;
    messageType?: string;
    priority?: string;
  }): Promise<ApiResponse<HcwMessage>> {
    const raw = await apiClient.post<{ message?: HcwMessage }>(
      HCW_ENDPOINTS.MESSAGES.SEND,
      payload,
    );

    return {
      success: true,
      data: (raw as any)?.message,
    };
  }

  static async markMessageRead(
    messageId: string,
  ): Promise<ApiResponse<{ messageId: string; readAt?: string }>> {
    const raw = await apiClient.put<{
      success?: boolean;
      messageId: string;
      readAt?: string;
    }>(HCW_ENDPOINTS.MESSAGES.MARK_READ(messageId));

    const { readAt } = raw as any;
    return {
      success: true,
      data: {
        messageId,
        readAt,
      },
    };
  }

  static async getUpcomingVisits(): Promise<ApiResponse<HcwVisit[]>> {
    const raw = await apiClient.get<{ visits?: HcwVisit[] }>(
      HCW_ENDPOINTS.VISITS.UPCOMING,
    );

    const visits = (raw as any)?.visits ?? [];
    return {
      success: true,
      data: visits,
    };
  }

  static async getVisitHistory(): Promise<ApiResponse<HcwVisit[]>> {
    const raw = await apiClient.get<{ visits?: HcwVisit[] }>(
      HCW_ENDPOINTS.VISITS.HISTORY,
    );

    const visits = (raw as any)?.visits ?? [];
    return {
      success: true,
      data: visits,
    };
  }

  static async cancelVisit(payload: {
    visitId: string;
    cancellationReason: string;
  }): Promise<
    ApiResponse<{
      visitId: string;
      status: string;
      cancellationReason?: string;
      cancelledAt?: string;
    }>
  > {
    const raw = await apiClient.delete<{
      success?: boolean;
      visitId: string;
      status: string;
      cancellationReason?: string;
      cancelledAt?: string;
    }>(HCW_ENDPOINTS.VISITS.CANCEL(payload.visitId), {
      body: JSON.stringify({
        cancellationReason: payload.cancellationReason,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = raw as any;
    return {
      success: true,
      data: {
        visitId: result?.visitId ?? payload.visitId,
        status: result?.status ?? "cancelled",
        cancellationReason: result?.cancellationReason,
        cancelledAt: result?.cancelledAt,
      },
    };
  }
}
