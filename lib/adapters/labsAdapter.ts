import { CFG } from "../config";
import { apiClient } from "../http/apiClient";
import { track } from "../telemetry";

export const labsAdapter = {
  async getResults() {
    track("tc:labs:action", { op: "getResults" });
    if (CFG.mode === "MOCK") {
      const data = { results: [] };
      track("tc:labs:success", { op: "getResults" });
      return data;
    }
    try {
      const res = await apiClient.get(`/labs/results`);
      track("tc:labs:success", { op: "getResults" });
      return res as any;
    } catch (e: any) {
      track("tc:labs:error", { op: "getResults", message: e?.message });
      throw e;
    }
  },
  async analyzeReport(data: any) {
    track("tc:labs:action", { op: "analyzeReport" });
    if (CFG.mode === "MOCK") {
      const out = { analysisId: "mock-analysis", status: "ok" };
      track("tc:labs:success", { op: "analyzeReport" });
      return out;
    }
    try {
      const res = await apiClient.post(`/labs/analyze`, data);
      track("tc:labs:success", { op: "analyzeReport" });
      return res as any;
    } catch (e: any) {
      track("tc:labs:error", { op: "analyzeReport", message: e?.message });
      throw e;
    }
  },
  async getAnalysis(id: string) {
    track("tc:labs:action", { op: "getAnalysis", id });
    if (CFG.mode === "MOCK") {
      const out = { id, status: "ready", findings: [] };
      track("tc:labs:success", { op: "getAnalysis" });
      return out;
    }
    try {
      const res = await apiClient.get(`/labs/analysis?id=${encodeURIComponent(id)}`);
      track("tc:labs:success", { op: "getAnalysis" });
      return res as any;
    } catch (e: any) {
      track("tc:labs:error", { op: "getAnalysis", message: e?.message });
      throw e;
    }
  },
  async uploadReport(file: File) {
    track("tc:labs:action", { op: "uploadReport" });
    if (CFG.mode === "MOCK") {
      const out = { id: "mock-upload", status: "uploaded" };
      track("tc:labs:success", { op: "uploadReport" });
      return out;
    }
    try {
      const res = await apiClient.upload(`/labs/upload`, file);
      track("tc:labs:success", { op: "uploadReport" });
      return res as any;
    } catch (e: any) {
      track("tc:labs:error", { op: "uploadReport", message: e?.message });
      throw e;
    }
  },
  async getTrends(params?: Record<string, any>) {
    track("tc:trends:action", { op: "getLabTrends", params });
    if (CFG.mode === "MOCK") {
      const data = { series: [] };
      track("tc:trends:success", { op: "getLabTrends" });
      return data;
    }
    const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    try {
      const res = await apiClient.get(`/labs/trends${qs}`);
      track("tc:trends:success", { op: "getLabTrends" });
      return res as any;
    } catch (e: any) {
      track("tc:trends:error", { op: "getLabTrends", message: e?.message });
      throw e;
    }
  },
};
