import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL: process.env.PW_BASE_URL,
    trace: "on",
    video: "retain-on-failure",
  },
});
