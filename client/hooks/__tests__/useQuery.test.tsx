// @vitest-environment jsdom

import React, { act } from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

import { useOptimisticUpdate, usePagination } from "../api/useQuery";

type WrapperComponent = React.ComponentType<{ children: React.ReactNode }>;

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

async function waitUntil(predicate: () => boolean, timeout = 1000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeout) {
      throw new Error("waitUntil timed out");
    }
    await act(async () => {
      await flushPromises();
    });
  }
}

interface RenderHookResult<T> {
  result: { current: T };
  rerender: () => void;
  unmount: () => void;
  cleanup: () => void;
}

function renderHook<T>(
  hook: () => T,
  options?: { wrapper?: WrapperComponent },
): RenderHookResult<T> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const result: { current: T } = { current: undefined as unknown as T };

  function TestComponent() {
    result.current = hook();
    return null;
  }

  const element = options?.wrapper
    ? React.createElement(
        options.wrapper,
        null,
        React.createElement(TestComponent),
      )
    : React.createElement(TestComponent);

  act(() => {
    root.render(element);
  });

  return {
    result,
    rerender: () => {
      act(() => {
        root.render(element);
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
    },
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useOptimisticUpdate", () => {
  it("updates cache and forwards invalidate/refetch calls", async () => {
    const queryClient = createTestQueryClient();
    const wrapper: WrapperComponent = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result, cleanup } = renderHook(() => useOptimisticUpdate(), {
      wrapper,
    });

    const queryKey = ["test", "optimistic"] as const;
    queryClient.setQueryData(queryKey, { count: 1 });

    act(() => {
      result.current.updateCache(
        queryKey,
        (old: { count: number } | undefined) => ({
          count: (old?.count ?? 0) + 1,
        }),
      );
    });

    expect(queryClient.getQueryData(queryKey)).toEqual({ count: 2 });

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    await act(async () => {
      await result.current.invalidateQueries(queryKey);
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });

    const refetchSpy = vi.spyOn(queryClient, "refetchQueries");
    await act(async () => {
      await result.current.refetchQueries(queryKey);
    });
    expect(refetchSpy).toHaveBeenCalledWith({ queryKey });

    cleanup();
    queryClient.clear();
  });
});

describe("usePagination", () => {
  it("manages page state and derives pagination metadata", async () => {
    const queryKey = ["programs", "paginated"] as const;
    const totalItems = 5;
    const itemsPerPage = 2;

    const queryFn = vi.fn(async (page: number, limit: number) => ({
      success: true,
      data: {
        items: Array.from({ length: limit }, (_, index) => ({
          id: `${page}-${index}`,
        })),
        total: totalItems,
        page,
        limit,
      },
    }));

    const queryClient = createTestQueryClient();
    const wrapper: WrapperComponent = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result, cleanup } = renderHook(
      () => usePagination(queryKey, queryFn, itemsPerPage),
      { wrapper },
    );

    await waitUntil(() => Boolean(result.current.data));

    expect(queryFn).toHaveBeenCalledWith(1, itemsPerPage);
    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(itemsPerPage);
    expect(result.current.totalPages).toBe(
      Math.ceil(totalItems / itemsPerPage),
    );
    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.nextPage();
    });

    await waitUntil(() => result.current.page === 2);

    expect(queryFn).toHaveBeenCalledWith(2, itemsPerPage);
    expect(result.current.hasPreviousPage).toBe(true);

    act(() => {
      result.current.changeLimit(totalItems);
    });

    await waitUntil(() => result.current.limit === totalItems);

    expect(result.current.page).toBe(1);
    expect(result.current.hasNextPage).toBe(false);

    cleanup();
    queryClient.clear();
  });
});
