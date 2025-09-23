import path from "path";
import { readdir } from "fs/promises";
import { spawn } from "child_process";

const TEST_GLOB = "contracts/pact/**/*.pact.test.ts";
const CONTRACT_ROOT = path.resolve(process.cwd(), "contracts", "pact");

async function hasContractTests(dir: string): Promise<boolean> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (await hasContractTests(entryPath)) {
          return true;
        }
      } else if (/\.pact\.test\.tsx?$/.test(entry.name)) {
        return true;
      }
    }
  } catch (error) {
    return false;
  }
  return false;
}

async function main() {
  if (!(await hasContractTests(CONTRACT_ROOT))) {
    console.log(
      `No contract tests found matching pattern "${TEST_GLOB}". Skipping.`,
    );
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      "npx",
      ["vitest", "run", TEST_GLOB, "--passWithNoTests"],
      {
        stdio: "inherit",
        shell: process.platform === "win32",
      },
    );

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Contract tests exited with code ${code}`));
      }
    });
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
