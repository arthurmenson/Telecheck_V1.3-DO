import { describe, it, expect, vi, beforeEach } from "vitest";
import * as redisSafe from "../../server/utils/redisSafe";

describe("Redis safe helpers", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("safeSetEx/safeGet/safeDel do not throw without Redis", async () => {
    await redisSafe.safeSetEx("k", 10, "v");
    const v = await redisSafe.safeGet("k");
    await redisSafe.safeDel("k");
    expect(v).toBeNull();
  });
});
