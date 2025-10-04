import { test, expect, defaultPatientId } from "./fixtures";

test("RPM dashboard loads vitals + alerts", async ({ page }) => {
  await page.goto(`/rpm/patient?patientId=${defaultPatientId}`);
  await expect(
    page.getByRole("heading", { name: /My Health Dashboard/i }),
  ).toBeVisible();
  await expect(page.getByText(/Recent Vital Readings/i)).toBeVisible();
  await expect(page.getByText(/Medication Plan/i)).toBeVisible();
});
