import { Pool } from "pg";
import { dbPool } from "../config/database";

export interface VitalSample {
  timestamp: string;
  value: number;
  metadata?: Record<string, unknown> | null;
}

export interface VitalSeries {
  metric: string;
  unit?: string | null;
  values: VitalSample[];
}

export interface AlertRecord {
  id: string;
  metric: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "acknowledged" | "resolved";
  message: string;
  createdAt: string;
  resolvedAt?: string | null;
  context?: Record<string, unknown> | null;
}

export interface ThresholdRecord {
  metric: string;
  unit?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  metadata?: Record<string, unknown> | null;
  updatedAt: string;
}

export interface RpmVitalsResponse {
  patientId: string;
  days: number;
  vitals: VitalSeries[];
  summary: {
    totalRecords: number;
    metrics: { metric: string; count: number }[];
  };
}

export interface RpmAlertsResponse {
  patientId: string;
  alerts: AlertRecord[];
}

export interface RpmThresholdsResponse {
  patientId: string;
  thresholds: ThresholdRecord[];
}

interface RpmServiceOptions {
  pool?: Pool | null;
  useMemory?: boolean;
  clock?: () => Date;
}

interface VitalRow {
  patient_id: string;
  metric: string;
  unit: string | null;
  value: number;
  recorded_at: Date;
  metadata: Record<string, unknown> | null;
}

interface AlertRow {
  id: string;
  patient_id: string;
  metric: string;
  severity: string;
  status: string;
  message: string;
  created_at: Date;
  resolved_at: Date | null;
  context: Record<string, unknown> | null;
}

interface ThresholdRow {
  patient_id: string;
  metric: string;
  unit: string | null;
  min_value: number | null;
  max_value: number | null;
  metadata: Record<string, unknown> | null;
  updated_at: Date;
}

const demoNow = () => new Date("2025-01-02T09:00:00.000Z");

const DEFAULT_VITALS: VitalRow[] = [
  {
    patient_id: "rpm-demo",
    metric: "heart_rate",
    unit: "bpm",
    value: 72,
    recorded_at: new Date("2025-01-01T08:00:00.000Z"),
    metadata: { source: "bluetooth" },
  },
  {
    patient_id: "rpm-demo",
    metric: "heart_rate",
    unit: "bpm",
    value: 76,
    recorded_at: new Date("2025-01-02T08:00:00.000Z"),
    metadata: { source: "bluetooth" },
  },
  {
    patient_id: "rpm-demo",
    metric: "blood_pressure_systolic",
    unit: "mmHg",
    value: 120,
    recorded_at: new Date("2025-01-02T08:00:00.000Z"),
    metadata: { source: "manual" },
  },
];

const DEFAULT_THRESHOLDS: ThresholdRow[] = [
  {
    patient_id: "rpm-demo",
    metric: "heart_rate",
    unit: "bpm",
    min_value: 55,
    max_value: 110,
    metadata: { escalation: "notify-clinician" },
    updated_at: new Date("2025-01-01T07:00:00.000Z"),
  },
  {
    patient_id: "rpm-demo",
    metric: "blood_pressure_systolic",
    unit: "mmHg",
    min_value: 90,
    max_value: 140,
    metadata: { escalation: "notify-rn" },
    updated_at: new Date("2025-01-01T07:00:00.000Z"),
  },
];

const DEFAULT_ALERTS: AlertRow[] = [
  {
    id: "alert-demo-1",
    patient_id: "rpm-demo",
    metric: "heart_rate",
    severity: "medium",
    status: "open",
    message: "Heart rate exceeded threshold",
    created_at: new Date("2025-01-02T08:30:00.000Z"),
    resolved_at: null,
    context: { value: 120, unit: "bpm" },
  },
];

const toIso = (value: Date): string => value.toISOString();

const toSeries = (rows: VitalRow[]): VitalSeries[] => {
  const byMetric = new Map<string, VitalSeries>();

  for (const row of rows) {
    if (!byMetric.has(row.metric)) {
      byMetric.set(row.metric, {
        metric: row.metric,
        unit: row.unit,
        values: [],
      });
    }
    byMetric.get(row.metric)!.values.push({
      timestamp: toIso(row.recorded_at),
      value: row.value,
      metadata: row.metadata,
    });
  }

  return Array.from(byMetric.values()).map((series) => ({
    ...series,
    values: series.values.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    ),
  }));
};

const toAlerts = (rows: AlertRow[]): AlertRecord[] =>
  rows.map((row) => ({
    id: row.id,
    metric: row.metric,
    severity: row.severity as AlertRecord["severity"],
    status: row.status as AlertRecord["status"],
    message: row.message,
    createdAt: toIso(row.created_at),
    resolvedAt: row.resolved_at ? toIso(row.resolved_at) : null,
    context: row.context,
  }));

