import { test, expect, defaultPatientId } from "./fixtures";

test("EHR Intake: load ?+' submit (error path)", async ({ page }) => {
  await page.goto(`/ehr/intake?patientId=${defaultPatientId}`);
  await expect(
    page.getByRole("heading", { name: /Patient Intake & Onboarding/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: /New Patient Intake/i }).click();

  const navButton = page.getByRole("button", { name: /Next|Submit Intake/i });

  for (let step = 0; step < 4; step += 1) {
    await navButton.click();
  }

  await page.getByRole("button", { name: /Submit Intake/i }).click();
  await expect(
    page.getByText(/Missing Information|Missing Consents/i).first(),
  ).toBeVisible();
});
