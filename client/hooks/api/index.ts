/**
 * Domain-specific API Hooks
 * Ready-to-use hooks for different data domains
 */

import { useQueryClient } from "@tanstack/react-query";

import {
  useApiQuery,
  useApiMutation,
  useOptimisticUpdate,
  queryKeys,
} from "./useQuery";
import {
  AuthService,
  UserService,
  LabService,
  MedicationService,
  VitalService,
  ChatService,
  ProgramService,
  AnalyticsService,
  FileService,
  TelehealthService,
  ErxService,
  BillingService,
  EligibilityService,
  PharmacyService,
  ClinicalService,
  User,
  UserPreferences,
  LabResult,
  Medication,
  VitalSigns,
  Program,
} from "../../services/api.service";

// ========================================
// User Hooks
// ========================================

export function useUserProfile() {
  return useApiQuery(queryKeys.user.profile(), UserService.getProfile, {
    staleTime: 10 * 60 * 1000, // 10 minutes - profile doesn't change often
  });
}

export function useUpdateProfile() {
  const { updateCache, invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    (userData: Partial<User>) => UserService.updateProfile(userData),
    {
      onMutate: async (newUserData) => {
        updateCache<User>(
          queryKeys.user.profile(),
          (old) => {
            const base = (old ?? ({} as User));
            return { ...base, ...newUserData } as User;
          },
        );
      },
      onSettled: () => {
        // Invalidate to ensure fresh data
        invalidateQueries(queryKeys.user.profile());
      },
    },
  );
}

export function useUserPreferences() {
  return useApiQuery(
    queryKeys.user.preferences(),
    UserService.getPreferences,
    {
      staleTime: 10 * 60 * 1000,
    },
  );
}

export function useUpdatePreferences() {
  const { updateCache, invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    (preferences: Partial<UserPreferences>) =>
      UserService.updatePreferences(preferences),
    {
      onMutate: async (newPreferences) => {
        updateCache<UserPreferences>(
          queryKeys.user.preferences(),
          (old) => {
            const base = (old ?? ({} as UserPreferences));
            return { ...base, ...newPreferences } as UserPreferences;
          },
        );
      },
      onSettled: () => {
        invalidateQueries(queryKeys.user.preferences());
      },
    },
  );
}

// ========================================
// Lab Hooks
// ========================================

export function useLabResults(userId?: string) {
  return useApiQuery(
    queryKeys.labs.results(userId),
    () => LabService.getResults(userId),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes - lab results change frequently
    },
  );
}

export function useLabAnalysis(userId?: string) {
  return useApiQuery(queryKeys.labs.analysis(userId), () =>
    LabService.getAnalysis(userId),
  );
}

export function useLabTrends(userId?: string, days?: number) {
  return useApiQuery(queryKeys.labs.trends(userId, days), () =>
    LabService.getTrends(userId, days),
  );
}

export function useUploadLabReport() {
  const { invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    ({ file, userId }: { file: File; userId?: string }) =>
      LabService.uploadLabReport(file, userId),
    {
      onSuccess: () => {
        // Invalidate lab-related queries after successful upload
        invalidateQueries(queryKeys.labs.all);
      },
    },
  );
}

// ========================================
// Medication Hooks
// ========================================

export function useMedications(userId?: string) {
  return useApiQuery(queryKeys.medications.list(userId), () =>
    MedicationService.getMedications(userId),
  );
}

export function useAddMedication() {
  const { updateCache, invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    ({
      medication,
      userId,
    }: {
      medication: Omit<Medication, "id">;
      userId?: string;
    }) => MedicationService.addMedication(medication, userId),
    {
      onMutate: async ({ medication, userId }) => {
        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticMedication = { ...medication, id: tempId };

        updateCache(
          queryKeys.medications.list(userId),
          (old: Medication[] = []) => [...old, optimisticMedication],
        );
      },
      onSettled: (data, error, { userId }) => {
        invalidateQueries(queryKeys.medications.list(userId));
        invalidateQueries(queryKeys.medications.interactions(userId));
      },
    },
  );
}

