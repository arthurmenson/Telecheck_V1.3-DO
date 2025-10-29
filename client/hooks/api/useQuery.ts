/**
 * React Query Integration Hooks
 * Modern data fetching with caching, background updates, and optimistic updates
 */

import React from "react";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
  InfiniteData,
} from "@tanstack/react-query";
import { ApiResponse } from "../../../shared/types";
import { ApiError } from "../../lib/api-client";
import type { ProvidersQueryParams } from "../../types/telemedicine";

// Query Keys Factory
export const queryKeys = {
  // User queries
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    preferences: () => [...queryKeys.user.all, "preferences"] as const,
  },

  // Lab queries
  labs: {
    all: ["labs"] as const,
    results: (userId?: string) =>
      [...queryKeys.labs.all, "results", userId] as const,
    analysis: (userId?: string) =>
      [...queryKeys.labs.all, "analysis", userId] as const,
    trends: (userId?: string, days?: number) =>
      [...queryKeys.labs.all, "trends", userId, days] as const,
  },

  // Medication queries
  medications: {
    all: ["medications"] as const,
    list: (userId?: string) =>
      [...queryKeys.medications.all, "list", userId] as const,
    interactions: (userId?: string) =>
      [...queryKeys.medications.all, "interactions", userId] as const,
    search: (query: string) =>
      [...queryKeys.medications.all, "search", query] as const,
  },

  // Vital signs queries
  vitals: {
    all: ["vitals"] as const,
    list: (userId?: string) =>
      [...queryKeys.vitals.all, "list", userId] as const,
    trends: (userId?: string, days?: number) =>
      [...queryKeys.vitals.all, "trends", userId, days] as const,
  },

  // Chat queries
  chat: {
    all: ["chat"] as const,
    history: (userId?: string) =>
      [...queryKeys.chat.all, "history", userId] as const,
    sessions: () => [...queryKeys.chat.all, "sessions"] as const,
  },

  // Program queries
  programs: {
    all: ["programs"] as const,
    list: () => [...queryKeys.programs.all, "list"] as const,
    details: (id: string) =>
      [...queryKeys.programs.all, "details", id] as const,
    participants: (id: string) =>
      [...queryKeys.programs.all, "participants", id] as const,
    analytics: (id: string) =>
      [...queryKeys.programs.all, "analytics", id] as const,
  },

  // Analytics queries
  analytics: {
    all: ["analytics"] as const,
    dashboard: () => [...queryKeys.analytics.all, "dashboard"] as const,
    reports: (type?: string) =>
      [...queryKeys.analytics.all, "reports", type] as const,
    populationHealth: () =>
      [...queryKeys.analytics.all, "population-health"] as const,
  },
  // Telemedicine scheduling
  telemedicine: {
    all: ["telemedicine"] as const,
    providers: (filters?: ProvidersQueryParams) =>
      [
        ...queryKeys.telemedicine.all,
        "providers",
        filters?.specialty ?? null,
        filters?.videoEnabled ?? null,
        filters?.available ?? null,
      ] as const,
  },
  // eRx queries
  erx: {
    all: ["erx"] as const,
    prescription: (id: string) =>
      [...queryKeys.erx.all, "prescription", id] as const,
    history: (patientId: string) =>
      [...queryKeys.erx.all, "history", patientId] as const,
  },
  // Clinical entities
  clinical: {
    all: ["clinical"] as const,
    conditions: (patientId?: string) =>
      [...queryKeys.clinical.all, "conditions", patientId] as const,
    encounters: (patientId?: string) =>
      [...queryKeys.clinical.all, "encounters", patientId] as const,
    orders: (patientId?: string) =>
      [...queryKeys.clinical.all, "orders", patientId] as const,
  },
  // HCW integration
  hcw: {
    all: ["hcw"] as const,
    caregivers: () => [...queryKeys.hcw.all, "caregivers"] as const,
    threads: () => [...queryKeys.hcw.all, "threads"] as const,
    messages: (caregiverId?: string | null) =>
      [...queryKeys.hcw.all, "messages", caregiverId ?? "none"] as const,
    visits: {
      upcoming: () => [...queryKeys.hcw.all, "visits", "upcoming"] as const,
      history: () => [...queryKeys.hcw.all, "visits", "history"] as const,
    },
  },
} as const;

