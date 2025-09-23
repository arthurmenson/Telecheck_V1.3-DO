import { test, expect } from "@playwright/test";

test("UAT homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Telecheck|Health|EHR/i);
});

test("UAT chaos endpoints still render friendly", async ({ page }) => {
  const res1 = await page.evaluate(async () =>
    fetch("/api/labs/results?chaos=1").then((r) => ({ status: r.status })),
  );
  expect([401, 500]).toContain(res1.status);
  await page.goto("/ehr/scheduling");
  await expect(page.getByText(/Scheduling|Appointments/i)).toBeVisible();
});
