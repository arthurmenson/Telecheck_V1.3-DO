import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createServer } from '../server/index';
import { setupTestDatabase, teardownTestDatabase, clearTestData } from './utils/database';
import { setupTestRedis, teardownTestRedis, clearTestCache } from './utils/redis';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.TEST_DB_HOST = 'localhost';
process.env.TEST_DB_PORT = '5432';
process.env.TEST_DB_NAME = 'telecheck_test';
process.env.TEST_DB_USER = 'postgres';
process.env.TEST_DB_PASSWORD = 'password';
process.env.TEST_REDIS_URL = 'redis://localhost:6379/1';

// Global test setup
beforeAll(async () => {
  // Setup test database
  await setupTestDatabase();
  
  // Setup test Redis
  await setupTestRedis();
  
  // Create test server (createServer is now async)
  global.testServer = await createServer();
  global.testApp = global.testServer;
});

// Global test teardown
afterAll(async () => {
  // Cleanup test database
  await teardownTestDatabase();
  
  // Cleanup test Redis
  await teardownTestRedis();
});

// Before each test
beforeEach(async () => {
  // Clear test data
  await clearTestData();
  await clearTestCache();
});

// After each test
afterEach(async () => {
  // Additional cleanup if needed
});

// Global types for testing
declare global {
  var testServer: any;
  var testApp: any;
}
