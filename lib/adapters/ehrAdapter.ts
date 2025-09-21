import { CFG } from "../config";
import { apiClient } from "../http/apiClient";
import { track } from "../telemetry";

export const ehrAdapter = {
  async getPatient(id: string) {
    track("tc:ehr-intake:action", { op: "getPatient", id });
    if (CFG.mode === "MOCK") {
      const data = { id, name: "Mock Patient" };
      track("tc:ehr-intake:success", { op: "getPatient" });
      return data;
    }
    try {
      const res = await apiClient.get(`/ehr/patients/${id}`);
      track("tc:ehr-intake:success", { op: "getPatient" });
      return res as any;
    } catch (e: any) {
      track("tc:ehr-intake:error", { op: "getPatient", message: e?.message });
      throw e;
    }
  },
  async saveIntake(payload: any) {
    track("tc:ehr-intake:action", { op: "saveIntake" });
    if (CFG.mode === "MOCK") {
      const data = { id: "mock-intake-1", status: "saved" };
      track("tc:ehr-intake:success", { op: "saveIntake" });
      return data;
    }
    try {
      const res = await apiClient.post("/ehr/intake", payload);
      track("tc:ehr-intake:success", { op: "saveIntake" });
      return res as any;
    } catch (e: any) {
      track("tc:ehr-intake:error", { op: "saveIntake", message: e?.message });
      throw e;
    }
  },
};
