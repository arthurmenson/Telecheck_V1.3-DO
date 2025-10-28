import pg from "pg";
import fs from "fs";

const { Pool } = pg;

const DATABASE_URL =
  "postgresql://doadmin:AVNS_n0t8AkJ6dOrPVyh2Lnd@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require";

async function applySchemaFix() {
  console.log("🚀 Applying HCWMessage Schema Fix...\n");

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const schemaFixSql = fs.readFileSync("hcw_message_schema_fix.sql", "utf-8");

    console.log("🔧 Applying HCWMessage schema fix...");
    await pool.query(schemaFixSql);

    console.log("✅ Schema fix applied successfully!\n");

    // Verify the changes
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'hcw_messages'
      ORDER BY ordinal_position;
    `);

    console.log("📋 HCWMessage table columns:");
    result.rows.forEach((row) => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    console.log(
      "\n✅ HCWMessage schema now supports patient-caregiver messaging!",
    );
  } catch (error) {
    console.error("❌ Schema fix failed:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

applySchemaFix();
