/**
 * Centralized API Client with best practices
 * - Type safety
 * - Error handling
 * - Request/Response interceptors
 * - Automatic retries
 * - Request cancellation
 * - Loading states
 */

import { ApiResponse } from "../../shared/types";
import { track } from "../../lib/telemetry";

// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' ? "/api" : "https://whale-app-bs3xa.ondigitalocean.app/api"),
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

// Request/Response Types
export interface ApiRequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
  url?: string;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
  response?: Response;
  payload?: unknown;
}

// Centralized API Client Class
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private interceptors: {
    request: Array<
      (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>
    >;
    response: Array<(response: Response) => Response | Promise<Response>>;
    error: Array<(error: ApiError) => ApiError | Promise<ApiError>>;
  };

  constructor(baseURL = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      Accept: "application/json",
    };
    this.interceptors = {
      request: [],
      response: [],
      error: [],
    };

    // Setup default interceptors
    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors() {
    // Request interceptor for auth
    this.addRequestInterceptor(async (config) => {
      const token = this.getAuthToken();
      if (token && !config.skipAuth) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      } else if (!token && !config.skipAuth) {
        console.warn(
          `[ApiClient] No auth token available for request to ${config.url}`,
        );
      }
      return config;
    });

    // Response interceptor for error handling
    this.addResponseInterceptor(async (response) => {
      if (!response.ok) {
        throw await this.createApiError(response);
      }
      return response;
    });

    // Error interceptor for retry logic
    this.addErrorInterceptor(async (error) => {
      if (this.shouldRetry(error)) {
        throw error; // Will be caught by retry logic
      }
      return error;
    });
  }

  private getAuthToken(): string | null {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.warn("[ApiClient] No auth token found in localStorage");
    }
    return token;
  }

  private async createApiError(response: Response): Promise<ApiError> {
    const contentType = response.headers.get("content-type");
    let errorPayload: any = null;

    if (contentType?.includes("application/json")) {
      try {
        errorPayload = await response.json();
      } catch {
        errorPayload = null;
      }
    } else {
      try {
        const textPayload = await response.text();
        if (textPayload) {
          errorPayload = { message: textPayload };
        }
      } catch {
        errorPayload = null;
      }
    }

    if (!errorPayload) {
      errorPayload = { message: response.statusText };
    }

    console.error(
      `[ApiClient] API Error - Status: ${response.status}, URL: ${response.url}`,
    );
    console.error(
      "Error details:",
      JSON.stringify(
        {
          status: response.status,
          statusText: response.statusText,
          errorData: errorPayload,
          headers: Object.fromEntries(response.headers.entries()),
        },
        null,
        2,
      ),
    );

    const message =
      (typeof errorPayload === "object" &&
      errorPayload &&
      "message" in errorPayload
        ? (errorPayload as any).message
        : undefined) || `API Error: ${response.status} ${response.statusText}`;

    const error = new Error(message) as ApiError;
    error.status = response.status;
    if (errorPayload && typeof errorPayload === "object") {
      error.code = (errorPayload as any).code ?? error.code;
      error.details = (errorPayload as any).details ?? errorPayload;
    } else {
      error.details = errorPayload;
    }
    error.payload = errorPayload;
    error.response = response;
    return error;
  }

  private mergeHeaders(headers?: HeadersInit): Headers {
    const merged = new Headers(this.defaultHeaders);

    if (!headers) {
      return merged;
    }

    if (headers instanceof Headers) {
      headers.forEach((value, key) => merged.set(key, value));
      return merged;
    }

    if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => merged.set(key, String(value)));
      return merged;
    }

    Object.entries(headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        merged.set(key, value.join(", "));
      } else if (value !== undefined) {
        merged.set(key, String(value));
      }
    });

    return merged;
  }

  private isFormData(body: BodyInit | null | undefined): body is FormData {
    return typeof FormData !== "undefined" && body instanceof FormData;
  }

  private shouldParseJson(response: Response): boolean {
    if (response.status === 204 || response.status === 205) {
      return false;
    }
    const contentType = response.headers.get("content-type");
    return !!contentType && contentType.includes("application/json");
  }

  private toApiError(error: unknown): ApiError {
    if (error instanceof Error) {
      return error as ApiError;
    }
    const fallback = new Error("Unknown error") as ApiError;
    fallback.details = error;
    return fallback;
  }

  private getRetryDelay(error: ApiError, attempt: number): number {
    const baseDelay =
      error.status === 429
        ? API_CONFIG.RETRY_DELAY * 2
        : API_CONFIG.RETRY_DELAY;
    return baseDelay * Math.pow(2, attempt);
  }

  private shouldRetry(error: ApiError): boolean {
    // Retry on network errors, 5xx status codes, or rate limiting (429)
    return !error.status || error.status >= 500 || error.status === 429;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Interceptor methods
  addRequestInterceptor(
    interceptor: (
      config: ApiRequestConfig,
    ) => ApiRequestConfig | Promise<ApiRequestConfig>,
  ) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(
    interceptor: (response: Response) => Response | Promise<Response>,
  ) {
    this.interceptors.response.push(interceptor);
  }

  addErrorInterceptor(
    interceptor: (error: ApiError) => ApiError | Promise<ApiError>,
  ) {
    this.interceptors.error.push(interceptor);
  }

  // Core request method
  async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const {
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.MAX_RETRIES,
      skipAuth = false,
      skipErrorHandling = false,
      ...requestConfig
    } = config;

    let finalConfig: ApiRequestConfig = {
      ...requestConfig,
      ...(skipAuth ? { skipAuth } : {}),
      ...(skipErrorHandling ? { skipErrorHandling } : {}),
      url,
    };

    for (const interceptor of this.interceptors.request) {
      finalConfig = await interceptor(finalConfig);
    }

    const headers = this.mergeHeaders(finalConfig.headers);
    const isFormData = this.isFormData(
      finalConfig.body as BodyInit | null | undefined,
    );

    if (
      !isFormData &&
      typeof finalConfig.body === "string" &&
      !headers.has("content-type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    finalConfig.headers = headers;

    const {
      signal: externalSignal,
      skipAuth: _skipAuth,
      skipErrorHandling: _skipErrorHandling,
      url: _url,
      ...baseConfig
    } = finalConfig;

    let lastError: ApiError | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      let abortHandler: (() => void) | undefined;

      if (externalSignal) {
        if (externalSignal.aborted) {
          controller.abort();
        } else {
          abortHandler = () => controller.abort();
          externalSignal.addEventListener("abort", abortHandler, {
            once: true,
          });
        }
      }

      const attemptConfig: RequestInit = {
        ...baseConfig,
        signal: controller.signal,
      };

      const startedAt =
        typeof performance !== "undefined" &&
        typeof performance.now === "function"
          ? performance.now()
          : Date.now();

      try {
        let response = await fetch(url, attemptConfig);

        for (const interceptor of this.interceptors.response) {
          response = await interceptor(response);
        }

        const duration =
          (typeof performance !== "undefined" &&
          typeof performance.now === "function"
            ? performance.now()
            : Date.now()) - startedAt;

        track("tc:http:done", {
          url,
          status: response.status,
          ms: Math.round(duration),
        });

        if (!this.shouldParseJson(response)) {
          return { success: response.ok } as ApiResponse<T>;
        }

        try {
          return (await response.json()) as ApiResponse<T>;
        } catch (parseError) {
          console.warn(
            `[ApiClient] Failed to parse JSON response from ${response.url}`,
            parseError,
          );
          return { success: response.ok } as ApiResponse<T>;
        }
      } catch (error) {
        let apiError = this.toApiError(error);

        const duration =
          (typeof performance !== "undefined" &&
          typeof performance.now === "function"
            ? performance.now()
            : Date.now()) - startedAt;

        track("tc:http:done", {
          url,
          status: apiError.status,
          ms: Math.round(duration),
        });

        for (const interceptor of this.interceptors.error) {
          apiError = await interceptor(apiError);
        }

        lastError = apiError;

        if (attempt === retries || !this.shouldRetry(apiError)) {
          break;
        }

        await this.delay(this.getRetryDelay(apiError, attempt));
      } finally {
        if (abortHandler && externalSignal) {
          externalSignal.removeEventListener("abort", abortHandler);
        }
        clearTimeout(timeoutId);
      }
    }

    throw lastError ?? new Error("Unknown error");
  }

  // HTTP method helpers
  async get<T>(
    endpoint: string,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  // File upload helper
  async upload<T>(
    endpoint: string,
    file: File,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: formData,
      headers: {
        ...Object.fromEntries(
          Object.entries(config?.headers || {}).filter(
            ([key]) => key.toLowerCase() !== "content-type",
          ),
        ),
      },
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export configured instance as default
export default apiClient;