// Generic query hook with type safety
export function useApiQuery<
  TData = unknown,
  TError extends ApiError = ApiError,
>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<ApiResponse<TData>>,
  options?: Omit<
    UseQueryOptions<ApiResponse<TData>, TError, TData, readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<ApiResponse<TData>, TError, TData, readonly unknown[]>({
    queryKey,
    queryFn,
    select: (data) => data.data as TData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      const maybeApiError = error as Partial<ApiError> | undefined;
      const status =
        typeof maybeApiError?.status === "number"
          ? maybeApiError.status
          : undefined;
      if (typeof status === "number" && status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}

// Generic mutation hook with type safety
export function useApiMutation<
  TData = unknown,
  TVariables = unknown,
  TError = ApiError,
>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: Omit<
    UseMutationOptions<ApiResponse<TData>, TError, TVariables>,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

// Optimistic update helper
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  const updateCache = <T>(
    queryKey: readonly unknown[],
    updater: (oldData: T | undefined) => T | undefined,
  ) => {
    queryClient.setQueryData<T | undefined>(queryKey, updater);
  };

  const invalidateQueries = (queryKey: readonly unknown[]) => {
    queryClient.invalidateQueries({ queryKey });
  };

  const refetchQueries = (queryKey: readonly unknown[]) => {
    queryClient.refetchQueries({ queryKey });
  };

  return {
    updateCache,
    invalidateQueries,
    refetchQueries,
  };
}

// Background sync hook for real-time updates
export function useBackgroundSync(
  queryKey: readonly unknown[],
  interval: number = 30000, // 30 seconds default
) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey });
    }, interval);

    return () => clearInterval(intervalId);
  }, [queryClient, queryKey, interval]);
}

// Pagination hook
export function usePagination<T>(
  queryKey: readonly unknown[],
  queryFn: (
    page: number,
    limit: number,
  ) => Promise<
    ApiResponse<{ items: T[]; total: number; page: number; limit: number }>
  >,
  initialLimit: number = 10,
) {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(initialLimit);

  const query = useApiQuery(
    [...queryKey, page, limit],
    () => queryFn(page, limit),
    {
      placeholderData: (previous) => previous,
    },
  );

  const nextPage = () => {
    if (query.data && page < Math.ceil(query.data.total / limit)) {
      setPage(page + 1);
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  return {
    ...query,
    page,
    limit,
    nextPage,
    previousPage,
    goToPage,
    changeLimit,
    hasNextPage: query.data
      ? page < Math.ceil(query.data.total / limit)
      : false,
    hasPreviousPage: page > 1,
    totalPages: query.data ? Math.ceil(query.data.total / limit) : 0,
  };
}

// Infinite query hook for infinite scrolling
export function useInfiniteApiQuery<
  TData = unknown,
  TError extends ApiError = ApiError,
>(
  queryKey: readonly unknown[],
  queryFn: (context: {
    pageParam: number;
  }) => Promise<
    ApiResponse<{ items: TData[]; nextPage?: number; hasMore: boolean }>
  >,
  options?: Omit<
    UseInfiniteQueryOptions<
      ApiResponse<{ items: TData[]; nextPage?: number; hasMore: boolean }>,
      TError,
      ApiResponse<{ items: TData[]; nextPage?: number; hasMore: boolean }>,
      readonly unknown[],
      number
    >,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >,
) {
  return useInfiniteQuery<
    ApiResponse<{ items: TData[]; nextPage?: number; hasMore: boolean }>,
    TError,
    ApiResponse<{ items: TData[]; nextPage?: number; hasMore: boolean }>,
    readonly unknown[],
    number
  >({
    queryKey,
    initialPageParam: 1,
    queryFn: (context) => {
      const rawPage = context.pageParam;
      const nextPage = typeof rawPage === "number" && rawPage > 0 ? rawPage : 1;
      return queryFn({ pageParam: nextPage });
    },
    getNextPageParam: (lastPage) => lastPage?.data?.nextPage ?? undefined,
    ...options,
  });
}

export default useApiQuery;
