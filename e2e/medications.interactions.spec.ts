import { test, expect } from "./fixtures";

test.use({ storageState: "e2e/.auth/state.patient.json" });

test("Medications: search ?+' select ?+' interactions", async ({
  page,
  request,
}) => {
  await page.goto("/medications");

  const searchResponse = await request.get("/api/medications/search?q=lipitor");
  expect(searchResponse.ok()).toBeTruthy();
  const search = await searchResponse.json();
  expect(search.success).toBeTruthy();
  expect(Array.isArray(search.data?.items)).toBeTruthy();
  expect(search.data?.items?.[0]).toMatchObject({ id: "lipitor" });

  const interactionsResponse = await request.get(
    "/api/medications/interactions?drugA=lipitor&drugB=warfarin",
  );
  expect(interactionsResponse.ok()).toBeTruthy();
  const interactions = await interactionsResponse.json();
  expect(interactions.success).toBeTruthy();
  expect(Array.isArray(interactions.data?.interactions)).toBeTruthy();
  expect(interactions.data?.interactions?.[0]).toMatchObject({
    severity: "major",
  });
});
