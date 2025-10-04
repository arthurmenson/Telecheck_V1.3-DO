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
} from "../lib/api-endpoints";

// Type definitions for API responses
const USER_ROLES = [
  "patient",
  "doctor",
  "admin",
  "pharmacist",
  "nurse",
] as const;

type UserRole = (typeof USER_ROLES)[number];

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && USER_ROLES.includes(value as UserRole);

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: string;
  notifications: boolean;
  language: string;
  timezone: string;
}

type RawUserRecord = Record<string, any>;

const toIsoString = (value?: string | Date | null): string => {
  if (!value) {
    return new Date().toISOString();
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
};

const normalizeUserRecord = (user: RawUserRecord): User => {
  const firstName = user?.firstName ?? user?.first_name ?? "";
  const lastName = user?.lastName ?? user?.last_name ?? "";
  const email = user?.email ?? "";
  const createdAtRaw = user?.createdAt ?? user?.created_at ?? null;
  const updatedAtRaw = user?.updatedAt ?? user?.updated_at ?? createdAtRaw;
  const lastLoginAtRaw = user?.lastLoginAt ?? user?.last_login_at ?? null;
  const isActiveValue =
    typeof user?.isActive === "boolean"
      ? user.isActive
      : user?.is_active !== undefined
        ? Boolean(user.is_active)
        : true;

  const idCandidate =
    user?.id ?? user?.user_id ?? user?.userId ?? email ?? "unknown-user";
  const roleValue = isUserRole(user?.role) ? user.role : "patient";

  return {
    id: idCandidate,
    email,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    name:
      user?.name ||
      [firstName, lastName].filter(Boolean).join(" ") ||
      email ||
      "Unknown User",
    role: roleValue,
    avatar: user?.avatarUrl ?? user?.avatar_url ?? user?.avatar ?? undefined,
    phone: user?.phone ?? user?.phoneNumber ?? undefined,
    isActive: isActiveValue,
    lastLoginAt: lastLoginAtRaw ? toIsoString(lastLoginAtRaw) : undefined,
    createdAt: toIsoString(createdAtRaw),
    updatedAt: toIsoString(updatedAtRaw),
    preferences:
      typeof user?.preferences === "object"
        ? (user.preferences as UserPreferences)
        : undefined,
  };
};

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalUsers: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  patients: number;
  doctors: number;
  pharmacists: number;
  admins: number;
  activeLast7Days: number;
  activeLast30Days: number;
}

export interface LabResult {
  id: string;
  labReportId?: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange?: string;
  status?: "normal" | "abnormal" | "critical" | string;
  testDate?: string;
  labName?: string;
  doctorNotes?: string;
  date?: string;
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
  isActive?: boolean;
}

export interface VitalSigns {
  id: string;
  userId?: string;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  recordedAt?: string;
  source?: "manual" | "device" | "wearable";
  // Legacy fields
  date?: string;
  bloodPressure?: { systolic: number; diastolic: number };
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
  ): Promise<
    ApiResponse<{ user: User; token: string; refreshToken?: string }>
  > {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    const payload: any = (response as any).data ?? response;

    if (payload?.success && payload.data?.user) {
      return {
        success: true,
        data: {
          user: normalizeUserRecord(payload.data.user),
          token: payload.data.token,
          refreshToken: payload.data.refreshToken,
        },
        message: payload.message,
      };
    }

    if (payload?.user && payload?.token) {
      return {
        success: true,
        data: {
          user: normalizeUserRecord(payload.user),
          token: payload.token,
          refreshToken: payload.refreshToken,
        },
        message: payload.message,
      };
    }

    return payload;
  }

  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  static async logout(): Promise<ApiResponse<void>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  static async refreshToken(
    refreshToken: string,
  ): Promise<ApiResponse<{ token: string }>> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken },
      { skipAuth: true },
    );
    const payload: any = (response as any).data ?? response;

    if (payload?.token) {
      return {
        success: true,
        data: { token: payload.token },
        message: payload.message,
      };
    }

    return payload;
  }

  static async resetPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
  }
}

