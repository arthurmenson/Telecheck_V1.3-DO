#!/usr/bin/env tsx
/**
 * Production Database Migration Script
 *
 * This script runs all database migrations against the production database.
 * It can be executed from the DigitalOcean App Platform console or locally.
 *
 * Usage:
 *   npm run migrate:prod
 *   OR
 *   tsx scripts/migrate-db.ts
 */

import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const DATABASE_URL = process.env.DATABASE_URL;

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(level: string, message: string, color: string = colors.reset) {
  const timestamp = new Date().toISOString();
  console.log(`${color}[${level}] ${timestamp} - ${message}${colors.reset}`);
}

function logInfo(message: string) {
  log("INFO", message, colors.blue);
}

function logSuccess(message: string) {
  log("SUCCESS", message, colors.green);
}

function logWarning(message: string) {
  log("WARNING", message, colors.yellow);
}

function logError(message: string) {
  log("ERROR", message, colors.red);
}

async function runMigrations() {
  console.log("=".repeat(70));
  console.log("  Telecheck V2.0 - Production Database Migration");
  console.log("=".repeat(70));
  console.log("");

  // Check DATABASE_URL
  if (!DATABASE_URL) {
    logError("DATABASE_URL environment variable not set");
    logError(
      "Please set DATABASE_URL or run this from the DigitalOcean App console",
    );
    process.exit(1);
  }

  logInfo("Database URL found (connection string redacted)");

  // Create database pool
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for DigitalOcean managed databases
    },
  });

  try {
    // Test connection
    logInfo("Testing database connection...");
    await pool.query("SELECT NOW()");
    logSuccess("Database connection successful");
    console.log("");

    // Get database info
    const dbInfo = await pool.query(`
      SELECT current_database() as database,
             current_user as user,
             inet_server_addr() as host,
             inet_server_port() as port
    `);
    logInfo(`Connected to database: ${dbInfo.rows[0].database}`);
    logInfo(`User: ${dbInfo.rows[0].user}`);
    console.log("");

    // Run migrations
    console.log("=".repeat(70));
    console.log("  Running Database Migrations");
    console.log("=".repeat(70));
    console.log("");

    let migrationsRun = 0;
    let migrationsFailed = 0;

    // Migration 1: Core schema
    try {
      logInfo("Running migration: Core schema (users, patients, appointments)");
      const initSql = readFileSync(
        join(process.cwd(), "server/config/init.sql"),
        "utf-8",
      );
      await pool.query(initSql);
      logSuccess("Core schema migration completed");
      migrationsRun++;
    } catch (error) {
      logError(`Core schema migration failed: ${(error as Error).message}`);
      migrationsFailed++;
    }

    console.log("");

    // Migration 2: Messaging schema
    try {
      logInfo(
        "Running migration: Messaging schema (schedules, communications)",
      );
      const messagingSql = readFileSync(
        join(process.cwd(), "server/config/messaging-tables.sql"),
        "utf-8",
      );
      await pool.query(messagingSql);
      logSuccess("Messaging schema migration completed");
      migrationsRun++;
    } catch (error) {
      logError(
        `Messaging schema migration failed: ${(error as Error).message}`,
      );
      migrationsFailed++;
    }

    console.log("");

    // Verify migrations
    console.log("=".repeat(70));
    console.log("  Verifying Database Schema");
    console.log("=".repeat(70));
    console.log("");

    logInfo("Checking created tables...");

    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    logSuccess(`Found ${tablesResult.rows.length} tables in database`);
    console.log("");

    logInfo("Tables created:");
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    console.log("");

    // Check for admin user
    const adminResult = await pool.query(`
      SELECT email, first_name, last_name, role
      FROM users
      WHERE email = 'admin@telecheck.com'
      LIMIT 1
    `);

    if (adminResult.rows.length > 0) {
      logSuccess("Default admin user created");
      console.log("  Email: admin@telecheck.com");
      console.log("  Password: admin123");
      console.log(
        `  ${colors.yellow}⚠️  Please change this password after first login!${colors.reset}`,
      );
    } else {
      logWarning("Default admin user not found");
    }

    console.log("");

    // Migration summary
    console.log("=".repeat(70));
    console.log("  Migration Summary");
    console.log("=".repeat(70));
    console.log(`  Migrations Run: ${migrationsRun}`);
    console.log(`  Migrations Failed: ${migrationsFailed}`);
    console.log(`  Total Tables: ${tablesResult.rows.length}`);
    console.log("=".repeat(70));

    if (migrationsFailed === 0) {
      logSuccess("All migrations completed successfully!");
      console.log("");
      await pool.end();
      process.exit(0);
    } else {
      logError("Some migrations failed. Please review the output above.");
      console.log("");
      await pool.end();
      process.exit(1);
    }
  } catch (error) {
    logError(`Migration process failed: ${(error as Error).message}`);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

// Run migrations
runMigrations();
