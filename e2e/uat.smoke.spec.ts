import { test, expect } from "./fixtures";

test("UAT homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Telecheck|Health|EHR/i);
});

test("UAT chaos endpoints still render friendly", async ({ page, request }) => {
  await page.goto("/");
  const chaosResponse = await request.get("/api/labs/results?chaos=1");
  expect([401, 500]).toContain(chaosResponse.status());
  await page.goto("/ehr/scheduling");
  await expect(
    page.getByRole("heading", { level: 1, name: /Scheduling/i }),
  ).toBeVisible();
});
