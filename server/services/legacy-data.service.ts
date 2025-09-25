import { dbPool } from "../config/database";
import { randomUUID } from "crypto";

const LEGACY_USER_CUTOFF = new Date(
  process.env.LEGACY_USER_CUTOFF || "2025-09-25T00:00:00Z",
);

function createSeededGenerator(seed: string) {
  let state = parseInt(seed.slice(0, 16), 16) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function seededNumber(
  gen: () => number,
  min: number,
  max: number,
  precision = 0,
) {
  const value = min + gen() * (max - min);
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

async function insertBaselineVitals(userId: string) {
  if (!dbPool) return;
  const existing = await dbPool.query(
    "SELECT 1 FROM vital_signs WHERE user_id = $1 LIMIT 1",
    [userId],
  );
  if (existing.rows.length > 0) return;

  await dbPool.query(
    `INSERT INTO vital_signs (
        user_id,
        heart_rate,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        temperature,
        oxygen_saturation,
        weight,
        height,
        recorded_at,
        source
      )
      VALUES ($1, 0, 0, 0, 0, 0, 0, 0, NOW(), 'manual')`,
    [userId],
  );
}

async function insertBaselineLabResults(userId: string) {
  if (!dbPool) return;
  const existing = await dbPool.query(
    "SELECT 1 FROM lab_reports WHERE user_id = $1 LIMIT 1",
    [userId],
  );
  if (existing.rows.length > 0) return;

  const reportResult = await dbPool.query(
    `INSERT INTO lab_reports (
        user_id,
        file_name,
        file_size,
        file_url,
        upload_date,
        analysis_status,
        ai_summary,
        confidence
      )
      VALUES ($1, $2, $3, $4, NOW(), 'completed', $5, $6)
      RETURNING id`,
    [
      userId,
      "baseline-panel.pdf",
      0,
      `/baseline/${userId}`,
      "Baseline values initialized. Awaiting real lab results.",
      0,
    ],
  );

  const reportId = reportResult.rows[0].id;

  const tests = [
    { name: "Creatinine", unit: "mg/dL", range: "0" },
    { name: "Total Cholesterol", unit: "mg/dL", range: "0" },
    { name: "HDL", unit: "mg/dL", range: "0" },
    { name: "HbA1c", unit: "%", range: "0" },
  ];

  for (const test of tests) {
    await dbPool.query(
      `INSERT INTO lab_results (
          lab_report_id,
          test_name,
          value,
          unit,
          reference_range,
          status,
          test_date,
          lab_name,
          doctor_notes
        )
        VALUES ($1, $2, 0, $3, $4, 'normal', NOW(), 'Baseline Initialization', $5)`,
      [
        reportId,
        test.name,
        test.unit,
        test.range,
        "Baseline entry - replace with real lab data",
      ],
    );
  }
}

async function insertBaselineMedication(userId: string) {
  if (!dbPool) return;
  const existing = await dbPool.query(
    "SELECT 1 FROM medications WHERE user_id = $1 LIMIT 1",
    [userId],
  );
  if (existing.rows.length > 0) return;

  await dbPool.query(
    `INSERT INTO medications (
        user_id,
        name,
        dosage,
        frequency,
        start_date,
        prescribed_by,
        instructions,
        is_active
      )
      VALUES ($1, 'Pending Assignment', '0 mg', 'None', NOW(), 'Telecheck Team', 'No medications assigned yet.', false)`,
    [userId],
  );
}

async function fetchLegacyUserIds(): Promise<string[]> {
  if (!dbPool) return [];
  const result = await dbPool.query(
    "SELECT id FROM users WHERE created_at < $1",
    [LEGACY_USER_CUTOFF],
  );
  return result.rows.map((row: { id: string }) => row.id);
}

async function isLegacyUser(userId: string) {
  if (!dbPool) return false;
  const result = await dbPool.query(
    "SELECT created_at FROM users WHERE id = $1",
    [userId],
  );
  if (result.rows.length === 0) return false;
  const createdAt = result.rows[0].created_at as Date;
  return createdAt < LEGACY_USER_CUTOFF;
}

async function isNewUser(userId: string) {
  if (!dbPool) return false;
  const result = await dbPool.query(
    "SELECT created_at FROM users WHERE id = $1",
    [userId],
  );
  if (result.rows.length === 0) return false;
  const createdAt = result.rows[0].created_at as Date;
  return createdAt >= LEGACY_USER_CUTOFF;
}

async function seedMedications(userId: string) {
  if (!dbPool) return;
  const countResult = await dbPool.query(
    "SELECT COUNT(*) FROM medications WHERE user_id = $1",
    [userId],
  );
  if (parseInt(countResult.rows[0].count, 10) > 0) return;

  const generator = createSeededGenerator(userId.replace(/-/g, ""));
  const templates = [
    {
      name: "Atorvastatin",
      dosage: "20 mg",
      frequency: "Once daily",
      instructions: "Take with evening meal",
    },
    {
      name: "Metformin",
      dosage: "500 mg",
      frequency: "Twice daily",
      instructions: "Take with food",
    },
    {
      name: "Lisinopril",
      dosage: "10 mg",
      frequency: "Once daily",
      instructions: "Take in the morning",
    },
  ];

  for (const template of templates) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(generator() * 120));
    await dbPool.query(
      `INSERT INTO medications
        (user_id, name, dosage, frequency, start_date, prescribed_by, instructions, is_active)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT DO NOTHING`,
      [
        userId,
        template.name,
        template.dosage,
        template.frequency,
        startDate,
        "Dr. Emily Carter",
        template.instructions,
      ],
    );
  }
}

