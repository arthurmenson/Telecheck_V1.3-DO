import { test, expect } from "./fixtures";

test.use({ storageState: "e2e/.auth/state.patient.json" });

test("Labs: upload ?+' analyze ?+' success toast", async ({ page }) => {
  await page.goto("/labs");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>("input#file-upload");
    if (!input) throw new Error("file input not found");
    const data = new DataTransfer();
    data.items.add(
      new File(["mock pdf content"], "report.pdf", { type: "application/pdf" }),
    );
    input.files = data.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  await expect(page.getByText(/Analyzing/i)).toBeVisible();
  await expect(page.getByText(/Analysis Complete/i).first()).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("heading", { name: /Individual Lab Results/i }),
  ).toBeVisible({ timeout: 10000 });
});