// User Service
export class UserService {
  static async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE);
    const payload: any = (response as any).data ?? response;

    if (payload?.user) {
      return {
        success: true,
        data: normalizeUserRecord(payload.user),
        message: payload.message,
      };
    }

    return payload;
  }

  static async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    return apiClient.get(API_ENDPOINTS.USERS.PREFERENCES);
  }

  static async updateProfile(
    userData: Partial<User>,
  ): Promise<ApiResponse<User>> {
    const response = await apiClient.put(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      userData,
    );
    const payload: any = (response as any).data ?? response;

    if (payload?.user) {
      return {
        success: true,
        data: normalizeUserRecord(payload.user),
        message: payload.message,
      };
    }

    return payload;
  }

  static async updatePreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<ApiResponse<UserPreferences>> {
    const response = await apiClient.put(
      API_ENDPOINTS.USERS.PREFERENCES,
      preferences,
    );
    const payload: any = (response as any).data ?? response;

    if (payload?.preferences) {
      return {
        success: true,
        data: payload.preferences as UserPreferences,
        message: payload.message,
      };
    }

    return payload;
  }

  static async uploadAvatar(
    file: File,
  ): Promise<ApiResponse<{ avatarUrl: string }>> {
    return apiClient.upload(API_ENDPOINTS.USERS.AVATAR, file);
  }
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export class UserAdminService {
  private static normalizeUser(user: RawUserRecord): User {
    return normalizeUserRecord(user);
  }

  private static normalizePagination(
    pagination: RawUserRecord | undefined,
    defaults: { page: number; limit: number; totalUsers?: number },
  ) {
    const pageRaw = pagination?.page ?? pagination?.currentPage;
    const limitRaw = pagination?.limit ?? pagination?.pageSize;
    const page =
      typeof pageRaw === "string"
        ? parseInt(pageRaw, 10)
        : typeof pageRaw === "number"
          ? pageRaw
          : defaults.page;
    const limit =
      typeof limitRaw === "string"
        ? parseInt(limitRaw, 10)
        : typeof limitRaw === "number"
          ? limitRaw
          : defaults.limit;

    const totalRaw =
      pagination?.totalUsers ??
      pagination?.total_users ??
      pagination?.total ??
      defaults.totalUsers ??
      0;
    const totalUsers =
      typeof totalRaw === "string" ? parseInt(totalRaw, 10) : Number(totalRaw);

    const totalPagesRaw =
      pagination?.totalPages ?? pagination?.total_pages ?? undefined;
    const totalPages =
      typeof totalPagesRaw === "string"
        ? parseInt(totalPagesRaw, 10)
        : typeof totalPagesRaw === "number"
          ? totalPagesRaw
          : limit > 0
            ? Math.ceil(totalUsers / limit)
            : 0;

    const parseBool = (value: unknown, fallback: boolean) => {
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value !== 0;
      if (typeof value === "string") {
        return (
          value === "true" || value === "1" || value.toLowerCase() === "yes"
        );
      }
      return fallback;
    };

    return {
      page,
      limit,
      totalUsers,
      totalPages,
      hasNext: parseBool(
        pagination?.hasNext ?? pagination?.has_next,
        page < totalPages,
      ),
      hasPrevious: parseBool(
        pagination?.hasPrevious ?? pagination?.has_previous,
        page > 1,
      ),
    };
  }

  private static buildListResponse(
    payload: any,
    defaults: { page: number; limit: number },
  ): ApiResponse<UserListResponse> {
    const container =
      (payload?.data && typeof payload.data === "object"
        ? payload.data
        : undefined) ??
      payload ??
      {};

    const rawUsers = Array.isArray(container?.users)
      ? container.users
      : Array.isArray(container)
        ? container
        : [];

    const normalizedUsers = rawUsers.map((raw: RawUserRecord) =>
      UserAdminService.normalizeUser(raw),
    );

    const paginationSource =
      container?.pagination ?? payload?.pagination ?? undefined;

    const pagination = UserAdminService.normalizePagination(paginationSource, {
      page: defaults.page,
      limit: defaults.limit,
      totalUsers:
        paginationSource?.totalUsers ??
        paginationSource?.total_users ??
        container?.totalUsers ??
        container?.total_users ??
        normalizedUsers.length,
    });

    return {
      success: true,
      data: {
        users: normalizedUsers,
        pagination,
      },
    };
  }

  static async listUsers(
    params: ListUsersParams = {},
  ): Promise<ApiResponse<UserListResponse>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const search = params.search?.trim();

    const searchParams = new URLSearchParams();
    if (page) searchParams.set("page", String(page));
    if (limit) searchParams.set("limit", String(limit));
    if (search) searchParams.set("q", search);

    const queryString = searchParams.toString();
    const endpoint =
      queryString.length > 0
        ? `${API_ENDPOINTS.USERS.ADMIN.LIST}?${queryString}`
        : API_ENDPOINTS.USERS.ADMIN.LIST;

    try {
      const response = await apiClient.get(endpoint);
      const payload = (response as any)?.data ?? response;

      if (payload?.success === false) {
        return {
          success: false,
          error: payload?.error ?? "Failed to load users",
        };
      }

      return UserAdminService.buildListResponse(payload, { page, limit });
    } catch (error: any) {
      return {
        success: false,
        error: error?.message ?? "Failed to load users",
      };
    }
  }

  static async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.USERS.ADMIN.DETAIL(id),
      );
      const payload = (response as any)?.data ?? response;

      if (payload?.success === true && payload.data) {
        const record = payload.data.user ?? payload.data;
        return {
          success: true,
          data: UserAdminService.normalizeUser(record as RawUserRecord),
        };
      }

      if (payload?.user) {
        return {
          success: true,
          data: UserAdminService.normalizeUser(payload.user as RawUserRecord),
        };
      }

      return {
        success: false,
        error: payload?.error ?? "Unable to retrieve user",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message ?? "Unable to retrieve user",
      };
    }
  }

  static async inviteUser(user: {
    email: string;
    firstName: string;
    lastName: string;
    role: User["role"];
    phone?: string;
  }): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.USERS.ADMIN.INVITE,
        user,
      );
      const payload = (response as any)?.data ?? response;

      if (payload?.success === true && payload.data) {
        const invited = payload.data.user ?? payload.data;
        return {
          success: true,
          data: UserAdminService.normalizeUser(invited as RawUserRecord),
          message: payload.message ?? "User invited successfully",
        };
      }

      if (payload?.user) {
        return {
          success: true,
          data: UserAdminService.normalizeUser(payload.user as RawUserRecord),
          message: payload?.message ?? "User invited successfully",
        };
      }

      return {
        success: false,
        error: payload?.error ?? "Failed to invite user",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message ?? "Failed to invite user",
      };
    }
  }

  static async updateUser(
    id: string,
    updates: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      role: User["role"];
      isActive: boolean;
    }>,
  ): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.USERS.ADMIN.DETAIL(id),
        updates,
      );
      const payload = (response as any)?.data ?? response;

      if (payload?.success === true && payload.data) {
        const updated = payload.data.user ?? payload.data;
        return {
          success: true,
          data: UserAdminService.normalizeUser(updated as RawUserRecord),
          message: payload?.message ?? "User updated successfully",
        };
      }

      if (payload?.user) {
        return {
          success: true,
          data: UserAdminService.normalizeUser(payload.user as RawUserRecord),
          message: payload?.message ?? "User updated successfully",
        };
      }

      return {
        success: false,
        error: payload?.error ?? "Failed to update user",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message ?? "Failed to update user",
      };
    }
  }

  static async deactivateUser(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.USERS.ADMIN.DEACTIVATE(id),
      );
      const payload = (response as any)?.data ?? response;

      if (payload?.success === false) {
        return {
          success: false,
          error: payload?.error ?? "Failed to deactivate user",
        };
      }

      return {
        success: true,
        message: payload?.message ?? "User deactivated successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message ?? "Failed to deactivate user",
      };
    }
  }

  private static normalizeStats(stats: RawUserRecord): UserStatsResponse {
    const toNumber = (value: unknown): number => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    return {
      totalUsers: toNumber(stats?.totalUsers ?? stats?.total_users),
      activeUsers: toNumber(stats?.activeUsers ?? stats?.active_users),
      inactiveUsers: toNumber(stats?.inactiveUsers ?? stats?.inactive_users),
      patients: toNumber(stats?.patients),
      doctors: toNumber(stats?.doctors),
      pharmacists: toNumber(stats?.pharmacists),
      admins: toNumber(stats?.admins),
      activeLast7Days: toNumber(
        stats?.activeLast7Days ?? stats?.active_last_7_days,
      ),
      activeLast30Days: toNumber(
        stats?.activeLast30Days ?? stats?.active_last_30_days,
      ),
    };
  }

  static async getUserStats(): Promise<ApiResponse<UserStatsResponse>> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.ADMIN.STATS);
      const payload = (response as any)?.data ?? response;

      if (payload?.success === true && payload.data) {
        const stats = payload.data.stats ?? payload.data;
        return {
          success: true,
          data: UserAdminService.normalizeStats(stats as RawUserRecord),
        };
      }

      if (payload?.stats) {
        return {
          success: true,
          data: UserAdminService.normalizeStats(payload.stats as RawUserRecord),
        };
      }

      return {
        success: false,
        error: payload?.error ?? "Failed to load user statistics",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message ?? "Failed to load user statistics",
      };
    }
  }
}

