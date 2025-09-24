import { Buffer } from "node:buffer";
import { test, expect } from "./fixtures";

test.use({ storageState: "e2e/.auth/state.json" });

test("eRx happy path: create ?+' verify ?+' poll ?+' cancel", async ({
  page,
}) => {
  await page.goto("/ehr/erx");
  await page.waitForSelector("#patientId");

  await page.fill("#patientId", "Patient/123");
  await page.fill("#medication", "amoxicillin");

  await page.click('button:has-text("Create Prescription")');
  await expect(page.locator("text=Created Rx ID")).toBeVisible();

  await page.fill("#otp", "123456");
  await page.click('button:has-text("Verify EPCS")');

  await page.click('button:has-text("Poll Now")');

  await page.click('button:has-text("Cancel")');
  await page.click('button:has-text("Poll Now")');
});
