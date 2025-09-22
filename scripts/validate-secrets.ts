#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

import dotenv from "dotenv";

import {
  resolveSecretSync,
  type SecretReferenceInput,
} from "../server/config/secretManager";

type CliOptions = {
  envFiles: string[];
  secretsFile?: string;
  quiet: boolean;
};

const SECRET_REFERENCE_PREFIXES = [
  "secret://",
  "secret:",
  "secrets://",
  "secrets:",
  "sm://",
  "vault://",
  "vault:",
  "aws-sm://",
  "aws-secretsmanager://",
  "doppler://",
  "doppler:",
  "gcp-sm://",
  "azure-kv://",
  "file://",
  "env://",
];

const DERIVED_SUFFIXES = new Set([
  "SECRET",
  "SECRETS",
  "REF",
  "REFERENCE",
  "PATH",
  "FILE",
  "KEY",
  "NAME",
  "ID",
  "VALUE",
  "TOKEN",
  "PASSWORD",
]);

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  const options: CliOptions = { envFiles: [], quiet: false };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--env" || arg === "-e") {
      const next = args[index + 1];
      if (!next) {
        throw new Error("--env requires a path argument");
      }
      options.envFiles.push(next);
      index += 1;
      continue;
    }

    if (arg.startsWith("--env=")) {
      options.envFiles.push(arg.slice("--env=".length));
      continue;
    }

    if (arg === "--secrets" || arg === "-s") {
      const next = args[index + 1];
      if (!next) {
        throw new Error("--secrets requires a path argument");
      }
      options.secretsFile = next;
      index += 1;
      continue;
    }

    if (arg.startsWith("--secrets=")) {
      options.secretsFile = arg.slice("--secrets=".length);
      continue;
    }

    if (arg === "--quiet" || arg === "-q") {
      options.quiet = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.envFiles.length) {
    const defaultEnv = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(defaultEnv)) {
      options.envFiles.push(defaultEnv);
    }
  }

  return options;
};

function printHelp() {
  const scriptPath = fileURLToPath(import.meta.url);
  const scriptName = path.basename(scriptPath);
  console.log(`Usage: tsx ${scriptName} [options]\n`);
  console.log("Options:");
  console.log(
    "  -e, --env <path>       Load environment variables from the specified file (repeatable)",
  );
  console.log(
    "  -s, --secrets <path>   Use the provided secrets bundle instead of SECRETS_FILE",
  );
  console.log("  -q, --quiet            Only print failures");
  console.log("  -h, --help             Show this message");
}

const isSecretReference = (value: string | undefined | null) => {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const lower = trimmed.toLowerCase();
  if (SECRET_REFERENCE_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return true;
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      return (
        typeof parsed === "object" &&
        parsed !== null &&
        ("provider" in parsed || "engine" in parsed || "type" in parsed)
      );
    } catch {
      return false;
    }
  }

  return false;
};

const parseSecretReference = (raw: string): SecretReferenceInput => {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed) as SecretReferenceInput;
    } catch (error) {
      throw new Error(
        `Failed to parse secret reference JSON: ${(error as Error).message}`,
      );
    }
  }

  return trimmed;
};

const deriveFallbackKey = (key: string) => {
  const segments = key
    .split("_")
    .map((segment) => segment.trim())
    .filter(Boolean);

  while (segments.length > 1) {
    const last = segments[segments.length - 1];
    if (!DERIVED_SUFFIXES.has(last)) {
      break;
    }
    segments.pop();
  }

  if (!segments.length) {
    return undefined;
  }

  const candidate = segments.join("_");
  return candidate === key ? undefined : candidate;
};

const loadEnvironment = (envFiles: string[]) => {
  envFiles.forEach((filePath) => {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      console.warn(`⚠️  Environment file not found: ${resolved}`);
      return;
    }

    dotenv.config({ path: resolved, override: true });
  });
};

const main = () => {
  try {
    const options = parseArgs();

    loadEnvironment(options.envFiles);

    if (options.secretsFile) {
      process.env.SECRETS_FILE = path.resolve(options.secretsFile);
    }

    const entries = Object.entries(process.env).filter(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.startsWith("npm_")) {
        return false;
      }
      if (lowerKey.startsWith("node_")) {
        return false;
      }

      return isSecretReference(typeof value === "string" ? value : undefined);
    });

    if (!entries.length) {
      if (!options.quiet) {
        console.log(
          "ℹ️  No secret references detected in the loaded environment.",
        );
      }
      return;
    }

    const failures: string[] = [];

    if (!options.quiet) {
      console.log("🔍 Validating managed secret references...\n");
    }

    entries.forEach(([key, rawValue]) => {
      if (typeof rawValue !== "string") {
        return;
      }

      const reference = parseSecretReference(rawValue);
      const fallbackKey = deriveFallbackKey(key);
      const fallbackValue = fallbackKey ? process.env[fallbackKey] : undefined;

      try {
        const resolved = resolveSecretSync({
          reference,
          fallback:
            typeof fallbackValue === "string" ? fallbackValue : undefined,
          description: key,
          required: !fallbackValue,
        });

        if (resolved && resolved === fallbackValue) {
          console.warn(
            `⚠️  ${key} fell back to ${fallbackKey}; ensure the managed secret is available before production deployments.`,
          );
          return;
        }

        if (!resolved) {
          failures.push(`${key} could not be resolved and has no fallback.`);
          console.error(`❌  ${key} → unresolved`);
          return;
        }

        if (!options.quiet) {
          const masked =
            resolved.length > 4
              ? `${resolved.slice(0, 2)}…${resolved.slice(-2)}`
              : "****";
          console.log(`✅  ${key} → resolved (${masked})`);
        }
      } catch (error) {
        failures.push(`${key}: ${(error as Error).message}`);
        console.error(`❌  ${key} → ${(error as Error).message}`);
      }
    });

    if (failures.length) {
      console.error(
        "\n❌ Secret validation failed. Fix the issues above and re-run the command.",
      );
      process.exitCode = 1;
      return;
    }

    if (!options.quiet) {
      console.log("\n✅ All detected secret references resolved successfully.");
    }
  } catch (error) {
    console.error(`Secret validation failed: ${(error as Error).message}`);
    process.exitCode = 1;
  }
};

main();
