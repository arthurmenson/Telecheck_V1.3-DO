/**
 * Run HCW Migration Directly
 */

import pg from "pg";
import fs from "fs";

const { Pool } = pg;

const DATABASE_URL =
  "postgresql://doadmin:AVNS_n0t8AkJ6dOrPVyh2Lnd@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require";

async function runMigration() {
  console.log("🚀 Running HCW Care Team Database Migration...\n");

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Read migration SQL (UUID-compatible version)
    const sql = fs.readFileSync("hcw_migration_uuid.sql", "utf-8");
    const schemaFixSql = fs.readFileSync("hcw_message_schema_fix.sql", "utf-8");

    console.log("📝 Executing migration SQL...");
    await pool.query(sql);

    console.log("🔧 Applying HCWMessage schema fix...");
    await pool.query(schemaFixSql);

    console.log("✅ Migration SQL executed successfully!\n");

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'hcw_%'
      ORDER BY table_name
    `);

    console.log(`✅ Created ${result.rows.length} HCW tables:\n`);
    result.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log("\n🎉 Migration completed successfully!");
    console.log(
      "\n📱 Now visit: https://whale-app-bs3xa.ondigitalocean.app/care-team",
    );
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (error.detail) console.error("Details:", error.detail);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
