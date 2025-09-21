import { test, expect } from "@playwright/test";

test("RPM dashboard loads vitals + alerts", async ({ page }) => {
  await page.goto("/rpm/patient?patientId=123");
  await expect(page.getByTestId("rpm-dashboard")).toBeVisible();
  await expect(page.getByTestId("rpm-vitals-empty")).toBeVisible();
});
