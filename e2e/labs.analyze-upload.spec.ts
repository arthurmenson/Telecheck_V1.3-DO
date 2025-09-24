import { Buffer } from "node:buffer";
import { test, expect } from "./fixtures";

test.use({ storageState: "e2e/.auth/state.patient.json" });

const MOCK_FILE = {
  name: "report.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("mock pdf content"),
} as const;

test("Labs: upload ?+' analyze ?+' success toast", async ({ page }) => {
  await page.goto("/labs");
  await page.waitForLoadState("networkidle");
  const fileInput = page.locator("input#file-upload");
  await fileInput.waitFor({ state: "attached", timeout: 15000 });

  try {
    await page.setInputFiles("input#file-upload", MOCK_FILE);
  } catch (error) {
    await fileInput.evaluate(
      (node, value) => {
        const dt = new DataTransfer();
        dt.items.add(
          new File([value.content], value.name, { type: value.type }),
        );
        (node as HTMLInputElement).files = dt.files;
        node.dispatchEvent(new Event("change", { bubbles: true }));
      },
      {
        content: MOCK_FILE.buffer.toString(),
        name: MOCK_FILE.name,
        type: MOCK_FILE.mimeType,
      },
    );
  }

  await expect(page.getByText(/Analyzing/i)).toBeVisible();
  await expect(page.getByText(/Analysis Complete/i).first()).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("heading", { name: /Individual Lab Results/i }),
  ).toBeVisible({ timeout: 10000 });
});
