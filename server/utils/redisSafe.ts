import { redisClient } from "../config/database";

export async function safeSetEx(
  key: string,
  ttlSeconds: number,
  value: string,
): Promise<void> {
  if (!redisClient) {
    console.warn(`[Redis] setEx skipped (no Redis). key=${key}`);
    return;
  }
  try {
    await redisClient.setEx(key, ttlSeconds, value);
  } catch (e: any) {
    console.warn(`[Redis] setEx failed: ${e?.message}`);
  }
}

export async function safeGet(key: string): Promise<string | null> {
  if (!redisClient) {
    console.warn(`[Redis] get skipped (no Redis). key=${key}`);
    return null;
  }
  try {
    return await redisClient.get(key);
  } catch (e: any) {
    console.warn(`[Redis] get failed: ${e?.message}`);
    return null;
  }
}

export async function safeDel(key: string): Promise<void> {
  if (!redisClient) {
    console.warn(`[Redis] del skipped (no Redis). key=${key}`);
    return;
  }
  try {
    await redisClient.del(key);
  } catch (e: any) {
    console.warn(`[Redis] del failed: ${e?.message}`);
  }
}
