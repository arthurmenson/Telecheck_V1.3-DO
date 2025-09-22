import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

import {
  getAllFeatureFlags,
  getFeatureFlag,
  initializeFeatureFlags,
  reloadFeatureFlags,
  setFeatureFlag,
} from "../../server/config/featureFlags";

describe("feature flag configuration", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.FEATURE_FLAGS = "";
    delete process.env.FEATURE_FLAGS_FILE;
    initializeFeatureFlags({ defaults: { "beta-insights": false } });
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);
    initializeFeatureFlags();
  });

  it("returns defaults when no overrides are provided", () => {
    const flags = getAllFeatureFlags();
    expect(flags).toMatchObject({ "beta-insights": false });
    expect(getFeatureFlag("beta-insights")).toBe(false);
  });

  it("parses boolean values from FEATURE_FLAGS env", () => {
    process.env.FEATURE_FLAGS = "beta-insights=true,new-dashboard=false";
    reloadFeatureFlags();

    expect(getFeatureFlag("beta-insights")).toBe(true);
    expect(getFeatureFlag("new-dashboard")).toBe(false);
  });

  it("supports JSON payloads in FEATURE_FLAGS env", () => {
    process.env.FEATURE_FLAGS = JSON.stringify({
      "beta-insights": "yes",
      "ai-scribe": 1,
    });
    reloadFeatureFlags();

    expect(getFeatureFlag("beta-insights")).toBe(true);
    expect(getFeatureFlag("ai-scribe")).toBe(true);
  });

  it("loads overrides from a configuration file", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "flags-"));
    const configPath = path.join(tempDir, "flags.json");
    fs.writeFileSync(
      configPath,
      JSON.stringify({ "beta-insights": true, "new-dashboard": true }),
    );

    process.env.FEATURE_FLAGS_FILE = configPath;
    reloadFeatureFlags();

    expect(getFeatureFlag("beta-insights")).toBe(true);
    expect(getFeatureFlag("new-dashboard")).toBe(true);
  });

  it("allows runtime overrides for experimentation", () => {
    expect(getFeatureFlag("beta-insights")).toBe(false);
    setFeatureFlag("beta-insights", true);
    expect(getFeatureFlag("beta-insights")).toBe(true);
  });
});
