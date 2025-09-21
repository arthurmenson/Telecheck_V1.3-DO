import { describe, it, expect, beforeEach } from "vitest";

process.env.SCHEDULING_USE_IN_MEMORY = "true";

const { createSchedulingService } = await import(
  "../../server/services/scheduling.service",
);
const schedulingService = createSchedulingService({ useMemory: true });

describe("schedulingService (memory mode)", () => {
  beforeEach(async () => {
    await schedulingService.__resetForTests?.();
  });

  it("returns seeded slots", async () => {
    const slots = await schedulingService.getSlots();
    expect(slots).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "s1",
          start: "2025-01-02T09:00:00.000Z",
          end: "2025-01-02T09:30:00.000Z",
          status: "available",
        }),
      ]),
    );
  });

  it("books, reschedules, and cancels a slot", async () => {
    const booked = await schedulingService.bookSlot({ slotId: "s1", patientId: "patient-1" });
    expect(booked.id).toBe("apt1");
    expect(booked.status).toBe("booked");

    await expect(
      schedulingService.bookSlot({ slotId: "s1", patientId: "patient-2" }),
    ).rejects.toMatchObject({ statusCode: 409 });

    const rescheduled = await schedulingService.rescheduleAppointment({
      appointmentId: booked.id,
      to: "2025-01-02T10:00:00.000Z",
    });
    expect(rescheduled.status).toBe("rescheduled");
    expect(rescheduled.slot.start).toBe("2025-01-02T10:00:00.000Z");

    const canceled = await schedulingService.cancelAppointment({
      appointmentId: booked.id,
    });
    expect(canceled.status).toBe("canceled");

    const slotsAfter = await schedulingService.getSlots();
    const refreshedSlot = slotsAfter.find((slot) => slot.id === "s1");
    expect(refreshedSlot?.status).toBe("available");
  });
});
