/**
 * Production Database Migration Runner
 *
 * Runs the alignment migration to add missing columns to the users table
 *
 * Usage: DATABASE_URL="postgresql://..." npm run migrate:prod
 */

import { readFileSync } from "fs";
import { join } from "path";
import pkg from "pg";
const { Client } = pkg;

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set");
    console.error("");
    console.error("Usage:");
    console.error('  DATABASE_URL="postgresql://..." npm run migrate:prod');
    process.exit(1);
  }

  console.log("🔄 Connecting to production database...");
  console.log(
    `   Database: ${databaseUrl.split("@")[1]?.split("?")[0] || "hidden"}`,
  );
  console.log("");

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // Required for DigitalOcean managed databases
    },
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");
    console.log("");

    // Read migration file
    const migrationPath = join(
      process.cwd(),
      "prisma",
      "migrations",
      "20251027000000_align_users_table_with_prisma_schema",
      "migration.sql",
    );

    console.log("📄 Reading migration file...");
    console.log(`   Path: ${migrationPath}`);

    const migrationSql = readFileSync(migrationPath, "utf-8");
    console.log(`   Size: ${migrationSql.length} characters`);
    console.log("");

    // Check if users table exists
    console.log("🔍 Checking database schema...");
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error("❌ ERROR: users table does not exist in the database");
      console.error("   This migration requires an existing users table");
      console.error("   Please run init.sql first");
      process.exit(1);
    }

    console.log("   ✅ users table exists");

    // Check current column count
    const columnCheck = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.columns
      WHERE table_name = 'users';
    `);
    const columnCountBefore = parseInt(columnCheck.rows[0].count);
    console.log(`   Current columns in users table: ${columnCountBefore}`);
    console.log("");

    // Run migration
    console.log("🚀 Running migration...");
    console.log("   This may take a few moments...");
    console.log("");

    await client.query(migrationSql);

    console.log("✅ Migration executed successfully!");
    console.log("");

    // Check new column count
    const columnCheckAfter = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.columns
      WHERE table_name = 'users';
    `);
    const columnCountAfter = parseInt(columnCheckAfter.rows[0].count);
    const addedColumns = columnCountAfter - columnCountBefore;

    console.log("📊 Migration Results:");
    console.log(`   Columns before: ${columnCountBefore}`);
    console.log(`   Columns after: ${columnCountAfter}`);
    console.log(`   Columns added: ${addedColumns}`);
    console.log("");

    // List new columns
    const newColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN (
        'date_of_birth', 'gender', 'address', 'city', 'state', 'zip_code',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
        'medical_history', 'current_medications', 'allergies',
        'insurance_provider', 'insurance_policy_number', 'insurance_group_number',
        'primary_care_physician', 'email_notifications', 'sms_notifications',
        'push_notifications', 'appointment_notifications', 'lab_result_notifications',
        'message_notifications', 'reminder_notifications', 'data_sharing',
        'marketing_consent', 'third_party_sharing', 'preferred_contact_method',
        'language_preference', 'two_factor_enabled', 'two_factor_secret',
        'password', 'name'
      )
      ORDER BY column_name;
    `);

    if (newColumns.rows.length > 0) {
      console.log("✅ Verified new columns added:");
      newColumns.rows.forEach((col) => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
      console.log("");
    }

    // Check if data was migrated from patients table
    const patientsTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'patients'
      );
    `);

    if (patientsTableExists.rows[0].exists) {
      const migratedData = await client.query(`
        SELECT COUNT(*) as count
        FROM users
        WHERE date_of_birth IS NOT NULL;
      `);
      console.log("📦 Data Migration:");
      console.log(`   Users with date_of_birth: ${migratedData.rows[0].count}`);
      console.log("");
    }

    console.log("🎉 SUCCESS: Database schema aligned with Prisma schema!");
    console.log("");
    console.log("Next steps:");
    console.log("  1. Test the accounts API: POST /api/test-accounts/create");
    console.log("  2. Verify test accounts can be created");
    console.log("  3. Run end-to-end televisit journey test");
    console.log("");
  } catch (error) {
    console.error("");
    console.error("❌ ERROR: Migration failed");
    console.error("");
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("");
      if (error.stack) {
        console.error("Stack trace:");
        console.error(error.stack);
      }
    } else {
      console.error("Unknown error:", error);
    }
    console.error("");
    process.exit(1);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

// Run migration
runMigration().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
