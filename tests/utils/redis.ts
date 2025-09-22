import { createClient } from "redis";

let testRedisClient: ReturnType<typeof createClient> | null = null;
let hasLoggedRedisFailure = false;

export const setupTestRedis = async () => {
  // Create a separate test Redis client
  const client = createClient({
    url: process.env.TEST_REDIS_URL || "redis://localhost:6379/1",
  });

  try {
    await client.connect();
    console.log("✅ Test Redis connected successfully");
    testRedisClient = client;
  } catch (error) {
    await client.disconnect().catch(() => {
      /* swallow disconnect errors during setup */
    });
    testRedisClient = null;

    if (!hasLoggedRedisFailure) {
      console.warn(
        "⚠️ Test Redis unavailable — falling back to in-memory caches:",
        (error as Error).message,
      );
      hasLoggedRedisFailure = true;
    }
  }
};

export const teardownTestRedis = async () => {
  if (!testRedisClient) {
    return;
  }

  try {
    await testRedisClient.flushDb();
    await testRedisClient.quit();
  } catch (error) {
    console.warn("⚠️ Error closing test Redis:", (error as Error).message);
  } finally {
    testRedisClient = null;
  }
};

export const clearTestCache = async () => {
  if (!testRedisClient) {
    return;
  }

  try {
    await testRedisClient.flushDb();
  } catch (error) {
    console.warn("⚠️ Error clearing test Redis:", (error as Error).message);
  }
};

export const getTestRedisClient = () => testRedisClient;
