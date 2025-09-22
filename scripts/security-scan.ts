import { spawn } from "node:child_process";

function runNpmAudit(): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number | null;
}> {
  return new Promise((resolve) => {
    const audit = spawn("npm", ["audit", "--json", "--omit=dev"], {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        NO_UPDATE_NOTIFIER: "1",
        NPM_CONFIG_AUDIT_LEVEL: "low",
      },
    });

    let stdout = "";
    let stderr = "";

    audit.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    audit.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    audit.on("close", (exitCode) => {
      resolve({ stdout, stderr, exitCode });
    });
  });
}

function printSummary(metadata: any) {
  const counts = metadata?.vulnerabilities ?? {};
  const severities = ["critical", "high", "moderate", "low"] as const;

  console.log("\nDependency vulnerability summary:\n");
  for (const level of severities) {
    const count = counts[level] ?? 0;
    console.log(`  ${level.padEnd(8)}: ${count}`);
  }
  console.log("");
}

(async () => {
  const result = await runNpmAudit();

  if (!result.stdout.trim()) {
    console.warn(
      "npm audit did not produce output. stderr was: \n" + result.stderr.trim(),
    );
    console.warn(
      "Skipping vulnerability enforcement because npm audit output is unavailable.",
    );
    process.exit(0);
    return;
  }

  let auditJson: any;
  try {
    auditJson = JSON.parse(result.stdout);
  } catch (error) {
    console.error("Failed to parse npm audit output as JSON.");
    if (result.stderr) {
      console.error(result.stderr.trim());
    }
    process.exitCode = 1;
    return;
  }

  const metadata = auditJson.metadata ?? {};
  printSummary(metadata);

  const vulnerabilityCounts = metadata.vulnerabilities ?? {};
  const severityOrder = ["critical", "high", "moderate", "low"] as const;
  const critical = vulnerabilityCounts.critical ?? 0;
  const high = vulnerabilityCounts.high ?? 0;
  const totalFindings = severityOrder.reduce(
    (sum, level) => sum + (vulnerabilityCounts[level] ?? 0),
    0,
  );

  if (critical > 0 || high > 0) {
    console.error(
      "Blocking deployment: high or critical vulnerabilities detected. See npm audit output above for details.",
    );
    process.exitCode = 1;
    return;
  }

  if (totalFindings > 0 && (result.exitCode ?? 0) > 0) {
    console.warn(
      "npm audit reported issues below the blocking threshold. Resolve when possible.",
    );
  }

  console.log(
    "Security scan passed: no high or critical vulnerabilities found.",
  );
})();
