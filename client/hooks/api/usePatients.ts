import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PatientService, 
  Patient, 
  CreatePatientRequest, 
  UpdatePatientRequest, 
  PatientSearchFilters,
  PaginatedPatients,
  PatientStats,
  Appointment,
  VitalSigns
} from '../../services/patient.service';
import { useToast } from '../use-toast';

// Query Keys
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: PatientSearchFilters, page: number, limit: number) => 
    [...patientKeys.lists(), { filters, page, limit }] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  stats: () => [...patientKeys.all, 'stats'] as const,
  appointments: (patientId: string) => [...patientKeys.detail(patientId), 'appointments'] as const,
  vitals: (patientId: string, limit: number, offset: number) => 
    [...patientKeys.detail(patientId), 'vitals', { limit, offset }] as const,
};

// Get Patient Statistics
export function usePatientStats() {
  return useQuery({
    queryKey: patientKeys.stats(),
    queryFn: PatientService.getPatientStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry, let service handle fallbacks
    placeholderData: {
      total_patients: 0,
      active_patients: 0,
      inactive_patients: 0,
      new_this_month: 0,
      pediatric_patients: 0,
      senior_patients: 0
    },
    refetchOnWindowFocus: false,
  });
}

// Search Patients
export function useSearchPatients(
  filters: PatientSearchFilters = {},
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: patientKeys.list(filters, page, limit),
    queryFn: () => PatientService.searchPatients(filters, page, limit),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry, let service handle fallbacks
    placeholderData: {
      patients: [],
      total: 0,
      page: page,
      limit: limit,
      totalPages: 0
    },
    refetchOnWindowFocus: false,
  });
}

// Get All Patients (paginated)
export function usePatients(
  page: number = 1,
  limit: number = 20,
  status: 'active' | 'inactive' | 'archived' = 'active'
) {
  return useQuery({
    queryKey: patientKeys.list({ status }, page, limit),
    queryFn: () => PatientService.getPatients(page, limit, status),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry, let service handle fallbacks
    placeholderData: {
      patients: [],
      total: 0,
      page: page,
      limit: limit,
      totalPages: 0
    },
    refetchOnWindowFocus: false,
  });
}

// Get Patient by ID
export function usePatient(patientId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: () => PatientService.getPatientById(patientId),
    enabled: enabled && !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutes (longer to reduce requests)
    retry: 1, // Only retry once for rate limiting
    retryDelay: 2000, // Wait 2 seconds before retry
    refetchOnWindowFocus: false, // Avoid unnecessary refetches
    refetchOnMount: false, // Don't refetch on mount if we have data
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
}

// Get Patient Appointments
export function usePatientAppointments(patientId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: patientKeys.appointments(patientId),
    queryFn: () => PatientService.getPatientAppointments(patientId),
    enabled: enabled && !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

// Get Patient Vitals
export function usePatientVitals(
  patientId: string,
  limit: number = 20,
  offset: number = 0,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: patientKeys.vitals(patientId, limit, offset),
    queryFn: () => PatientService.getPatientVitals(patientId, limit, offset),
    enabled: enabled && !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

// Create Patient Mutation
export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (patientData: CreatePatientRequest) => 
      PatientService.createPatient(patientData),
    onSuccess: (newPatient: Patient) => {
      // Invalidate and refetch patient lists
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.stats() });
      
      // Add the new patient to cache
      queryClient.setQueryData(patientKeys.detail(newPatient.id), newPatient);
      
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update Patient Mutation
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ patientId, updateData }: { patientId: string; updateData: UpdatePatientRequest }) =>
      PatientService.updatePatient(patientId, updateData),
    onSuccess: (updatedPatient: Patient) => {
      // Update the specific patient in cache
      queryClient.setQueryData(patientKeys.detail(updatedPatient.id), updatedPatient);
      
      // Invalidate lists to ensure they're refreshed
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Archive Patient Mutation
export function useArchivePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (patientId: string) => PatientService.archivePatient(patientId),
    onSuccess: (_, patientId) => {
      // Remove from cache or update status
      queryClient.removeQueries({ queryKey: patientKeys.detail(patientId) });
      
      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.stats() });
      
      toast({
        title: "Success",
        description: "Patient archived successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Custom hook for patient search with debouncing
export function useDebouncedPatientSearch(
  initialFilters: PatientSearchFilters = {},
  page: number = 1,
  limit: number = 20,
  debounceMs: number = 300
) {
  const [filters, setFilters] = React.useState(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = React.useState(initialFilters);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, debounceMs]);

  const query = useSearchPatients(debouncedFilters, page, limit);

  return {
    ...query,
    filters,
    setFilters,
    isSearching: filters !== debouncedFilters || query.isFetching,
  };
}

// Optimistic updates helper
export function useOptimisticPatientUpdate() {
  const queryClient = useQueryClient();

  const updatePatientOptimistically = React.useCallback(
    (patientId: string, updateData: Partial<Patient>) => {
      queryClient.setQueryData(
        patientKeys.detail(patientId),
        (oldData: Patient | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updateData };
        }
      );
    },
    [queryClient]
  );

  const revertOptimisticUpdate = React.useCallback(
    (patientId: string) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
    },
    [queryClient]
  );

  return { updatePatientOptimistically, revertOptimisticUpdate };
}

// Prefetch helper
export function usePrefetchPatient() {
  const queryClient = useQueryClient();

  return React.useCallback(
    (patientId: string) => {
      queryClient.prefetchQuery({
        queryKey: patientKeys.detail(patientId),
        queryFn: () => PatientService.getPatientById(patientId),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

// Bulk operations
export function useBulkPatientOperations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const bulkArchive = React.useCallback(
    async (patientIds: string[]) => {
      try {
        await Promise.all(
          patientIds.map(id => PatientService.archivePatient(id))
        );
        
        // Invalidate affected queries
        queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
        queryClient.invalidateQueries({ queryKey: patientKeys.stats() });
        
        toast({
          title: "Success",
          description: `${patientIds.length} patients archived successfully`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    [queryClient, toast]
  );

  return { bulkArchive };
}

// React import for useCallback, useEffect, useState
import React from 'react';
