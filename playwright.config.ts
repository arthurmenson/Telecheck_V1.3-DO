import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/helpers/auth.ts",
  use: {
    baseURL: process.env.PW_BASE_URL || "http://127.0.0.1:8080",
    trace: "on-first-retry",
    storageState: "e2e/.auth/state.json",
  },
  webServer: {
    command: "npm run dev:mock",
    port: 8080,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
