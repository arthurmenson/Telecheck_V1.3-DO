import { spawn } from "child_process";
import http from "http";

const SERVER_URL = process.env.SMOKE_URL || "http://localhost:3000/health";
const START_COMMAND = process.env.SMOKE_START_CMD?.split(" ") ?? [
  "node",
  "dist/server/node-build.mjs",
];
const USE_WINDOWS_SHELL = process.platform === "win32";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(
  timeoutMs = 30_000,
  intervalMs = 1_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(SERVER_URL, (res) => {
          res.resume();
          res.statusCode && res.statusCode < 500
            ? resolve()
            : reject(new Error(`Unexpected status ${res.statusCode}`));
        });
        req.on("error", reject);
        req.end();
      });
      return;
    } catch (error) {
      await wait(intervalMs);
    }
  }

  throw new Error(
    `Timed out waiting for server at ${SERVER_URL}. Ensure it starts successfully.`,
  );
}

async function run() {
  const [cmd, ...args] = START_COMMAND;
  console.log(`Starting server: ${[cmd, ...args].join(" ")}`);

  const server = spawn(cmd, args, {
    stdio: "inherit",
    env: process.env,
  });

  let finished = false;

  const cleanup = () => {
    if (finished) return;
    finished = true;
    if (!server.killed) {
      server.kill("SIGTERM");
    }
  };

  server.on("exit", (code) => {
    if (!finished && code !== 0) {
      console.warn(`Server exited early with code ${code}`);
    }
  });

  try {
    await waitForServer();
    console.log("Server is up. Running smoke check...");

    await new Promise<void>((resolve, reject) => {
      const smoke = spawn("npx", ["tsx", "./scripts/smoke-health.ts"], {
        stdio: "inherit",
        env: process.env,
        shell: USE_WINDOWS_SHELL,
      });

      smoke.on("exit", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Smoke check exited with code ${code}`));
        }
      });
    });

    console.log("Smoke check succeeded.");
  } catch (error) {
    cleanup();
    throw error;
  }

  cleanup();
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode =
    typeof (error as any)?.code === "number" ? (error as any).code : 1;
});
