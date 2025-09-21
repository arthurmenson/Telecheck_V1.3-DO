export type Mode = "MOCK" | "SANDBOX" | "PROD";

export const CFG = {
  mode: ((import.meta as any).env?.VITE_MODE as Mode) || "MOCK",
  apiBase: (import.meta as any).env?.VITE_API_BASE || "/api",
  flags: {
    enableAIScribe: true,
    enablePharmacopia: true,
    enableThresholdsV2: false,
    enableScheduling: true,
  },
} as const;
