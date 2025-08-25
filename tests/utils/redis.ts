import { createClient } from "redis";
import { redisClient } from "../../server/config/database";

let testRedisClient: ReturnType<typeof createClient>;

export const setupTestRedis = async () => {
  // Use the same Redis client as the server
  testRedisClient = redisClient;
};

export const teardownTestRedis = async () => {
  if (testRedisClient) {
    await testRedisClient.flushDb();
    // Don't quit the client since it's shared with the server
  }
};

export const clearTestCache = async () => {
  if (testRedisClient) {
    await testRedisClient.flushDb();
  }
};

export const getTestRedisClient = () => testRedisClient;
