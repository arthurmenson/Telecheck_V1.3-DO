#!/usr/bin/env node

/**
 * Migration script to transfer data from SQLite to PostgreSQL
 * Usage: node scripts/migrate-to-postgres.js
 */

const sqlite3 = require("sqlite3").verbose();
const { Client } = require("pg");
const path = require("path");
const fs = require("fs");

// Configuration
const SQLITE_DB_PATH = path.join(process.cwd(), "telecheck.db");
const POSTGRES_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

class DatabaseMigrator {
  constructor() {
    this.sqliteDb = null;
    this.pgClient = null;
    this.migratedTables = new Set();
    this.errors = [];
  }

  async initialize() {
    console.log("🚀 Starting database migration...");

    // Check if SQLite database exists
    if (!fs.existsSync(SQLITE_DB_PATH)) {
      throw new Error(`SQLite database not found at ${SQLITE_DB_PATH}`);
    }

    // Initialize SQLite connection
    this.sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);
    console.log("✅ Connected to SQLite database");

    // Initialize PostgreSQL connection
    this.pgClient = new Client(POSTGRES_CONFIG);
    await this.pgClient.connect();
    console.log("✅ Connected to PostgreSQL database");

    // Test PostgreSQL connection
    const result = await this.pgClient.query("SELECT NOW()");
    console.log("📅 PostgreSQL server time:", result.rows[0].now);
  }

  async migrateTable(tableName, mapping = {}) {
    try {
      console.log(`\n📊 Migrating table: ${tableName}`);

      // Get SQLite table schema
      const tableInfo = await this.getSQLiteTableInfo(tableName);
      if (!tableInfo.length) {
        console.log(`⚠️  Table ${tableName} not found in SQLite, skipping...`);
        return;
      }

      // Get all data from SQLite
      const sqliteData = await this.getSQLiteData(tableName);
      if (!sqliteData.length) {
        console.log(
          `📭 Table ${tableName} is empty, skipping data migration...`,
        );
        return;
      }

      console.log(`📦 Found ${sqliteData.length} records in ${tableName}`);

      // Convert and insert data into PostgreSQL
      let insertedCount = 0;
      let errorCount = 0;

      for (const row of sqliteData) {
        try {
          const convertedRow = this.convertRowData(row, mapping);
          await this.insertIntoPG(tableName, convertedRow);
          insertedCount++;
        } catch (error) {
          errorCount++;
          this.errors.push({
            table: tableName,
            row: row,
            error: error.message,
          });
          console.error(
            `❌ Error inserting row into ${tableName}:`,
            error.message,
          );
        }
      }

      console.log(`✅ Migrated ${insertedCount} records to ${tableName}`);
      if (errorCount > 0) {
        console.log(`⚠️  ${errorCount} records failed for ${tableName}`);
      }

      this.migratedTables.add(tableName);
    } catch (error) {
      console.error(`❌ Error migrating table ${tableName}:`, error);
      this.errors.push({
        table: tableName,
        error: error.message,
      });
    }
  }

  async getSQLiteTableInfo(tableName) {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getSQLiteData(tableName) {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  convertRowData(row, mapping) {
    const converted = { ...row };

    // Apply field mappings
    Object.entries(mapping).forEach(([oldField, newField]) => {
      if (oldField in converted) {
        converted[newField] = converted[oldField];
        if (oldField !== newField) {
          delete converted[oldField];
        }
      }
    });

    // Convert date formats
    Object.keys(converted).forEach((key) => {
      const value = converted[key];

      // Convert SQLite datetime to PostgreSQL timestamptz
      if (typeof value === "string" && this.isDateString(value)) {
        converted[key] = new Date(value).toISOString();
      }

      // Convert boolean values
      if (value === 1 || value === 0) {
        if (
          key.includes("active") ||
          key.includes("dismissed") ||
          key.includes("is_")
        ) {
          converted[key] = value === 1;
        }
      }
    });

    return converted;
  }

  isDateString(str) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}(\s|T)\d{2}:\d{2}:\d{2}/;
    return dateRegex.test(str) || str.includes("CURRENT_TIMESTAMP");
  }

  async insertIntoPG(tableName, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`);

    const query = `
      INSERT INTO ${tableName} (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      ON CONFLICT DO NOTHING
    `;

    await this.pgClient.query(query, values);
  }

  async migrateAllTables() {
    console.log("🔄 Starting full database migration...");

    // Define table migration order (respecting foreign keys)
    const migrationOrder = [
      "users",
      "audit_logs",
      "lab_results",
      "medications",
      "vital_signs",
      "chat_messages",
      "health_insights",
      "messaging_config",
      "patient_schedules",
      "scheduled_messages",
      "message_templates",
      "care_team_members",
      "communication_logs",
    ];

    // Define field mappings for tables that need them
    const fieldMappings = {
      users: {
        first_name: "first_name",
        last_name: "last_name",
      },
      vital_signs: {
        type: "type",
        value: "value",
        unit: "unit",
      },
    };

    for (const tableName of migrationOrder) {
      await this.migrateTable(tableName, fieldMappings[tableName] || {});
    }
  }

  async updateSequences() {
    console.log("\n🔢 Updating PostgreSQL sequences...");

    const sequenceQueries = [
      "SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 1))",
      "SELECT setval('messaging_config_id_seq', COALESCE((SELECT MAX(id) FROM messaging_config), 1))",
      "SELECT setval('patient_schedules_id_seq', COALESCE((SELECT MAX(id) FROM patient_schedules), 1))",
      "SELECT setval('communication_logs_id_seq', COALESCE((SELECT MAX(id) FROM communication_logs), 1))",
    ];

    for (const query of sequenceQueries) {
      try {
        await this.pgClient.query(query);
      } catch (error) {
        console.log(
          `⚠️  Sequence update failed (table may not exist): ${error.message}`,
        );
      }
    }

    console.log("✅ Sequences updated");
  }

  async validateMigration() {
    console.log("\n🔍 Validating migration...");

    for (const tableName of this.migratedTables) {
      try {
        // Count records in PostgreSQL
        const pgResult = await this.pgClient.query(
          `SELECT COUNT(*) FROM ${tableName}`,
        );
        const pgCount = parseInt(pgResult.rows[0].count);

        // Count records in SQLite
        const sqliteCount = await new Promise((resolve, reject) => {
          this.sqliteDb.get(
            `SELECT COUNT(*) as count FROM ${tableName}`,
            (err, row) => {
              if (err) reject(err);
              else resolve(row.count);
            },
          );
        });

        if (pgCount === sqliteCount) {
          console.log(`✅ ${tableName}: ${pgCount} records (match)`);
        } else {
          console.log(
            `⚠️  ${tableName}: SQLite=${sqliteCount}, PostgreSQL=${pgCount} (mismatch)`,
          );
        }
      } catch (error) {
        console.log(`❌ ${tableName}: Validation failed - ${error.message}`);
      }
    }
  }

  async cleanup() {
    console.log("\n🧹 Cleaning up connections...");

    if (this.sqliteDb) {
      this.sqliteDb.close();
      console.log("✅ SQLite connection closed");
    }

    if (this.pgClient) {
      await this.pgClient.end();
      console.log("✅ PostgreSQL connection closed");
    }
  }

  generateReport() {
    console.log("\n📊 Migration Report");
    console.log("==================");
    console.log(
      `✅ Successfully migrated tables: ${Array.from(this.migratedTables).join(", ")}`,
    );
    console.log(`❌ Total errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log("\n🔍 Error Details:");
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. Table: ${error.table}`);
        console.log(`   Error: ${error.error}`);
        if (error.row) {
          console.log(`   Row: ${JSON.stringify(error.row)}`);
        }
        console.log("");
      });
    }
  }
}

// Main migration function
async function runMigration() {
  const migrator = new DatabaseMigrator();

  try {
    await migrator.initialize();
    await migrator.migrateAllTables();
    await migrator.updateSequences();
    await migrator.validateMigration();
    migrator.generateReport();

    console.log("\n🎉 Migration completed successfully!");
    console.log(
      "💡 Remember to update your application to use PostgreSQL instead of SQLite",
    );
  } catch (error) {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  } finally {
    await migrator.cleanup();
  }
}

// CLI Interface
if (require.main === module) {
  // Check environment variables
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    console.error("❌ Missing PostgreSQL configuration!");
    console.error("Set DATABASE_URL or DB_HOST environment variable");
    console.error("Example: DATABASE_URL=postgresql://user:pass@host:port/db");
    process.exit(1);
  }

  console.log("🏥 Telecheck Healthcare - Database Migration");
  console.log("===========================================");
  console.log(`📁 SQLite Database: ${SQLITE_DB_PATH}`);
  console.log(
    `🐘 PostgreSQL: ${process.env.DATABASE_URL ? "[CONNECTION_STRING]" : `${process.env.DB_HOST}:${process.env.DB_PORT || 5432}`}`,
  );
  console.log("");

  // Confirmation prompt
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "⚠️  This will migrate all data from SQLite to PostgreSQL. Continue? (y/N): ",
    (answer) => {
      rl.close();

      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        runMigration();
      } else {
        console.log("❌ Migration cancelled");
        process.exit(0);
      }
    },
  );
}

module.exports = { DatabaseMigrator };
