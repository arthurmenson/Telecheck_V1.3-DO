import { beforeEach, describe, expect, it } from "vitest";

const { createRpmService } = await import("../../server/services/rpm.service");

const rpmService = createRpmService({ useMemory: true });

describe("rpmService (memory mode)", () => {
  beforeEach(async () => {
    await rpmService.__resetForTests();
  });

  it("returns vitals with summary metadata", async () => {
    const response = await rpmService.getPatientVitals("rpm-demo", 7);
    expect(response.patientId).toBe("rpm-demo");
    expect(response.days).toBe(7);
    expect(response.summary.totalRecords).toBeGreaterThan(0);
    expect(response.vitals.length).toBeGreaterThan(0);
    expect(response.vitals[0].values[0]).toHaveProperty("timestamp");
  });

  it("returns alerts and thresholds", async () => {
    const alerts = await rpmService.getPatientAlerts("rpm-demo");
    expect(alerts.alerts.length).toBeGreaterThan(0);
    expect(alerts.alerts[0]).toHaveProperty("severity");

    const thresholds = await rpmService.getPatientThresholds("rpm-demo");
    expect(thresholds.thresholds.length).toBeGreaterThan(0);
    expect(thresholds.thresholds[0]).toHaveProperty("minValue");
  });

  it("validates patient id and days", async () => {
    await expect(rpmService.getPatientVitals("", 7)).rejects.toThrow();
    await expect(rpmService.getPatientVitals("rpm-demo", 0)).rejects.toThrow();
  });
});
