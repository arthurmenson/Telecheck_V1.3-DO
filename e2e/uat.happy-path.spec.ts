import { test, expect, defaultPatientId } from "./fixtures";

test("Intake ?+' Schedule ?+' RPM", async ({ page }) => {
  await page.goto(`/ehr/intake?patientId=${defaultPatientId}`);
  await page.getByRole("button", { name: /New Patient Intake/i }).click();
  const nextButton = page.getByRole("button", { name: /Next|Submit Intake/i });
  await expect(nextButton).toBeVisible();
  await nextButton.click();

  await page.goto("/ehr/scheduling");
  await expect(
    page.getByRole("heading", { level: 1, name: /Scheduling/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /New Appointment/i }).click();

  await page.goto(`/rpm/patient?patientId=${defaultPatientId}`);
  await expect(
    page.getByRole("heading", { name: /My Health Dashboard/i }),
  ).toBeVisible();
});