export function useUpdateMedication() {
  const { updateCache, invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    ({ id, medication }: { id: string; medication: Partial<Medication> }) =>
      MedicationService.updateMedication(id, medication),
    {
      onMutate: async ({ id, medication }) => {
        updateCache(queryKeys.medications.list(), (old: Medication[] = []) =>
          old.map((med) => (med.id === id ? { ...med, ...medication } : med)),
        );
      },
      onSettled: () => {
        invalidateQueries(queryKeys.medications.all);
      },
    },
  );
}

export function useDeleteMedication() {
  const { updateCache, invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    (id: string) => MedicationService.deleteMedication(id),
    {
      onMutate: async (id) => {
        updateCache(queryKeys.medications.list(), (old: Medication[] = []) =>
          old.filter((med) => med.id !== id),
        );
      },
      onSettled: () => {
        invalidateQueries(queryKeys.medications.all);
      },
    },
  );
}

export function useMedicationInteractions(userId?: string) {
  return useApiQuery(queryKeys.medications.interactions(userId), () =>
    MedicationService.checkInteractions(userId),
  );
}

export function useSearchMedications(query: string) {
  return useApiQuery(
    queryKeys.medications.search(query),
    () => MedicationService.searchMedications(query),
    {
      enabled: query.length > 2, // Only search if query is at least 3 characters
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );
}

// ========================================
// Vital Signs Hooks
// ========================================

export function useVitalSigns(userId?: string) {
  return useApiQuery(queryKeys.vitals.list(userId), () =>
    VitalService.getVitalSigns(userId),
  );
}

export function useAddVitalSigns() {
  const { updateCache, invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    ({ vitals, userId }: { vitals: Omit<VitalSigns, "id">; userId?: string }) =>
      VitalService.addVitalSigns(vitals, userId),
    {
      onMutate: async ({ vitals, userId }) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticVitals = { ...vitals, id: tempId };

        updateCache(queryKeys.vitals.list(userId), (old: VitalSigns[] = []) => [
          optimisticVitals,
          ...old,
        ]);
      },
      onSettled: (data, error, { userId }) => {
        invalidateQueries(queryKeys.vitals.list(userId));
        invalidateQueries(queryKeys.vitals.trends(userId));
      },
    },
  );
}

export function useVitalTrends(userId?: string, days?: number) {
  return useApiQuery(queryKeys.vitals.trends(userId, days), () =>
    VitalService.getVitalTrends(userId, days),
  );
}

// ========================================
// Chat Hooks
// ========================================

export function useChatHistory(userId?: string) {
  return useApiQuery(queryKeys.chat.history(userId), () =>
    ChatService.getChatHistory(userId),
  );
}

export function useSendChatMessage() {
  const { updateCache, invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    ({
      message,
      context,
      userId,
    }: {
      message: string;
      context?: any;
      userId?: string;
    }) => ChatService.sendMessage(message, context, userId),
    {
      onMutate: async ({ message, userId }) => {
        // Optimistic update - add user message immediately
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          message,
          sender: "user",
          timestamp: new Date().toISOString(),
        };

        updateCache(queryKeys.chat.history(userId), (old: any[] = []) => [
          ...old,
          optimisticMessage,
        ]);
      },
      onSettled: (data, error, { userId }) => {
        invalidateQueries(queryKeys.chat.history(userId));
      },
    },
  );
}

// ========================================
// Program Hooks
// ========================================

export function usePrograms() {
  return useApiQuery(queryKeys.programs.list(), ProgramService.getPrograms);
}

export function useProgramDetails(id: string) {
  return useApiQuery(
    queryKeys.programs.details(id),
    () => ProgramService.getProgram(id),
    {
      enabled: Boolean(id),
    },
  );
}

export function useCreateProgram() {
  const { invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    (program: Omit<Program, "id">) => ProgramService.createProgram(program),
    {
      onSuccess: () => {
        invalidateQueries(queryKeys.programs.list());
      },
    },
  );
}

