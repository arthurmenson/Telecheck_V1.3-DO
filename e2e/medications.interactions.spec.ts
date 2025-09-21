import { test, expect } from "@playwright/test";

test("Medications: search → select → interactions", async ({ page }) => {
  await page.goto("/medications");

  const search = await page.evaluate(async () => {
    const r = await fetch("/api/medications/search?q=lipitor");
    return r.json();
  });
  expect(Array.isArray(search.items)).toBeTruthy();
  expect(search.items[0]).toMatchObject({ id: "lipitor" });

  const interactions = await page.evaluate(async () => {
    const r = await fetch("/api/medications/interactions?drugA=lipitor&drugB=warfarin");
    return r.json();
  });
  expect(Array.isArray(interactions.interactions)).toBeTruthy();
  expect(interactions.interactions[0]).toMatchObject({ severity: "major" });
});
