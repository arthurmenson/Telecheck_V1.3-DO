import { test, expect } from "./fixtures";

test("Intake ?+' Schedule ?+' RPM", async ({ page }) => {
  await page.goto("/ehr/intake?patientId=p-001");
  await page.getByRole("button", { name: /New Patient Intake/i }).click();
  const nextButton = page.getByRole("button", { name: /Next|Submit Intake/i });
  await expect(nextButton).toBeVisible();
  await nextButton.click();

  await page.goto("/ehr/scheduling");
  await expect(
    page.getByRole("heading", { level: 1, name: /Scheduling/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /New Appointment/i }).click();

  await page.goto("/rpm/patient?patientId=p-001");
  await expect(
    page.getByRole("heading", { name: /My Health Dashboard/i }),
  ).toBeVisible();
});