export function useUpdateProgram() {
  const { updateCache, invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    ({ id, program }: { id: string; program: Partial<Program> }) =>
      ProgramService.updateProgram(id, program),
    {
      onMutate: async ({ id, program }) => {
        updateCache(queryKeys.programs.list(), (old: Program[] = []) =>
          old.map((p) => (p.id === id ? { ...p, ...program } : p)),
        );
        updateCache(queryKeys.programs.details(id), (old: Program | undefined) =>
          old ? { ...old, ...program } : old,
        );
      },
      onSettled: (_data, _error, { id: programId }) => {
        invalidateQueries(queryKeys.programs.list());
        invalidateQueries(queryKeys.programs.details(programId));
        invalidateQueries(queryKeys.programs.analytics(programId));
      },
    },
  );
}

export function useDeleteProgram() {
  const { updateCache, invalidateQueries } = useOptimisticUpdate();

  return useApiMutation((id: string) => ProgramService.deleteProgram(id), {
    onMutate: async (id) => {
      updateCache(queryKeys.programs.list(), (old: Program[] = []) =>
        old.filter((program) => program.id !== id),
      );
    },
    onSettled: (_data, _error, id) => {
      invalidateQueries(queryKeys.programs.list());
      invalidateQueries(queryKeys.programs.details(id));
      invalidateQueries(queryKeys.programs.analytics(id));
      invalidateQueries(queryKeys.programs.participants(id));
    },
  });
}

export function useProgramParticipants(programId: string) {
  return useApiQuery(queryKeys.programs.participants(programId), () =>
    ProgramService.getProgramParticipants(programId),
    {
      enabled: Boolean(programId),
    },
  );
}

export function useProgramAnalytics(programId: string) {
  return useApiQuery(queryKeys.programs.analytics(programId), () =>
    ProgramService.getProgramAnalytics(programId),
    {
      enabled: Boolean(programId),
    },
  );
}

