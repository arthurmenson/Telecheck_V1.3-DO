import { Pool } from "pg";
import { createTables, dropTables } from "./schema";
import { dbPool } from "../../server/config/database";

let testPool: Pool;

export const setupTestDatabase = async () => {
  // Use the same pool configuration as the server
  testPool = dbPool;

  // Create tables
  await createTables(testPool);
};

export const teardownTestDatabase = async () => {
  if (testPool) {
    await dropTables(testPool);
    // Don't end the pool since it's shared with the server
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
