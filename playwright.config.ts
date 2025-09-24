import { defineConfig } from "@playwright/test";

const PW_PORT = Number(process.env.PW_PORT || 3000);
const PW_HOST = process.env.PW_HOST || "127.0.0.1";
const BASE_URL = process.env.PW_BASE_URL || `http://${PW_HOST}:${PW_PORT}`;
const WEB_SERVER_CMD =
  process.env.PW_WEB_SERVER_CMD || "npm run start:playwright";
const REUSE_SERVER =
  process.env.PW_REUSE_SERVER === "1" || process.env.CI ? false : true;

export default defineConfig({
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  testDir: "e2e",
  globalSetup: "./e2e/helpers/auth.ts",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    storageState: "e2e/.auth/state.json",
    serviceWorkers: "allow",
  },
  webServer: {
    command: WEB_SERVER_CMD,
    url: BASE_URL,
    timeout: 120000,
    reuseExistingServer: REUSE_SERVER,
  },
});
