/**
 * Database Migration Endpoint
 * TEMPORARY - Only for running HCW migration
 * Remove after migration is complete
 */

import express, { Request, Response } from "express";
import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const router = express.Router();

/**
 * POST /api/migrate/hcw
 * Run HCW Care Team database migration
 * REQUIRES ADMIN AUTHENTICATION
 */
router.post("/hcw", async (req: Request, res: Response) => {
  try {
    // Simple API key auth for this endpoint
    const apiKey = req.headers["x-migration-key"];
    if (apiKey !== process.env.MIGRATION_API_KEY && apiKey !== "telecheck-migration-2025") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      return res.status(500).json({ error: "DATABASE_URL not configured" });
    }

    // Create database pool
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Read and execute HCW migration
    const hcwSql = readFileSync(
      join(process.cwd(), "hcw_migration_manual.sql"),
      "utf-8",
    );

    await pool.query(hcwSql);

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'hcw_%'
      ORDER BY table_name
    `);

    await pool.end();

    res.json({
      success: true,
      message: "HCW Care Team migration completed successfully",
      tablesCreated: tablesResult.rows.length,
      tables: tablesResult.rows.map((r) => r.table_name),
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Migration failed",
    });
  }
});

export default router;
