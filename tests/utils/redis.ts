import { createClient } from "redis";

let testRedisClient: ReturnType<typeof createClient>;

export const setupTestRedis = async () => {
  // Create a separate test Redis client
  testRedisClient = createClient({
    url: process.env.TEST_REDIS_URL || "redis://localhost:6379/1",
  });

  try {
    await testRedisClient.connect();
    console.log("✅ Test Redis connected successfully");
  } catch (error) {
    console.error("❌ Test Redis connection failed:", error);
    // Don't throw error for Redis - it's optional for tests
    testRedisClient = null as any;
  }
};

export const teardownTestRedis = async () => {
  if (testRedisClient) {
    try {
      await testRedisClient.flushDb();
      await testRedisClient.quit();
    } catch (error) {
      console.error("Error closing test Redis:", error);
    }
  }
};

export const clearTestCache = async () => {
  if (testRedisClient) {
    try {
      await testRedisClient.flushDb();
    } catch (error) {
      console.error("Error clearing test Redis:", error);
    }
  }
};

export const getTestRedisClient = () => testRedisClient;
