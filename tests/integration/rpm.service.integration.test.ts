import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import type { RpmService } from "../../server/services/rpm.service";

let container: StartedPostgreSqlContainer | null = null;
let pool: Pool | null = null;
let shouldSkip = false;

try {
  container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("telecheck")
    .withUsername("test")
    .withPassword("test")
    .start();
} catch (error) {
  shouldSkip = true;
  console.warn(
    "⚠️  Skipping RPM Postgres integration tests: unable to start container",
    error,
  );
}

const describeIf = shouldSkip ? describe.skip : describe;

describeIf("rpmService (postgres integration)", () => {
  let rpmService: RpmService;

  beforeAll(async () => {
    if (!container) {
      return;
    }
    pool = new Pool({
      host: container.getHost(),
      port: container.getMappedPort(5432),
      user: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
    });
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    const module = await import("../../server/services/rpm.service");
    rpmService = module.createRpmService({ pool, useMemory: false });
    await rpmService.__resetForTests();
  }, 120_000);

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
    if (container) {
      await container.stop();
    }
  });

  it("returns persisted vitals", async () => {
    const vitals = await rpmService.getPatientVitals("rpm-demo", 7);
    expect(vitals.summary.totalRecords).toBeGreaterThan(0);
    expect(vitals.vitals[0].values.length).toBeGreaterThan(0);
  });

  it("returns alerts and thresholds from postgres", async () => {
    const alerts = await rpmService.getPatientAlerts("rpm-demo");
    expect(alerts.alerts.length).toBeGreaterThan(0);

    const thresholds = await rpmService.getPatientThresholds("rpm-demo");
    expect(thresholds.thresholds.length).toBeGreaterThan(0);
  });
});
