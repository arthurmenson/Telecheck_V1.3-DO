import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    // Exclude server modules from client tests
    exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./client"),
      "@shared": resolve(__dirname, "./shared"),
      "@tests": resolve(__dirname, "./tests"),
      "@server": resolve(__dirname, "./server"),
    },
  },
});
