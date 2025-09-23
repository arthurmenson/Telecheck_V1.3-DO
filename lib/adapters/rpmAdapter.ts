import { CFG } from "../config";
import { apiClient } from "../http/apiClient";
import { track } from "../telemetry";

export const rpmAdapter = {
  async getVitalsTrends(params?: Record<string, any>) {
    track("tc:rpm-dashboard:action", { op: "getVitalsTrends", params });
    if (CFG.mode === "MOCK") {
      const data = { series: [], timeframe: params?.timeframe || "7d" };
      track("tc:rpm-dashboard:success", { op: "getVitalsTrends" });
      return data;
    }
    const qs = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    try {
      const res = await apiClient.get(`/vitals/trends${qs}`);
      track("tc:rpm-dashboard:success", { op: "getVitalsTrends" });
      return res as any;
    } catch (e: any) {
      track("tc:rpm-dashboard:error", {
        op: "getVitalsTrends",
        message: e?.message,
      });
      throw e;
    }
  },
  async getVitals(params?: Record<string, any>) {
    track("tc:rpm-center:action", { op: "getVitals", params });
    if (CFG.mode === "MOCK") {
      const data = { items: [] };
      track("tc:rpm-center:success", { op: "getVitals" });
      return data;
    }
    const qs = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    try {
      const res = await apiClient.get(`/vitals${qs}`);
      track("tc:rpm-center:success", { op: "getVitals" });
      return res as any;
    } catch (e: any) {
      track("tc:rpm-center:error", { op: "getVitals", message: e?.message });
      throw e;
    }
  },
};
