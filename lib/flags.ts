export const FLAGS = {
  enableAIScribe: { default: true, owners: ["ehr"], sunset: "2025-12-31" },
  enablePharmacopia: {
    default: true,
    owners: ["commerce"],
    sunset: "2025-12-31",
  },
  enableThresholdsV2: { default: false, owners: ["rpm"], sunset: "2025-06-30" },
  enableScheduling: { default: true, owners: ["ehr"], sunset: "2025-12-31" },
} as const;
