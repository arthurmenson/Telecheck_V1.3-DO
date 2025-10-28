import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString:
    "postgresql://doadmin:AVNS_n0t8AkJ6dOrPVyh2Lnd@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

async function check() {
  try {
    // Check tables
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log("📋 Tables:", tables.rows.map((r) => r.table_name).join(", "));

    // Check enums
    const enums = await pool.query(`
      SELECT typname FROM pg_type
      WHERE typcategory = 'E'
      ORDER BY typname
    `);
    console.log("\n🔤 Enums:", enums.rows.map((r) => r.typname).join(", "));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

check();
