/**
 * Centralized API Client with best practices
 * - Type safety
 * - Error handling
 * - Request/Response interceptors
 * - Automatic retries
 * - Request cancellation
 * - Loading states
 */

import { ApiResponse } from '../../shared/types';

// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
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
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

// Centralized API Client Class
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private interceptors: {
    request: Array<(config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>>;
    response: Array<(response: Response) => Response | Promise<Response>>;
    error: Array<(error: ApiError) => ApiError | Promise<ApiError>>;
  };

  constructor(baseURL = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
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
        console.warn(`[ApiClient] No auth token available for request to ${config.url}`);
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
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('[ApiClient] No auth token found in localStorage');
    }
    return token;
  }

  private async createApiError(response: Response): Promise<ApiError> {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    console.error(`[ApiClient] API Error - Status: ${response.status}, URL: ${response.url}`);
    console.error('Error details:', JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      errorData,
      headers: Object.fromEntries(response.headers.entries())
    }, null, 2));

    const error = new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`) as ApiError;
    error.status = response.status;
    error.code = errorData.code;
    error.details = errorData.details;
    error.response = response;
    return error;
  }

  private shouldRetry(error: ApiError): boolean {
    // Retry on network errors, 5xx status codes, or rate limiting (429)
    return !error.status || error.status >= 500 || error.status === 429;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Interceptor methods
  addRequestInterceptor(interceptor: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.interceptors.response.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: ApiError) => ApiError | Promise<ApiError>) {
    this.interceptors.error.push(interceptor);
  }

  // Core request method
  async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const {
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.MAX_RETRIES,
      skipAuth = false,
      skipErrorHandling = false,
      ...requestConfig
    } = config;

    // Apply request interceptors
    let finalConfig = { ...requestConfig, skipAuth, skipErrorHandling };
    for (const interceptor of this.interceptors.request) {
      finalConfig = await interceptor(finalConfig);
    }

    // Merge headers
    finalConfig.headers = {
      ...this.defaultHeaders,
      ...finalConfig.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    finalConfig.signal = controller.signal;

    let lastError: ApiError;
    
    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        let response = await fetch(url, finalConfig);

        // Apply response interceptors
        for (const interceptor of this.interceptors.response) {
          response = await interceptor(response);
        }

        clearTimeout(timeoutId);
        return await response.json();

      } catch (error) {
        clearTimeout(timeoutId);
        
        const apiError = error instanceof Error ? error as ApiError : new Error('Unknown error') as ApiError;
        
        // Apply error interceptors
        for (const interceptor of this.interceptors.error) {
          await interceptor(apiError);
        }

        lastError = apiError;

        // Don't retry on the last attempt or if shouldn't retry
        if (attempt === retries || !this.shouldRetry(apiError)) {
          break;
        }

        // Wait before retry with exponential backoff
        // For rate limiting (429), use longer delays
        const baseDelay = error.status === 429 ? API_CONFIG.RETRY_DELAY * 2 : API_CONFIG.RETRY_DELAY;
        await this.delay(baseDelay * Math.pow(2, attempt));
      }
    }

    throw lastError!;
  }

  // HTTP method helpers
  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // File upload helper
  async upload<T>(endpoint: string, file: File, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData - let browser set it
        ...Object.fromEntries(
          Object.entries(config?.headers || {}).filter(([key]) => 
            key.toLowerCase() !== 'content-type'
          )
        ),
      },
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export configured instance as default
export default apiClient;
