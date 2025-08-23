/**
 * React Query Integration Hooks
 * Modern data fetching with caching, background updates, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { ApiResponse } from '../../../shared/types';
import { ApiError } from '../../lib/api-client';

// Query Keys Factory
export const queryKeys = {
  // User queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
  },
  
  // Lab queries
  labs: {
    all: ['labs'] as const,
    results: (userId?: string) => [...queryKeys.labs.all, 'results', userId] as const,
    analysis: (userId?: string) => [...queryKeys.labs.all, 'analysis', userId] as const,
    trends: (userId?: string, days?: number) => [...queryKeys.labs.all, 'trends', userId, days] as const,
  },

  // Medication queries
  medications: {
    all: ['medications'] as const,
    list: (userId?: string) => [...queryKeys.medications.all, 'list', userId] as const,
    interactions: (userId?: string) => [...queryKeys.medications.all, 'interactions', userId] as const,
    search: (query: string) => [...queryKeys.medications.all, 'search', query] as const,
  },

  // Vital signs queries
  vitals: {
    all: ['vitals'] as const,
    list: (userId?: string) => [...queryKeys.vitals.all, 'list', userId] as const,
    trends: (userId?: string, days?: number) => [...queryKeys.vitals.all, 'trends', userId, days] as const,
  },

  // Chat queries
  chat: {
    all: ['chat'] as const,
    history: (userId?: string) => [...queryKeys.chat.all, 'history', userId] as const,
    sessions: () => [...queryKeys.chat.all, 'sessions'] as const,
  },

  // Program queries
  programs: {
    all: ['programs'] as const,
    list: () => [...queryKeys.programs.all, 'list'] as const,
    details: (id: string) => [...queryKeys.programs.all, 'details', id] as const,
    participants: (id: string) => [...queryKeys.programs.all, 'participants', id] as const,
    analytics: (id: string) => [...queryKeys.programs.all, 'analytics', id] as const,
  },

  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    reports: (type?: string) => [...queryKeys.analytics.all, 'reports', type] as const,
    populationHealth: () => [...queryKeys.analytics.all, 'population-health'] as const,
  },
} as const;

// Generic query hook with type safety
export function useApiQuery<TData = unknown, TError = ApiError>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<ApiResponse<TData>>,
  options?: Omit<UseQueryOptions<ApiResponse<TData>, TError, TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && 'status' in error && error.status && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}

// Generic mutation hook with type safety
export function useApiMutation<TData = unknown, TVariables = unknown, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, TError, TVariables>, 'mutationFn'>
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
    updater: (oldData: T | undefined) => T
  ) => {
    queryClient.setQueryData(queryKey, updater);
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
  interval: number = 30000 // 30 seconds default
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
  queryFn: (page: number, limit: number) => Promise<ApiResponse<{ items: T[]; total: number; page: number; limit: number }>>,
  initialLimit: number = 10
) {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(initialLimit);

  const query = useApiQuery(
    [...queryKey, page, limit],
    () => queryFn(page, limit),
    {
      keepPreviousData: true,
    }
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
    hasNextPage: query.data ? page < Math.ceil(query.data.total / limit) : false,
    hasPreviousPage: page > 1,
    totalPages: query.data ? Math.ceil(query.data.total / limit) : 0,
  };
}

// Infinite query hook for infinite scrolling
export function useInfiniteApiQuery<TData = unknown, TError = ApiError>(
  queryKey: readonly unknown[],
  queryFn: ({ pageParam }: { pageParam: number }) => Promise<ApiResponse<{ items: TData[]; nextPage?: number; hasMore: boolean }>>,
  options?: Omit<UseInfiniteQueryOptions<ApiResponse<{ items: TData[]; nextPage?: number; hasMore: boolean }>, TError>, 'queryKey' | 'queryFn' | 'getNextPageParam'>
) {
  return useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam: (lastPage) => lastPage.data?.nextPage,
    select: (data) => ({
      pages: data.pages.map(page => page.data),
      pageParams: data.pageParams,
    }),
    ...options,
  });
}

export default useApiQuery;