async function seedVitals(userId: string) {
  if (!dbPool) return;
  const countResult = await dbPool.query(
    "SELECT COUNT(*) FROM vital_signs WHERE user_id = $1",
    [userId],
  );
  if (parseInt(countResult.rows[0].count, 10) > 0) return;

  const generator = createSeededGenerator(userId.slice(-16));
  const today = new Date();

  for (let i = 0; i < 12; i += 1) {
    const recordedAt = new Date(today);
    recordedAt.setDate(today.getDate() - i * 3);

    await dbPool.query(
      `INSERT INTO vital_signs
        (user_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, weight, height, recorded_at, source)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        userId,
        Math.round(seededNumber(generator, 60, 92)),
        Math.round(seededNumber(generator, 110, 138)),
        Math.round(seededNumber(generator, 70, 88)),
        seededNumber(generator, 97, 98.9, 1),
        Math.round(seededNumber(generator, 94, 100)),
        seededNumber(generator, 140, 220, 1),
        seededNumber(generator, 62, 74, 1),
        recordedAt,
        "device",
      ],
    );
  }
}

async function seedLabResults(userId: string) {
  if (!dbPool) return;
  const reportCount = await dbPool.query(
    "SELECT COUNT(*) FROM lab_reports WHERE user_id = $1",
    [userId],
  );
  if (parseInt(reportCount.rows[0].count, 10) > 0) return;

  const generator = createSeededGenerator(userId.substring(0, 16));
  const uploadDate = new Date();
  uploadDate.setDate(uploadDate.getDate() - 10);

  const reportResult = await dbPool.query(
    `INSERT INTO lab_reports (user_id, file_name, file_size, file_url, upload_date, analysis_status, ai_summary, confidence)
     VALUES ($1, $2, $3, $4, $5, 'completed', $6, $7)
     RETURNING id`,
    [
      userId,
      `panel-${uploadDate.getTime()}.pdf`,
      Math.floor(generator() * 400000) + 200000,
      `/uploads/${randomUUID()}.pdf`,
      uploadDate,
      "Automated analysis completed.",
      seededNumber(generator, 0.78, 0.96, 2),
    ],
  );

  const reportId = reportResult.rows[0].id;

  const tests = [
    {
      name: "Creatinine",
      unit: "mg/dL",
      range: "0.6-1.2",
    },
    {
      name: "Total Cholesterol",
      unit: "mg/dL",
      range: "<200",
    },
    {
      name: "HDL",
      unit: "mg/dL",
      range: "40-60",
    },
    {
      name: "HbA1c",
      unit: "%",
      range: "4.0-5.7",
    },
  ];

  tests.forEach(async (test, index) => {
    const testDate = new Date(uploadDate);
    testDate.setDate(uploadDate.getDate() - index * 7);
    const value = seededNumber(generator, 0.8, 1.2);
    const status = value > 1 ? "high" : "normal";

    await dbPool.query(
      `INSERT INTO lab_results
        (lab_report_id, test_name, value, unit, reference_range, status, test_date, lab_name, doctor_notes)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        reportId,
        test.name,
        seededNumber(generator, 0.7, 1.6, 2),
        test.unit,
        test.range,
        status,
        testDate,
        "Telecheck Labs",
        "Review during next scheduled visit.",
      ],
    );
  });
}

async function seedNewUserBaseline(userId: string) {
  if (!dbPool) return;
  await insertBaselineVitals(userId);
  await insertBaselineLabResults(userId);
  await insertBaselineMedication(userId);
}

export async function ensureLegacyClinicalData(userId: string) {
  if (!dbPool) return;
  if (!(await isLegacyUser(userId))) {
    if (await isNewUser(userId)) {
      await seedNewUserBaseline(userId);
    }
    return;
  }

  await seedMedications(userId);
  await seedVitals(userId);
  await seedLabResults(userId);
}

export async function ensureAllLegacyClinicalData() {
  const ids = await fetchLegacyUserIds();
  for (const id of ids) {
    await ensureLegacyClinicalData(id);
  }
  return ids.length;
}
