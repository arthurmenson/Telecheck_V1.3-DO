import { test, expect } from "@playwright/test";

test("Labs: upload → analyze → success toast", async ({ page }) => {
  await page.goto("/labs");
  const fileChooser = page.locator("input#file-upload");
  await fileChooser.setInputFiles({ name: "report.pdf", mimeType: "application/pdf", buffer: Buffer.from("dummy") });
  await expect(page.getByText("Analyzing...")).toBeVisible();
  await expect(page.getByText("Analysis Complete")).toBeVisible({ timeout: 10000 });
});
