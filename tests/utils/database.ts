import { Pool } from "pg";
import { createTables, dropTables } from "./schema";

let testPool: Pool;

export const setupTestDatabase = async () => {
  // Create a separate test pool
  testPool = new Pool({
    host: process.env.TEST_DB_HOST || "localhost",
    port: parseInt(process.env.TEST_DB_PORT || "5432"),
    database: process.env.TEST_DB_NAME || "telecheck_test",
    user: process.env.TEST_DB_USER || "postgres",
    password: process.env.TEST_DB_PASSWORD || "password",
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Test the connection
  try {
    await testPool.query("SELECT NOW()");
    console.log("✅ Test database connected successfully");
  } catch (error) {
    console.error("❌ Test database connection failed:", error);
    throw error;
  }

  // Create tables
  await createTables(testPool);
};

export const teardownTestDatabase = async () => {
  if (testPool) {
    await dropTables(testPool);
    await testPool.end();
  }
};

export const clearTestData = async () => {
  if (testPool) {
    const tables = [
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
  }
};

export const getTestPool = () => testPool;
