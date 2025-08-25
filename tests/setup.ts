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
if (typeof global.localStorage === 'undefined') {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  };
  
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
}

// Check if we're running server tests (tests that need database)
const isServerTest = process.argv.some(arg => 
  arg.includes('server') || 
  arg.includes('tests/') ||
  arg.includes('auth.test.ts')
);

// Global test setup
beforeAll(async () => {
  // Only setup database for server tests
  if (isServerTest) {
    try {
      await setupTestDatabase();
      await setupTestRedis();
    } catch (error) {
      console.warn("⚠️ Database setup failed, tests may not work properly:", error.message);
    }
  }
});

// Global test teardown
afterAll(async () => {
  // Only cleanup database for server tests
  if (isServerTest) {
    try {
      await teardownTestDatabase();
      await teardownTestRedis();
    } catch (error) {
      console.warn("⚠️ Database cleanup failed:", error.message);
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
    } catch (error) {
      console.warn("⚠️ Data cleanup failed:", error.message);
    }
  }
  
  // Clear localStorage mock for each test
  if (global.localStorage && typeof global.localStorage.getItem === 'function') {
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
