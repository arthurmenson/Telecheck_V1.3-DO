import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString:
    "postgresql://doadmin:AVNS_n0t8AkJ6dOrPVyh2Lnd@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

async function check() {
  const result = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'id'
  `);
  console.log("users.id type:", result.rows[0]?.data_type);
  await pool.end();
}

check();
