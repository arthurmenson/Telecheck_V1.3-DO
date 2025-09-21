import { test, expect } from "@playwright/test";

test("Intake → Schedule → RPM", async ({ page }) => {
  await page.goto("/ehr/intake?patientId=p-001");
  await page.getByTestId("ehr-intake-submit").click();
  await page.goto("/schedule");
  await page.getByTestId("schedule-book").click();
  await page.goto("/rpm/patient?patientId=p-001");
  await expect(page.getByTestId("rpm-dashboard")).toBeVisible();
});
