import { Pool } from "pg";
import { createTables, dropTables } from "./schema";

let testPool: Pool | null = null;

const closePoolSilently = async (pool: Pool | null) => {
  if (!pool) return;

  try {
    await pool.end();
  } catch (error) {
    console.warn(
      "⚠️ Failed to close test database pool after connection issue:",
      (error as Error).message,
    );
  }
};

export const setupTestDatabase = async () => {
  const pool = new Pool({
    host: process.env.TEST_DB_HOST || "localhost",
    port: parseInt(process.env.TEST_DB_PORT || "5432"),
    database: process.env.TEST_DB_NAME || "telecheck_test",
    user: process.env.TEST_DB_USER || "postgres",
    password: process.env.TEST_DB_PASSWORD || "password",
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Test database connected successfully");
    await createTables(pool);
    testPool = pool;
  } catch (error) {
    console.error("❌ Test database connection failed:", error);
    testPool = null;
    await closePoolSilently(pool);
    throw error;
  }
};

export const teardownTestDatabase = async () => {
  if (!testPool) {
    return;
  }

  try {
    await dropTables(testPool);
  } finally {
    await closePoolSilently(testPool);
    testPool = null;
  }
};

export const clearTestData = async () => {
  if (!testPool) {
    return;
  }

  const tables = [
    "audit_logs",
    "users",
    "patients",
    "lab_reports",
    "lab_results",
    "medications",
    "appointments",
    "vital_signs",
    "notifications",
  ];

  for (const table of tables) {
    await testPool.query(`DELETE FROM ${table}`);
  }
};

export const getTestPool = () => testPool;
export const isTestDatabaseAvailable = () => testPool !== null;