// Lab Service
export class LabService {
  static async getResults(userId?: string): Promise<ApiResponse<LabResult[]>> {
    const endpoint = userId
      ? `${API_ENDPOINTS.LABS.RESULTS}/user/${userId}`
      : API_ENDPOINTS.LABS.RESULTS;

    const response = await apiClient.get(endpoint);
    const payload: any = (response as any).data ?? response;

    if (payload?.success === true && Array.isArray(payload.data)) {
      return payload;
    }

    if (Array.isArray(payload?.results)) {
      return { success: true, data: payload.results };
    }

    if (Array.isArray(payload)) {
      return { success: true, data: payload };
    }

    return payload;
  }

  static async getResultsForUser(
    userId: string,
  ): Promise<ApiResponse<LabResult[]>> {
    return this.getResults(userId);
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
    const response = await apiClient.get(endpoint);
    const payload: any = (response as any).data ?? response;

    if (payload?.success === true && Array.isArray(payload.data)) {
      return payload;
    }

    if (Array.isArray(payload?.medications)) {
      return { success: true, data: payload.medications };
    }

    if (Array.isArray(payload)) {
      return { success: true, data: payload };
    }

    return payload;
  }

  static async getMedicationsForUser(
    userId: string,
  ): Promise<ApiResponse<Medication[]>> {
    return this.getMedications(userId);
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
export class VitalsService {
  static async getVitalSigns(
    userId?: string,
  ): Promise<ApiResponse<VitalSigns[]>> {
    const endpoint = userId
      ? `${API_ENDPOINTS.VITALS.LIST}/${userId}`
      : API_ENDPOINTS.VITALS.LIST;
    return apiClient.get(endpoint);
  }

  static async getVitalSignsForUser(
    userId: string,
  ): Promise<ApiResponse<VitalSigns[]>> {
    return this.getVitalSigns(userId);
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

// Patient Service
export class PatientService {
  static async getPatientById(patientId: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.set("scope", "supervisor");
    return apiClient.get(`/patients/${patientId}?${params}`);
  }

  static async getPatientStats(): Promise<ApiResponse<any>> {
    return apiClient.get("/patients/stats");
  }

  static async searchPatients(
    filters: any = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      scope: "supervisor",
      ...filters,
    });
    return apiClient.get(`/patients/search?${params}`);
  }

  static async createPatient(patientData: any): Promise<ApiResponse<any>> {
    return apiClient.post("/patients", patientData);
  }

  static async updatePatient(
    patientId: string,
    updateData: any,
  ): Promise<ApiResponse<any>> {
    return apiClient.put(`/patients/${patientId}`, updateData);
  }

  static async getPatientAppointments(
    patientId: string,
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ scope: "supervisor" });
    return apiClient.get(`/patients/${patientId}/appointments?${params}`);
  }

  static async getPatientVitals(patientId: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ scope: "supervisor" });
    return apiClient.get(`/patients/${patientId}/vitals?${params}`);
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
