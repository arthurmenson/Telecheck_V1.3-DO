import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/helpers/auth.ts",
  use: {
    baseURL: process.env.PW_BASE_URL || "http://localhost:8082",
    trace: "on-first-retry",
    storageState: "e2e/.auth/state.json",
    serviceWorkers: "allow",
  },
  webServer: {
    command: "cross-env VITE_MODE=MOCK VITE_API_BASE=/api PORT=8082 vite",
    port: 8082,
    timeout: 120000,
    reuseExistingServer: false,
  },
});
