import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import type { SchedulingService } from "../../server/services/scheduling.service";

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
    "⚠️  Skipping scheduling Postgres integration tests: unable to start container",
    error,
  );
}

const describeIf = shouldSkip ? describe.skip : describe;

describeIf("schedulingService (postgres integration)", () => {
  let schedulingService: SchedulingService;

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

    const module = await import("../../server/services/scheduling.service");
    schedulingService = module.createSchedulingService({
      pool,
      useMemory: false,
    });

    await schedulingService.__resetForTests();
  }, 120_000);

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
    if (container) {
      await container.stop();
    }
  });

  it("prevents double booking and supports lifecycle", async () => {
    const slots = await schedulingService.getSlots();
    expect(slots).toHaveLength(1);

    const booked = await schedulingService.bookSlot({
      slotId: slots[0].id,
      patientId: "patient-db-1",
    });

    await expect(
      schedulingService.bookSlot({ slotId: slots[0].id, patientId: "patient-db-2" }),
    ).rejects.toMatchObject({ statusCode: 409 });

    const rescheduled = await schedulingService.rescheduleAppointment({
      appointmentId: booked.id,
      to: "2025-02-01T14:00:00.000Z",
    });
    expect(rescheduled.slot.start).toBe("2025-02-01T14:00:00.000Z");

    const canceled = await schedulingService.cancelAppointment({
      appointmentId: booked.id,
    });
    expect(canceled.status).toBe("canceled");

    const refreshed = await schedulingService.getSlots();
    expect(refreshed[0].status).toBe("available");
  });
});