const toThresholds = (rows: ThresholdRow[]): ThresholdRecord[] =>
  rows.map((row) => ({
    metric: row.metric,
    unit: row.unit,
    minValue: row.min_value,
    maxValue: row.max_value,
    metadata: row.metadata,
    updatedAt: toIso(row.updated_at),
  }));

export const createRpmService = (options: RpmServiceOptions = {}) => {
  const pool = options.pool ?? dbPool;
  const useMemoryStore = options.useMemory ?? !pool;
  const now = options.clock ?? demoNow;

  const memoryVitals = new Map<string, VitalRow[]>([
    ["rpm-demo", DEFAULT_VITALS],
  ]);
  const memoryThresholds = new Map<string, ThresholdRow[]>([
    ["rpm-demo", DEFAULT_THRESHOLDS],
  ]);
  const memoryAlerts = new Map<string, AlertRow[]>([["rpm-demo", DEFAULT_ALERTS]]);

  let initialized = false;

  const ensureInitialized = async () => {
    if (initialized || useMemoryStore) {
      initialized = true;
      return;
    }
    if (!pool) {
      throw new Error("Database pool unavailable for RPM service");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      await client.query(
        `CREATE TABLE IF NOT EXISTS rpm_vitals (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          patient_id TEXT NOT NULL,
          metric TEXT NOT NULL,
          unit TEXT,
          value NUMERIC(10,2) NOT NULL,
          recorded_at TIMESTAMPTZ NOT NULL,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )`,
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_rpm_vitals_patient_metric_time
         ON rpm_vitals(patient_id, metric, recorded_at)`
      );

      await client.query(
        `CREATE TABLE IF NOT EXISTS rpm_thresholds (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          patient_id TEXT NOT NULL,
          metric TEXT NOT NULL,
          unit TEXT,
          min_value NUMERIC(10,2),
          max_value NUMERIC(10,2),
          metadata JSONB,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(patient_id, metric)
        )`,
      );

      await client.query(
        `CREATE TABLE IF NOT EXISTS rpm_alerts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          patient_id TEXT NOT NULL,
          metric TEXT NOT NULL,
          severity TEXT NOT NULL,
          status TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMPTZ,
          context JSONB
        )`,
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_rpm_alerts_patient_status
         ON rpm_alerts(patient_id, status, created_at DESC)`
      );

      const { rows } = await client.query<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM rpm_vitals WHERE patient_id = $1`,
        ["rpm-demo"],
      );
      if (!rows[0] || Number(rows[0].count) === 0) {
        for (const entry of DEFAULT_VITALS) {
          await client.query(
            `INSERT INTO rpm_vitals (patient_id, metric, unit, value, recorded_at, metadata)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              entry.patient_id,
              entry.metric,
              entry.unit,
              entry.value,
              entry.recorded_at.toISOString(),
              entry.metadata ? JSON.stringify(entry.metadata) : null,
            ],
          );
        }
      }

      const thresholds = await client.query<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM rpm_thresholds WHERE patient_id = $1`,
        ["rpm-demo"],
      );
      if (!thresholds.rows[0] || Number(thresholds.rows[0].count) === 0) {
        for (const entry of DEFAULT_THRESHOLDS) {
          await client.query(
            `INSERT INTO rpm_thresholds (patient_id, metric, unit, min_value, max_value, metadata, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (patient_id, metric) DO NOTHING`,
            [
              entry.patient_id,
              entry.metric,
              entry.unit,
              entry.min_value,
              entry.max_value,
              entry.metadata ? JSON.stringify(entry.metadata) : null,
              entry.updated_at.toISOString(),
            ],
          );
        }
      }

      const alerts = await client.query<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM rpm_alerts WHERE patient_id = $1`,
        ["rpm-demo"],
      );
      if (!alerts.rows[0] || Number(alerts.rows[0].count) === 0) {
        for (const entry of DEFAULT_ALERTS) {
          await client.query(
            `INSERT INTO rpm_alerts (id, patient_id, metric, severity, status, message, created_at, resolved_at, context)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [
              entry.id,
              entry.patient_id,
              entry.metric,
              entry.severity,
              entry.status,
              entry.message,
              entry.created_at.toISOString(),
              entry.resolved_at ? entry.resolved_at.toISOString() : null,
              entry.context ? JSON.stringify(entry.context) : null,
            ],
          );
        }
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

  const guardPatientId = (patientId: string | undefined): string => {
    if (!patientId || typeof patientId !== "string") {
      throw new Error("patientId is required");
    }
    return patientId;
  };

  return {
    async getPatientVitals(patientId: string, days = 7): Promise<RpmVitalsResponse> {
      const id = guardPatientId(patientId);
      if (Number.isNaN(days) || days <= 0) {
        throw new Error("days must be a positive integer");
      }

      if (useMemoryStore) {
        const samples = memoryVitals.get(id) ?? [];
        const cutoff = now();
        cutoff.setDate(cutoff.getDate() - days);
        const filtered = samples.filter((sample) => sample.recorded_at >= cutoff);
        const vitals = toSeries(filtered);
        return {
          patientId: id,
          days,
          vitals,
          summary: {
            totalRecords: filtered.length,
            metrics: vitals.map((series) => ({
              metric: series.metric,
              count: series.values.length,
            })),
          },
        };
      }

      await ensureInitialized();
      if (!pool) {
        throw new Error("Database pool unavailable for RPM service");
      }
      const cutoff = now();
      cutoff.setDate(cutoff.getDate() - days);
      const { rows } = await pool.query<VitalRow>(
        `SELECT patient_id, metric, unit, value, recorded_at, metadata
         FROM rpm_vitals
         WHERE patient_id = $1 AND recorded_at >= $2
         ORDER BY recorded_at ASC`,
        [id, cutoff.toISOString()],
      );
      const vitals = toSeries(rows);
      return {
        patientId: id,
        days,
        vitals,
        summary: {
          totalRecords: rows.length,
          metrics: vitals.map((series) => ({
            metric: series.metric,
            count: series.values.length,
          })),
        },
      };
    },

    async getPatientAlerts(patientId: string): Promise<RpmAlertsResponse> {
      const id = guardPatientId(patientId);
      if (useMemoryStore) {
        const alerts = toAlerts(memoryAlerts.get(id) ?? []);
        return { patientId: id, alerts };
      }
      await ensureInitialized();
      if (!pool) {
        throw new Error("Database pool unavailable for RPM service");
      }
      const { rows } = await pool.query<AlertRow>(
        `SELECT id, patient_id, metric, severity, status, message, created_at, resolved_at, context
         FROM rpm_alerts
         WHERE patient_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [id],
      );
      return { patientId: id, alerts: toAlerts(rows) };
    },

    async getPatientThresholds(patientId: string): Promise<RpmThresholdsResponse> {
      const id = guardPatientId(patientId);
      if (useMemoryStore) {
        const thresholds = toThresholds(memoryThresholds.get(id) ?? []);
        return { patientId: id, thresholds };
      }
      await ensureInitialized();
      if (!pool) {
        throw new Error("Database pool unavailable for RPM service");
      }
      const { rows } = await pool.query<ThresholdRow>(
        `SELECT patient_id, metric, unit, min_value, max_value, metadata, updated_at
         FROM rpm_thresholds
         WHERE patient_id = $1`,
        [id],
      );
      return { patientId: id, thresholds: toThresholds(rows) };
    },

    async __resetForTests() {
      if (useMemoryStore) {
        memoryVitals.set("rpm-demo", DEFAULT_VITALS);
        memoryThresholds.set("rpm-demo", DEFAULT_THRESHOLDS);
        memoryAlerts.set("rpm-demo", DEFAULT_ALERTS);
        initialized = true;
        return;
      }
      await ensureInitialized();
      if (!pool) {
        throw new Error("Database pool unavailable for RPM service");
      }
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("TRUNCATE rpm_vitals RESTART IDENTITY");
        await client.query("TRUNCATE rpm_thresholds RESTART IDENTITY");
        await client.query("TRUNCATE rpm_alerts RESTART IDENTITY");
        for (const entry of DEFAULT_VITALS) {
          await client.query(
            `INSERT INTO rpm_vitals (patient_id, metric, unit, value, recorded_at, metadata)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              entry.patient_id,
              entry.metric,
              entry.unit,
              entry.value,
              entry.recorded_at.toISOString(),
              entry.metadata ? JSON.stringify(entry.metadata) : null,
            ],
          );
        }
        for (const entry of DEFAULT_THRESHOLDS) {
          await client.query(
            `INSERT INTO rpm_thresholds (patient_id, metric, unit, min_value, max_value, metadata, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (patient_id, metric) DO NOTHING`,
            [
              entry.patient_id,
              entry.metric,
              entry.unit,
              entry.min_value,
              entry.max_value,
              entry.metadata ? JSON.stringify(entry.metadata) : null,
              entry.updated_at.toISOString(),
            ],
          );
        }
        for (const entry of DEFAULT_ALERTS) {
          await client.query(
            `INSERT INTO rpm_alerts (id, patient_id, metric, severity, status, message, created_at, resolved_at, context)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [
              entry.id,
              entry.patient_id,
              entry.metric,
              entry.severity,
              entry.status,
              entry.message,
              entry.created_at.toISOString(),
              entry.resolved_at ? entry.resolved_at.toISOString() : null,
              entry.context ? JSON.stringify(entry.context) : null,
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

export type RpmService = ReturnType<typeof createRpmService>;
export const rpmService = createRpmService();
