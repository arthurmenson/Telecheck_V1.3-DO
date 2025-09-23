import { CFG } from "../config";
import { apiClient } from "../http/apiClient";
import { track } from "../telemetry";
import { withRetry } from "../http/retry";

export const medicationsAdapter = {
  async list() {
    track("tc:meds:action", { op: "list" });
    if (CFG.mode === "MOCK") {
      const data = { items: [] };
      track("tc:meds:success", { op: "list" });
      return data;
    }
    try {
      const res = await withRetry(() => apiClient.get(`/medications`));
      track("tc:meds:success", { op: "list" });
      return res as any;
    } catch (e: any) {
      track("tc:meds:error", { op: "list", message: e?.message });
      throw e;
    }
  },
  async add(payload: any) {
    track("tc:meds:action", { op: "add" });
    if (CFG.mode === "MOCK") {
      const out = { id: "mock-med-1" };
      track("tc:meds:success", { op: "add" });
      return out;
    }
    try {
      const res = await withRetry(() =>
        apiClient.post(`/medications`, payload),
      );
      track("tc:meds:success", { op: "add" });
      return res as any;
    } catch (e: any) {
      track("tc:meds:error", { op: "add", message: e?.message });
      throw e;
    }
  },
  async update(id: string, payload: any) {
    track("tc:meds:action", { op: "update", id });
    if (CFG.mode === "MOCK") {
      const out = { id, status: "updated" };
      track("tc:meds:success", { op: "update" });
      return out;
    }
    try {
      const res = await withRetry(() =>
        apiClient.put(`/medications/${id}`, payload),
      );
      track("tc:meds:success", { op: "update" });
      return res as any;
    } catch (e: any) {
      track("tc:meds:error", { op: "update", message: e?.message });
      throw e;
    }
  },
  async remove(id: string) {
    track("tc:meds:action", { op: "remove", id });
    if (CFG.mode === "MOCK") {
      const out = { id, status: "deleted" };
      track("tc:meds:success", { op: "remove" });
      return out;
    }
    try {
      const res = await withRetry(() => apiClient.delete(`/medications/${id}`));
      track("tc:meds:success", { op: "remove" });
      return res as any;
    } catch (e: any) {
      track("tc:meds:error", { op: "remove", message: e?.message });
      throw e;
    }
  },
  async interactions(params?: Record<string, any>) {
    track("tc:meds:action", { op: "interactions", params });
    if (CFG.mode === "MOCK") {
      const out = { interactions: [] };
      track("tc:meds:success", { op: "interactions" });
      return out;
    }
    const qs = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    try {
      const res = await withRetry(() =>
        apiClient.get(`/medications/interactions${qs}`),
      );
      track("tc:meds:success", { op: "interactions" });
      return res as any;
    } catch (e: any) {
      track("tc:meds:error", { op: "interactions", message: e?.message });
      throw e;
    }
  },
  async search(q: string) {
    track("tc:meds:action", { op: "search", q });
    if (CFG.mode === "MOCK") {
      const out = { items: [], q };
      track("tc:meds:success", { op: "search" });
      return out;
    }
    try {
      const res = await withRetry(() =>
        apiClient.get(`/medications/search?q=${encodeURIComponent(q)}`),
      );
      track("tc:meds:success", { op: "search" });
      return res as any;
    } catch (e: any) {
      track("tc:meds:error", { op: "search", message: e?.message });
      throw e;
    }
  },
  async reminders() {
    track("tc:meds:action", { op: "reminders" });
    if (CFG.mode === "MOCK") {
      const out = { reminders: [] };
      track("tc:meds:success", { op: "reminders" });
      return out;
    }
    try {
      const res = await withRetry(() =>
        apiClient.get(`/medications/reminders`),
      );
      track("tc:meds:success", { op: "reminders" });
      return res as any;
    } catch (e: any) {
      track("tc:meds:error", { op: "reminders", message: e?.message });
      throw e;
    }
  },
};
