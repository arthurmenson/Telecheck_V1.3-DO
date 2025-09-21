export const FLAGS = {
  enableAIScribe: { default: true, owners: ["ehr"] },
  enablePharmacopia: { default: true, owners: ["commerce"] },
  enableThresholdsV2: { default: false, owners: ["rpm"] },
  enableScheduling: { default: true, owners: ["ehr"] },
} as const;
