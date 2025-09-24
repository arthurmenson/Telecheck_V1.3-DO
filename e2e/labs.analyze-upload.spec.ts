import { Buffer } from "node:buffer";
import { test, expect } from "./fixtures";

test.use({ storageState: "e2e/.auth/state.patient.json" });

test("Labs: upload ?+' analyze ?+' success toast", async ({ page }) => {
  await page.goto("/labs");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("input#file-upload", { state: "attached" });
  await page.setInputFiles("input#file-upload", {
    name: "report.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("mock pdf content"),
  });

  await expect(page.getByText(/Analyzing/i)).toBeVisible();
  await expect(page.getByText(/Analysis Complete/i).first()).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("heading", { name: /Individual Lab Results/i }),
  ).toBeVisible({ timeout: 10000 });
});
