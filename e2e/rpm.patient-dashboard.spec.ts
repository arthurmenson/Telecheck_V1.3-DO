import { test, expect } from "./fixtures";

test("RPM dashboard loads vitals + alerts", async ({ page }) => {
  await page.goto("/rpm/patient?patientId=123");
  await expect(
    page.getByRole("heading", { name: /My Health Dashboard/i }),
  ).toBeVisible();
  await expect(page.getByText(/Today's Glucose/i)).toBeVisible();
});
