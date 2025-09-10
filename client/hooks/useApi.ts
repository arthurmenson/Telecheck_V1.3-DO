import { useState, useEffect } from "react";
import { ApiResponse, PaginatedResponse } from "@shared/types";

// Custom hook for API calls
export function useApi<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, options);
        const result: ApiResponse<T> = await response.json();

        if (result.success) {
          setData(result.data || null);
        } else {
          setError(result.error || "Unknown error occurred");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error, refetch: () => window.location.reload() };
}

// API service class
export class ApiService {
  private static baseUrl = "/api";

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Lab Results API
  static async getLabResults(userId?: string) {
    return this.request(`/labs/results/${userId || ""}`);
  }

  static async getLabReports(userId?: string) {
    return this.request(`/labs/reports/${userId || ""}`);
  }

  static async analyzeLabReport(file: File, userId?: string) {
    const formData = new FormData();
    formData.append("labReport", file);
    if (userId) formData.append("userId", userId);

    return this.request("/labs/analyze", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  static async getLabAnalysis(userId?: string) {
    return this.request(`/labs/analysis/${userId || ""}`);
  }

  // Medications API
  static async getMedications(userId?: string) {
    return this.request(`/medications/${userId || ""}`);
  }

  static async addMedication(medication: any, userId?: string) {
    return this.request("/medications", {
      method: "POST",
      body: JSON.stringify({ ...medication, userId }),
    });
  }

  static async checkMedicationInteractions(userId?: string) {
    return this.request(`/medications/interactions/${userId || ""}`);
  }

  // Vital Signs API
  static async getVitalSigns(userId?: string) {
    return this.request(`/vitals/${userId || ""}`);
  }

  static async addVitalSigns(vitals: any, userId?: string) {
    return this.request("/vitals", {
      method: "POST",
      body: JSON.stringify({ ...vitals, userId }),
    });
  }

  static async getVitalTrends(userId?: string, days?: number) {
    const params = days ? `?days=${days}` : "";
    return this.request(`/vitals/trends/${userId || ""}${params}`);
  }

  // Health Insights API
  static async getHealthInsights(userId?: string) {
    return this.request(`/insights/${userId || ""}`);
  }

  static async dismissInsight(insightId: string) {
    return this.request(`/insights/${insightId}/dismiss`, {
      method: "POST",
    });
  }

  static async generateInsights(userId?: string) {
    return this.request(`/insights/generate/${userId || ""}`, {
      method: "POST",
    });
  }

  // Chat API
  static async sendChatMessage(
    message: string,
    context?: any,
    userId?: string,
  ) {
    return this.request("/chat", {
      method: "POST",
      body: JSON.stringify({ message, context, userId }),
    });
  }

  static async getChatHistory(userId?: string) {
    return this.request(`/chat/history/${userId || ""}`);
  }
}
