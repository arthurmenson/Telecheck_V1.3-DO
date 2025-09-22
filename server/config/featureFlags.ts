import fs from "fs";
import path from "path";

import { logger } from "../utils/logger";

type FeatureFlagValue = boolean;
export type FeatureFlagMap = Record<string, FeatureFlagValue>;

type InitializeOptions = {
  defaults?: FeatureFlagMap;
};

type LoadResult = {
  flags: FeatureFlagMap;
  source: "defaults" | "env" | "file";
};

let cachedDefaults: FeatureFlagMap = {};
let featureFlags: FeatureFlagMap = {};
let lastLoadedAt: Date | null = null;

const parseBoolean = (value: string): FeatureFlagValue => {
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const parseFlagConfig = (raw: string): FeatureFlagMap => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {};
  }

  // Attempt to parse as JSON first
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed).reduce<FeatureFlagMap>(
        (acc, [key, value]) => {
          if (typeof value === "boolean") {
            acc[key] = value;
          } else if (typeof value === "string" || typeof value === "number") {
            acc[key] = parseBoolean(String(value));
          }
          return acc;
        },
        {},
      );
    }
  } catch (error) {
    logger.debug("feature-flags.parse-json.failed", {
      error: (error as Error).message,
    });
  }

  // Fallback to comma-separated list (flag=value)
  return trimmed.split(",").reduce<FeatureFlagMap>((acc, entry) => {
    const [key, value] = entry.split("=");
    if (!key) {
      return acc;
    }
    acc[key.trim()] = parseBoolean(value ?? "true");
    return acc;
  }, {});
};

const loadFromFile = (filePath: string): LoadResult | null => {
  if (!filePath) {
    return null;
  }

  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  try {
    const contents = fs.readFileSync(resolvedPath, "utf8");
    const flags = parseFlagConfig(contents);
    return { flags, source: "file" };
  } catch (error) {
    logger.warn("feature-flags.file.load_failed", {
      filePath: resolvedPath,
      error: (error as Error).message,
    });
    return null;
  }
};

const loadFromEnv = (envValue: string | undefined): LoadResult | null => {
  if (!envValue) {
    return null;
  }

  const flags = parseFlagConfig(envValue);
  return { flags, source: "env" };
};

const mergeFlags = (
  sources: Array<LoadResult | null>,
  defaults: FeatureFlagMap,
): FeatureFlagMap => {
  return sources.reduce<FeatureFlagMap>(
    (acc, source) => {
      if (!source) {
        return acc;
      }

      return { ...acc, ...source.flags };
    },
    { ...defaults },
  );
};

const logLoadSummary = (sources: Array<LoadResult | null>) => {
  const summary = sources
    .filter((source): source is LoadResult => source !== null)
    .map((source) => source.source);

  logger.info("feature-flags.loaded", {
    sources: summary,
    totalFlags: Object.keys(featureFlags).length,
  });
};

export const initializeFeatureFlags = (options?: InitializeOptions) => {
  cachedDefaults = { ...(options?.defaults ?? {}) };
  reloadFeatureFlags();
};

export const reloadFeatureFlags = () => {
  const defaults: LoadResult = { flags: cachedDefaults, source: "defaults" };
  const fileSource = loadFromFile(process.env.FEATURE_FLAGS_FILE || "");
  const envSource = loadFromEnv(process.env.FEATURE_FLAGS);

  featureFlags = mergeFlags([defaults, fileSource, envSource], {});
  lastLoadedAt = new Date();

  logLoadSummary([defaults, fileSource, envSource]);
};

export const getFeatureFlag = (flag: string): boolean => {
  return Boolean(featureFlags[flag]);
};

export const getAllFeatureFlags = (): FeatureFlagMap => ({
  ...featureFlags,
});

export const setFeatureFlag = (flag: string, value: boolean) => {
  featureFlags = { ...featureFlags, [flag]: value };
  logger.debug("feature-flags.flag-overridden", { flag, value });
};

export const resetFeatureFlags = () => {
  featureFlags = { ...cachedDefaults };
  lastLoadedAt = cachedDefaults ? new Date() : null;
};

export const getFeatureFlagMetadata = () => ({
  loadedAt: lastLoadedAt,
  totalFlags: Object.keys(featureFlags).length,
});

// Initialize with empty defaults by default so middleware can safely read flags
initializeFeatureFlags();
