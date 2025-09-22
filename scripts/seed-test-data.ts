import "dotenv/config";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

import { dbPool } from "../server/config/database";

interface SeedOptions {
  batchId: string;
  patientCount: number;
  resetDomain: string;
  patientPassword: string;
  providerPassword: string;
}

interface CreatedUser {
  id: string;
  email: string;
  label?: string;
  specialty?: string;
}

const REQUIRED_POOL_MESSAGE =
  "Database connection pool is not configured. Set DATABASE_URL/DB_HOST before running the seed script.";

const pick = <T>(values: T[]): T => {
  return values[Math.floor(Math.random() * values.length)];
};

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const YEARS = Array.from({ length: 40 }).map((_, idx) => 1980 + idx);

const FIRST_NAMES = [
  "Aster",
  "Basil",
  "Cedar",
  "Dune",
  "Ember",
  "Fable",
  "Gale",
  "Harbor",
  "Indigo",
  "Juniper",
  "Kepler",
  "Lumen",
  "Maris",
  "Nova",
  "Orion",
  "Prairie",
  "Quill",
  "Rune",
  "Sol",
  "Thyme",
];

const LAST_NAMES = [
  "Arden",
  "Bright",
  "Cobalt",
  "Drift",
  "Ember",
  "Frost",
  "Grove",
  "Haven",
  "Ivory",
  "Jasper",
  "Keene",
  "Lark",
  "Morrow",
  "North",
  "Oak",
  "Pine",
  "Quarry",
  "Reed",
  "Stone",
  "Vale",
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["male", "female", "other"] as const;

const ALLERGY_LIBRARY = [
  "Peanuts",
  "Penicillin",
  "Shellfish",
  "Latex",
  "Tree Nuts",
  "Sulfa",
];

const CONDITIONS = [
  "Hypertension",
  "Type 2 Diabetes",
  "Asthma",
  "Hyperlipidemia",
  "Migraines",
  "Hypothyroidism",
];

const MEDICATIONS = [
  { name: "Lisinopril", dosage: "10mg", frequency: "daily" },
  { name: "Metformin", dosage: "500mg", frequency: "twice daily" },
  { name: "Albuterol", dosage: "2 puffs", frequency: "as needed" },
  { name: "Levothyroxine", dosage: "75mcg", frequency: "daily" },
];

const PROVIDERS = [
  { firstName: "River", lastName: "Callow", specialty: "Primary Care" },
  { firstName: "Sage", lastName: "Halley", specialty: "Cardiology" },
  { firstName: "Vale", lastName: "Ormond", specialty: "Endocrinology" },
];

const createOptions = (): SeedOptions => {
  const batchId = randomUUID().slice(0, 8);
  const patientCount = Number(process.env.TEST_DATA_PATIENT_COUNT || "10");
  const resetDomain =
    process.env.TEST_DATA_EMAIL_DOMAIN?.trim() || "demo.telecheck";
  const patientPassword =
    process.env.TEST_DATA_PATIENT_PASSWORD || "Patient!234";
  const providerPassword =
    process.env.TEST_DATA_PROVIDER_PASSWORD || "Provider!234";

  return {
    batchId,
    patientCount,
    resetDomain,
    patientPassword,
    providerPassword,
  };
};

const resetPreviousSeedData = async (domain: string): Promise<number> => {
  if (!dbPool) {
    throw new Error(REQUIRED_POOL_MESSAGE);
  }

  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    const pattern = `%@${domain}`;
    const { rows: targetUsers } = await client.query<{ id: string }>(
      `SELECT id FROM users WHERE email LIKE $1`,
      [pattern],
    );

    if (!targetUsers.length) {
      await client.query("COMMIT");
      return 0;
    }

    const userIds = targetUsers.map((row) => row.id);

    await client.query(
      `DELETE FROM appointments WHERE patient_id = ANY($1::uuid[]) OR provider_id = ANY($1::uuid[])`,
      [userIds],
    );
    await client.query(
      `DELETE FROM vital_signs WHERE user_id = ANY($1::uuid[])`,
      [userIds],
    );
    await client.query(
      `DELETE FROM medications WHERE user_id = ANY($1::uuid[])`,
      [userIds],
    );
    await client.query(
      `DELETE FROM lab_results WHERE lab_report_id IN (
        SELECT id FROM lab_reports WHERE user_id = ANY($1::uuid[])
      )`,
      [userIds],
    );
    await client.query(
      `DELETE FROM lab_reports WHERE user_id = ANY($1::uuid[])`,
      [userIds],
    );
    await client.query(
      `DELETE FROM notifications WHERE user_id = ANY($1::uuid[])`,
      [userIds],
    );
    await client.query(
      `DELETE FROM health_insights WHERE user_id = ANY($1::uuid[])`,
      [userIds],
    );
    await client.query(`DELETE FROM patients WHERE user_id = ANY($1::uuid[])`, [
      userIds,
    ]);
    await client.query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [
      userIds,
    ]);

    await client.query("COMMIT");

    return userIds.length;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const createProviders = async (
  options: SeedOptions,
): Promise<CreatedUser[]> => {
  if (!dbPool) {
    throw new Error(REQUIRED_POOL_MESSAGE);
  }

  const passwordHash = await bcrypt.hash(options.providerPassword, 12);
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    const created: CreatedUser[] = [];

    for (const provider of PROVIDERS) {
      const email = `${provider.firstName.toLowerCase()}.${options.batchId}@${options.resetDomain}`;
      const userResult = await client.query<{ id: string }>(
        `
          INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, 'doctor', true, NOW(), NOW())
          RETURNING id
        `,
        [email, passwordHash, provider.firstName, provider.lastName],
      );

      created.push({
        id: userResult.rows[0].id,
        email,
        label: `${provider.firstName} ${provider.lastName}`,
        specialty: provider.specialty,
      });
    }

    await client.query("COMMIT");
    return created;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const createPatients = async (
  options: SeedOptions,
  providers: CreatedUser[],
): Promise<CreatedUser[]> => {
  if (!dbPool) {
    throw new Error(REQUIRED_POOL_MESSAGE);
  }

  const passwordHash = await bcrypt.hash(options.patientPassword, 12);
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    const created: CreatedUser[] = [];

    for (let index = 0; index < options.patientCount; index++) {
      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const email = `patient-${options.batchId}-${index + 1}@${options.resetDomain}`;

      const userResult = await client.query<{ id: string }>(
        `
          INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, 'patient', true, NOW(), NOW())
          RETURNING id
        `,
        [email, passwordHash, firstName, lastName],
      );

      const userId = userResult.rows[0].id;
      const year = pick(YEARS);
      const birthDate = new Date(
        Date.UTC(
          year,
          Math.floor(Math.random() * 12),
          1 + Math.floor(Math.random() * 28),
        ),
      );

      const allergies = Array.from(
        new Set(
          Array.from({ length: Math.floor(Math.random() * 3) }).map(() =>
            pick(ALLERGY_LIBRARY),
          ),
        ),
      ).filter(Boolean);

      const emergencyContact = {
        name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        relationship: pick(["Parent", "Sibling", "Partner", "Friend"]),
        phone: `+1-555-${Math.floor(Math.random() * 9000 + 1000)}`,
      };

      const insuranceInfo = {
        provider: pick(["Acme Health", "NovaCare", "Aurora Mutual"]),
        memberId: `TC-${options.batchId}-${index + 1}`,
        plan: pick(["PPO", "HMO", "POS"]),
      };

      await client.query(
        `
          INSERT INTO patients (id, user_id, date_of_birth, gender, blood_type, allergies, emergency_contacts, insurance_info, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, NOW(), NOW())
        `,
        [
          userId,
          formatDate(birthDate),
          pick([...GENDERS]),
          pick(BLOOD_TYPES),
          allergies,
          JSON.stringify({ primary: emergencyContact }),
          JSON.stringify(insuranceInfo),
        ],
      );

      created.push({ id: userId, email, label: `${firstName} ${lastName}` });
    }

    await client.query("COMMIT");
    return created;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const seedAppointmentsAndVitals = async (
  patients: CreatedUser[],
  providers: CreatedUser[],
) => {
  if (!dbPool) {
    throw new Error(REQUIRED_POOL_MESSAGE);
  }

  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    for (const patient of patients) {
      const provider = pick(providers);
      const providerDisplay = provider.label || provider.email;
      const providerSpecialty = provider.specialty || "Care Team";
      const baseDate = addDays(new Date(), -Math.floor(Math.random() * 90));

      await client.query(
        `
          INSERT INTO appointments (id, patient_id, provider_id, date_time, duration, type, status, notes, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, 30, 'consultation', 'completed', $4, NOW(), NOW())
        `,
        [
          patient.id,
          provider.id,
          addDays(baseDate, -7).toISOString(),
          `Routine follow-up with ${providerDisplay} (${providerSpecialty})`,
        ],
      );

      await client.query(
        `
          INSERT INTO appointments (id, patient_id, provider_id, date_time, duration, type, status, notes, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, 30, 'consultation', 'scheduled', $4, NOW(), NOW())
        `,
        [
          patient.id,
          provider.id,
          addDays(baseDate, 14).toISOString(),
          "Telehealth check-in",
        ],
      );

      const medication = pick(MEDICATIONS);
      await client.query(
        `
          INSERT INTO medications (id, user_id, name, dosage, frequency, start_date, end_date, prescribed_by, instructions, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NULL, $6, $7, NOW(), NOW())
        `,
        [
          patient.id,
          medication.name,
          medication.dosage,
          medication.frequency,
          formatDate(addDays(baseDate, -30)),
          providerDisplay,
          `Take ${medication.name} as directed and log any side effects in the portal. Prescribed by ${providerDisplay}.`,
        ],
      );

      await client.query(
        `
          INSERT INTO vital_signs (id, user_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, weight, height, recorded_at, source, created_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 'device', NOW())
        `,
        [
          patient.id,
          60 + Math.floor(Math.random() * 30),
          110 + Math.floor(Math.random() * 20),
          70 + Math.floor(Math.random() * 15),
          97.0 + Math.random(),
          94 + Math.floor(Math.random() * 6),
          60 + Math.random() * 40,
          1.5 + Math.random() * 0.5,
          addDays(baseDate, -1).toISOString(),
        ],
      );

      await client.query(
        `
          INSERT INTO health_insights (id, user_id, type, title, message, severity, is_dismissed, data, created_at)
          VALUES (gen_random_uuid(), $1, 'risk', $2, $3, 'info', false, $4::jsonb, NOW())
        `,
        [
          patient.id,
          `${pick(CONDITIONS)} monitoring`,
          "Review wearable trends and confirm medication adherence.",
          JSON.stringify({
            source: "seed-fixtures",
            insightGeneratedAt: new Date().toISOString(),
          }),
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const main = async () => {
  const options = createOptions();

  if (!dbPool) {
    throw new Error(REQUIRED_POOL_MESSAGE);
  }

  const resetRequested = process.env.TEST_DATA_RESET === "true";

  if (resetRequested) {
    const removed = await resetPreviousSeedData(options.resetDomain);
    console.log(
      `🧹 Removed ${removed} previously seeded user(s) for @${options.resetDomain}.`,
    );
  }

  const providers = await createProviders(options);
  const patients = await createPatients(options, providers);
  await seedAppointmentsAndVitals(patients, providers);

  console.log("✅ Synthetic QA dataset generated successfully.");
  console.log(
    `➡️  Created ${providers.length} providers and ${patients.length} patients using batch ${options.batchId}.`,
  );
  console.log(
    "ℹ️  Use TEST_DATA_RESET=true to remove accounts with the configured email domain before reseeding.",
  );
};

main()
  .catch((error) => {
    console.error(
      "❌ Failed to seed QA dataset:",
      error instanceof Error ? error.stack : error,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await dbPool?.end();
  });