export function useEnrollParticipant() {
  const { invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(
    ({
      programId,
      participantData,
    }: {
      programId: string;
      participantData: any;
    }) => ProgramService.enrollParticipant(programId, participantData),
    {
      onSuccess: (data, { programId }) => {
        invalidateQueries(queryKeys.programs.participants(programId));
        invalidateQueries(queryKeys.programs.list());
      },
    },
  );
}

// ========================================
// Analytics Hooks
// ========================================

export function useAnalyticsDashboard() {
  return useApiQuery(
    queryKeys.analytics.dashboard(),
    AnalyticsService.getDashboardData,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
  );
}

export function useAnalyticsReports(type?: string) {
  return useApiQuery(queryKeys.analytics.reports(type), () =>
    AnalyticsService.getReports(type),
  );
}

// ========================================
// File Upload Hooks
// ========================================

export function useUploadFile() {
  return useApiMutation(
    ({ file, category }: { file: File; category?: string }) =>
      FileService.uploadFile(file, category),
  );
}

// ========================================
// Telehealth Hooks
// ========================================

export function useTelehealthSessions() {
  return useApiQuery(["telehealth", "sessions"], TelehealthService.listSessions);
}

export function useCreateTelehealthRoom() {
  return useApiMutation(({ appointmentId }: { appointmentId: string }) =>
    TelehealthService.createRoom(appointmentId),
  );
}

export function useJoinTelehealthRoom() {
  return useApiMutation(({ roomId }: { roomId: string }) =>
    TelehealthService.joinRoom(roomId),
  );
}

export function useEndTelehealthSession() {
  return useApiMutation(({ roomId }: { roomId: string }) =>
    TelehealthService.endSession(roomId),
  );
}

// ========================================
// e-Prescribing Hooks (stubs)
// ========================================

export function useCreatePrescription() {
  return useApiMutation((payload: any) => ErxService.createPrescription(payload));
}

export function usePrescription(id: string) {
  return useApiQuery(["erx", "prescription", id], () => ErxService.getPrescription(id));
}

export function useCancelPrescription() {
  return useApiMutation((id: string) => ErxService.cancelPrescription(id));
}

export function useRefillPrescription() {
  return useApiMutation((id: string) => ErxService.requestRefill(id));
}

export function useVerifyEpcs() {
  return useApiMutation(({ otp }: { otp: string }) => ErxService.verifyEpcs(otp));
}

export function useMedicationHistory(patientId: string) {
  return useApiQuery(["erx", "history", patientId], () => ErxService.getMedicationHistory(patientId));
}

// ========================================
// Billing & Eligibility Hooks
// ========================================

export function useGenerate837P() {
  return useApiMutation((payload: any) => BillingService.generate837P(payload));
}

export function useClaimStatus(id: string) {
  return useApiQuery(["billing", "claim", id], () => BillingService.getClaimStatus(id), { enabled: Boolean(id) });
}

export function useEligibilityCheck() {
  return useApiMutation((payload: { member: any; payer: any; serviceType?: string }) => EligibilityService.checkEligibility(payload));
}

// ========================================
// Pharmacy Commerce Hooks
// ========================================

export function useCommerceCatalog() {
  return useApiQuery(["commerce", "catalog"], PharmacyService.getCatalog);
}

export function useCommerceSearch(q: string) {
  return useApiQuery(["commerce", "search", q], () => PharmacyService.searchCatalog(q), { enabled: q.length > 2 });
}

export function useCreateOrder() {
  return useApiMutation((payload: any) => PharmacyService.createOrder(payload));
}

export function useOrder(id: string) {
  return useApiQuery(["commerce", "order", id], () => PharmacyService.getOrder(id), { enabled: Boolean(id) });
}

// ========================================
// Clinical Hooks (Conditions/Allergies/Immunizations)
// ========================================

export function useConditions(patientId?: string) {
  return useApiQuery(
    queryKeys.clinical.conditions(patientId),
    () => ClinicalService.listConditions(patientId),
  );
}

export function useCreateCondition() {
  const { invalidateQueries } = useOptimisticUpdate();
  return useApiMutation((payload: any) => ClinicalService.createCondition(payload), {
    onSuccess: (_data, variables) => {
      const pid = variables?.patientId;
      invalidateQueries(queryKeys.clinical.conditions(pid));
    }
  });
}

export function useUpdateCondition() {
  const { invalidateQueries } = useOptimisticUpdate();
  return useApiMutation(({ id, payload }: { id: string; payload: any }) => ClinicalService.updateCondition(id, payload), {
    onSuccess: (_data, { payload }) => {
      const pid = payload?.patientId;
      invalidateQueries(queryKeys.clinical.conditions(pid));
    }
  });
}

export function useDeleteCondition() {
  const { invalidateQueries } = useOptimisticUpdate();
  return useApiMutation(({ id, patientId }: { id: string; patientId?: string }) => ClinicalService.deleteCondition(id), {
    onSuccess: (_data, { patientId }) => {
      invalidateQueries(queryKeys.clinical.conditions(patientId));
    }
  });
}

export function useEncounters(patientId?: string) {
  return useApiQuery(queryKeys.clinical.encounters(patientId), () => ClinicalService.listEncounters?.(patientId) as any);
}

export function useOrders(patientId?: string) {
  return useApiQuery(queryKeys.clinical.orders(patientId), () => ClinicalService.listOrders?.(patientId) as any);
}

// ========================================
// Authentication Hooks
// ========================================

export function useLogin() {
  return useApiMutation(
    ({ email, password }: { email: string; password: string }) =>
      AuthService.login(email, password),
  );
}

export function useRegister() {
  return useApiMutation(
    (userData: {
      email: string;
      password: string;
      name: string;
      role?: string;
    }) => AuthService.register(userData),
  );
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useApiMutation(() => AuthService.logout(), {
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Export everything
export * from "./useQuery";
export { queryKeys, useApiQuery, useApiMutation, useOptimisticUpdate };


