/**
 * Database Migration Script
 *
 * This script runs Prisma migrations to set up or update the database schema.
 * Run this before starting the application for the first time or after schema changes.
 *
 * Usage:
 *   npm run migrate         - Run in development (creates migration if needed)
 *   npm run migrate:deploy  - Run in production (applies existing migrations)
 *   npm run migrate:reset   - Reset database and reapply all migrations
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runMigrations() {
  const env = process.env.NODE_ENV || "development";
  console.log(`🚀 Running database migrations for ${env} environment...`);

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    console.error("Please configure DATABASE_URL in your .env file");
    process.exit(1);
  }

  try {
    let command: string;

    if (env === "production") {
      // In production, use migrate deploy (doesn't create new migrations)
      command = "npx prisma migrate deploy";
      console.log("📦 Deploying existing migrations to production database...");
    } else {
      // In development, use migrate dev (can create new migrations)
      command = "npx prisma migrate dev";
      console.log("🔧 Running migrations in development mode...");
    }

    const { stdout, stderr } = await execAsync(command);

    if (stdout) {
      console.log(stdout);
    }

    if (stderr && !stderr.includes("warning")) {
      console.warn("⚠️  Migration warnings:", stderr);
    }

    console.log("✅ Database migrations completed successfully");

    // Generate Prisma Client
    console.log("🔄 Generating Prisma Client...");
    const { stdout: genStdout } = await execAsync("npx prisma generate");
    if (genStdout) {
      console.log(genStdout);
    }

    console.log("✅ Prisma Client generated successfully");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    if (error.stdout) {
      console.error("STDOUT:", error.stdout);
    }
    if (error.stderr) {
      console.error("STDERR:", error.stderr);
    }
    process.exit(1);
  }
}

// Handle script arguments
const args = process.argv.slice(2);

if (args.includes("--reset")) {
  console.log(
    "⚠️  WARNING: This will reset your database and delete all data!",
  );
  console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...");

  setTimeout(async () => {
    try {
      console.log("🔄 Resetting database...");
      const { stdout } = await execAsync("npx prisma migrate reset --force");
      console.log(stdout);
      console.log("✅ Database reset completed");
    } catch (error: any) {
      console.error("❌ Database reset failed:", error.message);
      process.exit(1);
    }
  }, 5000);
} else {
  runMigrations();
}
