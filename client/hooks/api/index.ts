/**
 * Domain-specific API Hooks
 * Ready-to-use hooks for different data domains
 */

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
        // Optimistic update
        updateCache(queryKeys.user.profile(), (old) => ({
          ...old,
          ...newUserData,
        }));
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
    () => UserService.updatePreferences({}), // Get current preferences
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
        updateCache(queryKeys.user.preferences(), (old) => ({
          ...old,
          ...newPreferences,
        }));
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
      },
      onSettled: () => {
        invalidateQueries(queryKeys.programs.all);
      },
    },
  );
}

export function useProgramParticipants(programId: string) {
  return useApiQuery(queryKeys.programs.participants(programId), () =>
    ProgramService.getProgramParticipants(programId),
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
  const { invalidateQueries } = useOptimisticUpdate();

  return useApiMutation(() => AuthService.logout(), {
    onSuccess: () => {
      // Clear all cached data on logout
      invalidateQueries([]);
    },
  });
}

// Export everything
export * from "./useQuery";
export { queryKeys, useApiQuery, useApiMutation, useOptimisticUpdate };
