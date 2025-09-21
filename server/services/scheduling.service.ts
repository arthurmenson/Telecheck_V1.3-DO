import { Pool, PoolClient } from "pg";
import { dbPool } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface SchedulingSlot {
  id: string;
  providerId: string;
  locationId?: string | null;
  start: string;
  end: string;
  status: "available" | "booked" | "held" | "cancelled";
}

export interface BookSlotInput {
  slotId: string;
  patientId: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface RescheduleInput {
  appointmentId: string;
  to: string;
}

export interface CancelInput {
  appointmentId: string;
  reason?: string;
}

interface SlotRow {
  id: string;
  provider_id: string;
  location_id: string | null;
  start_time: Date;
  end_time: Date;
  status: string;
  patient_id: string | null;
  booking_reference: string | null;
  seed_reference: string | null;
  metadata: any;
}

interface SchedulingErrorShape extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, unknown>;
}

const DEFAULT_SLOTS: SchedulingSlot[] = [
  {
    id: "s1",
    providerId: "provider-demo",
    locationId: "main",
    start: "2025-01-02T09:00:00.000Z",
    end: "2025-01-02T09:30:00.000Z",
    status: "available",
  },
];

const DEFAULT_REFERENCE_BY_SLOT: Record<string, string> = {
  s1: "apt1",
};

export interface SchedulingServiceOptions {
  pool?: Pool | null;
  useMemory?: boolean;
  defaultSlots?: SchedulingSlot[];
  referenceBySlot?: Record<string, string>;
}

const createError = (
  message: string,
  statusCode: number,
  code: string,
  details?: Record<string, unknown>,
): SchedulingErrorShape => {
  const error = new Error(message) as SchedulingErrorShape;
  error.name = "SchedulingError";
  error.statusCode = statusCode;
  error.code = code;
  if (details) {
    error.details = details;
  }
  return error;
};

const toIso = (value: Date | string): string => {
  if (typeof value === "string") {
    return new Date(value).toISOString();
  }
  return value.toISOString();
};

const mapRowToSlot = (row: SlotRow): SchedulingSlot => ({
  id: row.id,
  providerId: row.provider_id,
  locationId: row.location_id,
  start: toIso(row.start_time),
  end: toIso(row.end_time),
  status: row.status as SchedulingSlot["status"],
});

