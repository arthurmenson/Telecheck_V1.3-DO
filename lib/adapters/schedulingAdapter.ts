import { CFG } from "../config";
import { apiClient } from "../http/apiClient";
import { track } from "../telemetry";
import { withRetry } from "../http/retry";
import { FLAGS } from "../flags";

export const schedulingAdapter = {
  async getSlots(params?: Record<string, any>) {
    track("tc:schedule:action", { op: "getSlots", params });
    if (CFG.mode === "MOCK") {
      const data = { slots: [] };
      track("tc:schedule:success", { op: "getSlots" });
      return data;
    }
    const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    try {
      const res = await withRetry(() => apiClient.get(`/ehr/scheduling/slots${qs}`));
      track("tc:schedule:success", { op: "getSlots" });
      return res as any;
    } catch (e: any) {
      track("tc:schedule:error", { op: "getSlots", message: e?.message });
      throw e;
    }
  },
  async book(payload: any) {
    track("tc:schedule:action", { op: "book" });
    if (!FLAGS.enableScheduling.default) {
      const err = new Error("Scheduling is disabled by feature flag");
      track("tc:schedule:error", { op: "book", message: err.message });
      throw err;
    }
    if (CFG.mode === "MOCK") {
      const out = { id: "mock-appointment", status: "booked" };
      track("tc:schedule:success", { op: "book" });
      return out;
    }
    try {
      const res = await withRetry(() => apiClient.post(`/ehr/scheduling/book`, payload));
      track("tc:schedule:success", { op: "book" });
      return res as any;
    } catch (e: any) {
      track("tc:schedule:error", { op: "book", message: e?.message });
      throw e;
    }
  },
  async cancel(id: string) {
    track("tc:schedule:action", { op: "cancel", id });
    if (CFG.mode === "MOCK") {
      const out = { id, status: "canceled" };
      track("tc:schedule:success", { op: "cancel" });
      return out;
    }
    try {
      const res = await withRetry(() => apiClient.post(`/ehr/scheduling/${id}/cancel`));
      track("tc:schedule:success", { op: "cancel" });
      return res as any;
    } catch (e: any) {
      track("tc:schedule:error", { op: "cancel", message: e?.message });
      throw e;
    }
  },
  async reschedule(id: string, payload: any) {
    track("tc:schedule:action", { op: "reschedule", id });
    if (CFG.mode === "MOCK") {
      const out = { id, status: "rescheduled" };
      track("tc:schedule:success", { op: "reschedule" });
      return out;
    }
    try {
      const res = await withRetry(() => apiClient.post(`/ehr/scheduling/${id}/reschedule`, payload));
      track("tc:schedule:success", { op: "reschedule" });
      return res as any;
    } catch (e: any) {
      track("tc:schedule:error", { op: "reschedule", message: e?.message });
      throw e;
    }
  },
};
