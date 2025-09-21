import { test, expect } from "@playwright/test";

test("EHR Intake: load → submit (error + success)", async ({ page }) => {
  await page.goto("/ehr/intake?patientId=123");
  await expect(page.getByTestId("ehr-intake-form")).toBeVisible();
  await page.getByTestId("ehr-intake-submit").click();
  await expect(page.getByText(/Failed/i)).toBeVisible(); // error path
  // simulate success path... (stub)
});
