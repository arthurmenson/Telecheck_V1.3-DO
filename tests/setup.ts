import { beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearTestData,
} from "./utils/database";
import {
  setupTestRedis,
  teardownTestRedis,
  clearTestCache,
} from "./utils/redis";
import { createAuthTestServer } from "../server/testServer";
import { __resetAuthStateForTests } from "../server/routes/auth";
import { closeDatabase } from "../server/config/database";

declare global {
  // eslint-disable-next-line no-var
  var testApp: any;
}

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-for-testing-only";
process.env.TEST_DB_HOST = "localhost";
process.env.TEST_DB_PORT = "5432";
process.env.TEST_DB_NAME = "telecheck_test";
process.env.TEST_DB_USER = "postgres";
process.env.TEST_DB_PASSWORD = "password";
process.env.TEST_REDIS_URL = "redis://localhost:6379/1";

// Mock localStorage for client tests
if (typeof global.localStorage === "undefined") {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  };

  Object.defineProperty(global, "localStorage", {
    value: mockLocalStorage,
    writable: true,
  });
}

// Check if we're running server tests (tests that need database)
const lifecycleEvent = process.env.npm_lifecycle_event || "";
const serverLifecycleEvents = new Set(["test:api", "test:integration", "test"]);

const cliRequestTargetsServer = process.argv.some(
  (arg) =>
    arg.includes("server") ||
    arg.includes("tests/") ||
    arg.includes("auth.test.ts"),
);

const needsAuthHarness = lifecycleEvent === "test:phase1";
const shouldBootstrapDatabase =
  !needsAuthHarness &&
  (serverLifecycleEvents.has(lifecycleEvent) || cliRequestTargetsServer);

const isServerTest = needsAuthHarness || shouldBootstrapDatabase;

// Global test setup
beforeAll(async () => {
  // Only setup database for server tests
  if (isServerTest) {
    if (shouldBootstrapDatabase) {
      try {
        await setupTestDatabase();
        await setupTestRedis();
      } catch (error) {
        console.warn(
          "⚠️ Database setup failed, tests may not work properly:",
          (error as Error).message,
        );
      }
    }

    try {
      global.testApp = await createAuthTestServer();
    } catch (error) {
      console.warn(
        "⚠️ Test server bootstrap failed:",
        (error as Error).message,
      );
    }
  }
});

// Global test teardown
afterAll(async () => {
  // Only cleanup database for server tests
  if (isServerTest) {
    if (shouldBootstrapDatabase) {
      try {
        await teardownTestDatabase();
        await teardownTestRedis();
      } catch (error) {
        console.warn("⚠️ Database cleanup failed:", (error as Error).message);
      }
    }

    try {
      await closeDatabase();
    } catch (error) {
      console.warn("⚠️ Test server shutdown failed:", (error as Error).message);
    }
  }
});

// Before each test
beforeEach(async () => {
  // Only clear data for server tests
  if (isServerTest) {
    try {
      await clearTestData();
      await clearTestCache();
      if (needsAuthHarness) {
        await __resetAuthStateForTests();
      }
    } catch (error) {
      console.warn("⚠️ Data cleanup failed:", error.message);
    }
  }

  // Clear localStorage mock for each test
  if (
    global.localStorage &&
    typeof global.localStorage.getItem === "function"
  ) {
    const mockStorage = global.localStorage as any;
    if (mockStorage.getItem.mockClear) mockStorage.getItem.mockClear();
    if (mockStorage.setItem.mockClear) mockStorage.setItem.mockClear();
    if (mockStorage.removeItem.mockClear) mockStorage.removeItem.mockClear();
    if (mockStorage.clear.mockClear) mockStorage.clear.mockClear();
  }
});

// After each test
afterEach(async () => {
  // Additional cleanup if needed
});