const getSeedReference = (slotId: string, current?: string | null, referenceMap = DEFAULT_REFERENCE_BY_SLOT) => {
  if (current) {
    return current;
  }
  return referenceMap[slotId] ?? `apt-${uuidv4()}`;
};
export const createSchedulingService = (options: SchedulingServiceOptions = {}) => {
  const pool = options.pool ?? dbPool;
  const defaultSlots = options.defaultSlots ?? DEFAULT_SLOTS;
  const referenceMap = options.referenceBySlot ?? DEFAULT_REFERENCE_BY_SLOT;
  const useMemoryStore = options.useMemory ?? !pool;

  const memorySlots = new Map<string, SchedulingSlot & { bookingReference?: string; patientId?: string }>();
  const memoryAppointments = new Map<
    string,
    {
      appointmentId: string;
      slotId: string;
      providerId: string;
      locationId?: string | null;
      patientId: string;
      start: string;
      end: string;
    }
  >();

  let initialized = false;

  const ensureInitialized = async () => {
    if (initialized) {
      return;
    }

    if (useMemoryStore) {
      memorySlots.clear();
      for (const slot of defaultSlots) {
        memorySlots.set(slot.id, { ...slot });
      }
      initialized = true;
      return;
    }

    if (!pool) {
      throw createError("Database pool unavailable", 500, "DB_UNAVAILABLE");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `CREATE TABLE IF NOT EXISTS appointment_slots (
          id TEXT PRIMARY KEY,
          provider_id TEXT NOT NULL,
          location_id TEXT,
          start_time TIMESTAMPTZ NOT NULL,
          end_time TIMESTAMPTZ NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'held', 'booked', 'cancelled')),
          patient_id TEXT,
          booking_reference TEXT,
          seed_reference TEXT,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
      );
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_appointment_slots_unique ON appointment_slots(provider_id, start_time)`
      );

      for (const slot of defaultSlots) {
        await client.query(
          `INSERT INTO appointment_slots (id, provider_id, location_id, start_time, end_time, status, seed_reference, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            slot.id,
            slot.providerId,
            slot.locationId ?? null,
            slot.start,
            slot.end,
            slot.status,
            referenceMap[slot.id] ?? null,
            JSON.stringify({ source: "seed" }),
          ],
        );
      }
      await client.query("COMMIT");
      initialized = true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  const fetchSlotsFromDb = async (client?: PoolClient): Promise<SlotRow[]> => {
    if (!pool) {
      throw createError("Database pool unavailable", 500, "DB_UNAVAILABLE");
    }
    const runner = client ?? (await pool.connect());
    const shouldRelease = !client;
    try {
      const result = await runner.query<SlotRow>(
        `SELECT id, provider_id, location_id, start_time, end_time, status, patient_id, booking_reference, seed_reference, metadata
         FROM appointment_slots
         ORDER BY start_time ASC`,
      );
      return result.rows;
    } finally {
      if (shouldRelease) {
        runner.release();
      }
    }
  };

  return {
    async getSlots(): Promise<SchedulingSlot[]> {
      await ensureInitialized();

      if (useMemoryStore) {
        return Array.from(memorySlots.values()).map((slot) => ({
          id: slot.id,
          providerId: slot.providerId,
          locationId: slot.locationId,
          start: slot.start,
          end: slot.end,
          status: slot.status,
        }));
      }

      const rows = await fetchSlotsFromDb();
      return rows.map(mapRowToSlot);
    },

    async bookSlot(input: BookSlotInput) {
      await ensureInitialized();
    if (!input.slotId) {
      throw createError("slotId is required", 400, "VALIDATION_ERROR");
    }
    if (!input.patientId) {
      throw createError("patientId is required", 400, "VALIDATION_ERROR");
    }

      if (useMemoryStore) {
        const slot = memorySlots.get(input.slotId);
        if (!slot) {
          throw createError("Slot not found", 404, "SLOT_NOT_FOUND", {
            slotId: input.slotId,
          });
        }
        if (slot.status === "booked") {
          throw createError("Slot already booked", 409, "SLOT_ALREADY_BOOKED", {
            slotId: input.slotId,
          });
        }
        const appointmentId = getSeedReference(input.slotId, slot.bookingReference, referenceMap);
        const updatedSlot = {
          ...slot,
          status: "booked" as const,
          bookingReference: appointmentId,
        patientId: input.patientId,
      };
      memorySlots.set(input.slotId, updatedSlot);
      memoryAppointments.set(appointmentId, {
        appointmentId,
        slotId: input.slotId,
        providerId: slot.providerId,
        locationId: slot.locationId,
        patientId: input.patientId,
        start: slot.start,
        end: slot.end,
      });
      return {
        id: appointmentId,
        status: "booked" as const,
        slot: {
          id: updatedSlot.id,
          providerId: updatedSlot.providerId,
          locationId: updatedSlot.locationId,
          start: updatedSlot.start,
          end: updatedSlot.end,
          status: updatedSlot.status,
        },
      };
    }

      if (!pool) {
        throw createError("Database pool unavailable", 500, "DB_UNAVAILABLE");
      }

      await ensureInitialized();
      const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query<SlotRow>(
        `SELECT * FROM appointment_slots WHERE id = $1 FOR UPDATE`,
        [input.slotId],
      );
      if (rows.length === 0) {
        throw createError("Slot not found", 404, "SLOT_NOT_FOUND", {
          slotId: input.slotId,
        });
      }
      const slot = rows[0];
      if (slot.status === "booked") {
        throw createError("Slot already booked", 409, "SLOT_ALREADY_BOOKED", {
          slotId: input.slotId,
        });
      }
      const appointmentId = getSeedReference(slot.id, slot.booking_reference, referenceMap);
      await client.query(
        `UPDATE appointment_slots
         SET status = $1, patient_id = $2, booking_reference = $3, metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb, updated_at = NOW()
         WHERE id = $5`,
        [
          "booked",
          input.patientId,
          appointmentId,
          JSON.stringify({ reason: input.reason ?? null, metadata: input.metadata ?? null }),
          slot.id,
        ],
      );
      await client.query("COMMIT");
      return {
        id: appointmentId,
        status: "booked" as const,
        slot: mapRowToSlot({ ...slot, status: "booked", booking_reference: appointmentId }),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async rescheduleAppointment(input: RescheduleInput) {
    await ensureInitialized();
    if (!input.appointmentId) {
      throw createError("appointmentId is required", 400, "VALIDATION_ERROR");
    }
    if (!input.to) {
      throw createError("Reschedule target is required", 400, "VALIDATION_ERROR");
    }

    const newStart = new Date(input.to);
    if (Number.isNaN(newStart.getTime())) {
      throw createError("Invalid reschedule timestamp", 400, "VALIDATION_ERROR");
    }

    if (useMemoryStore) {
      const appointment = memoryAppointments.get(input.appointmentId);
      if (!appointment) {
        throw createError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND", {
          appointmentId: input.appointmentId,
        });
      }
      const slot = memorySlots.get(appointment.slotId);
      if (!slot) {
        throw createError("Slot not found", 404, "SLOT_NOT_FOUND", {
          slotId: appointment.slotId,
        });
      }
      const duration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
      const newEnd = new Date(newStart.getTime() + duration);
      const updatedSlot = {
        ...slot,
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
        status: "booked" as const,
        bookingReference: input.appointmentId,
        patientId: appointment.patientId,
      };
      memorySlots.set(slot.id, updatedSlot);
      memoryAppointments.set(input.appointmentId, {
        appointmentId: input.appointmentId,
        slotId: slot.id,
        providerId: slot.providerId,
        locationId: slot.locationId,
        patientId: appointment.patientId,
        start: updatedSlot.start,
        end: updatedSlot.end,
      });
      return {
        id: input.appointmentId,
        status: "rescheduled" as const,
        slot: {
          id: updatedSlot.id,
          providerId: updatedSlot.providerId,
          locationId: updatedSlot.locationId,
          start: updatedSlot.start,
          end: updatedSlot.end,
          status: updatedSlot.status,
        },
      };
    }

      if (!pool) {
        throw createError("Database pool unavailable", 500, "DB_UNAVAILABLE");
      }

      const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query<SlotRow>(
        `SELECT * FROM appointment_slots WHERE booking_reference = $1 FOR UPDATE`,
        [input.appointmentId],
      );
      if (rows.length === 0) {
        throw createError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND", {
          appointmentId: input.appointmentId,
        });
      }
      const slot = rows[0];
      const duration = slot.end_time.getTime() - slot.start_time.getTime();
      const newEnd = new Date(newStart.getTime() + duration);
      await client.query(
        `UPDATE appointment_slots
         SET start_time = $1, end_time = $2, status = $3, updated_at = NOW()
         WHERE id = $4`,
        [newStart.toISOString(), newEnd.toISOString(), "booked", slot.id],
      );
      await client.query("COMMIT");
      return {
        id: input.appointmentId,
        status: "rescheduled" as const,
        slot: mapRowToSlot({
          ...slot,
          start_time: newStart,
          end_time: newEnd,
          status: "booked",
        }),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async cancelAppointment(input: CancelInput) {
    await ensureInitialized();
    if (!input.appointmentId) {
      throw createError("appointmentId is required", 400, "VALIDATION_ERROR");
    }

    if (useMemoryStore) {
      const appointment = memoryAppointments.get(input.appointmentId);
      if (!appointment) {
        throw createError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND", {
          appointmentId: input.appointmentId,
        });
      }
      const slot = memorySlots.get(appointment.slotId);
      if (!slot) {
        throw createError("Slot not found", 404, "SLOT_NOT_FOUND", {
          slotId: appointment.slotId,
        });
      }
      memoryAppointments.delete(input.appointmentId);
      memorySlots.set(slot.id, {
        ...slot,
        status: "available",
        bookingReference: undefined,
        patientId: undefined,
      });
      return {
        id: input.appointmentId,
        status: "canceled" as const,
      };
    }

      if (!pool) {
        throw createError("Database pool unavailable", 500, "DB_UNAVAILABLE");
      }

      const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query<SlotRow>(
        `SELECT * FROM appointment_slots WHERE booking_reference = $1 FOR UPDATE`,
        [input.appointmentId],
      );
      if (rows.length === 0) {
        throw createError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND", {
          appointmentId: input.appointmentId,
        });
      }
      const slot = rows[0];
      await client.query(
        `UPDATE appointment_slots
         SET status = $1, patient_id = NULL, booking_reference = NULL, updated_at = NOW()
         WHERE id = $2`,
        ["available", slot.id],
      );
      await client.query("COMMIT");
      return {
        id: input.appointmentId,
        status: "canceled" as const,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  /** @internal Test helper */
    async __resetForTests() {
      if (useMemoryStore) {
        memorySlots.clear();
        memoryAppointments.clear();
        initialized = false;
        await ensureInitialized();
        return;
      }

      if (!pool) {
        throw createError("Database pool unavailable", 500, "DB_UNAVAILABLE");
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("TRUNCATE appointment_slots");
        for (const slot of defaultSlots) {
          await client.query(
            `INSERT INTO appointment_slots (id, provider_id, location_id, start_time, end_time, status, seed_reference, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              slot.id,
              slot.providerId,
              slot.locationId ?? null,
              slot.start,
              slot.end,
              slot.status,
              referenceMap[slot.id] ?? null,
              JSON.stringify({ source: "seed" }),
            ],
          );
        }
        await client.query("COMMIT");
        initialized = true;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },

    isMemoryMode() {
      return useMemoryStore;
    },
  };
};

export const schedulingService = createSchedulingService();

export type SchedulingService = ReturnType<typeof createSchedulingService>;
