import { CFG } from "../config";
import { apiClient } from "../http/apiClient";
import { track } from "../telemetry";

export const pharmacyAdapter = {
  async searchProducts(q: string) {
    track("tc:pharmacy:action", { op: "searchProducts", q });
    if (CFG.mode === "MOCK") {
      const data = { items: [], q };
      track("tc:pharmacy:success", { op: "searchProducts" });
      return data;
    }
    try {
      const res = await apiClient.get(
        `/medications/search?q=${encodeURIComponent(q)}`,
      );
      track("tc:pharmacy:success", { op: "searchProducts" });
      return res as any;
    } catch (e: any) {
      track("tc:pharmacy:error", { op: "searchProducts", message: e?.message });
      throw e;
    }
  },
  async listProducts() {
    track("tc:pharmacy:action", { op: "listProducts" });
    if (CFG.mode === "MOCK") {
      const data = { items: [] };
      track("tc:pharmacy:success", { op: "listProducts" });
      return data;
    }
    try {
      const res = await apiClient.get(`/medications`);
      track("tc:pharmacy:success", { op: "listProducts" });
      return res as any;
    } catch (e: any) {
      track("tc:pharmacy:error", { op: "listProducts", message: e?.message });
      throw e;
    }
  },
};
