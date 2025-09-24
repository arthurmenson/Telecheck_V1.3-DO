import { Pool } from "pg";
import { createClient, RedisClientType } from "redis";
import fs from "fs";
import path from "path";

// Determine if PostgreSQL is configured via environment (DATABASE_URL takes precedence)
const shouldUsePostgreSQL = !!(process.env.DATABASE_URL || process.env.DB_HOST);
let postgresAvailable = shouldUsePostgreSQL;

// PostgreSQL configuration (used when connections are enabled)
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  host:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DB_HOST || "localhost"
      : process.env.DB_HOST || "localhost",
  port: parseInt(
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DB_PORT || "5432"
      : process.env.DB_PORT || "5432",
  ),
  database:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DB_NAME || "telecheck_test"
      : process.env.DB_NAME || "telecheck",
  user:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DB_USER || "postgres"
      : process.env.DB_USER || "postgres",
  password:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DB_PASSWORD || "password"
      : process.env.DB_PASSWORD || "password",
  max: parseInt(process.env.DB_MAX_CONNECTIONS || "50"),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
          ca: process.env.DB_SSL_CA,
          cert: process.env.DB_SSL_CERT,
          key: process.env.DB_SSL_KEY,
        }
      : false,
};

// Redis configuration
const redisConfig = {
  url:
    process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || "6379"}`,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  tls:
    process.env.NODE_ENV === "production" && process.env.REDIS_SSL === "true"
      ? {}
      : undefined,
};

// Lazily created database pool (null when DB features are disabled)
export let dbPool: Pool | null = shouldUsePostgreSQL
  ? new Pool(dbConfig)
  : null;

// Redis client is optional
export let redisClient: RedisClientType | null = null;
try {
  if (
    process.env.REDIS_URL ||
    process.env.REDIS_HOST ||
    process.env.NODE_ENV === "production"
  ) {
    redisClient = createClient(redisConfig);
  }
} catch (error) {
  console.log("Redis not available, continuing without cache");
}

const logPostgresNotConfigured = () => {
  console.warn(
    "PostgreSQL not configured. Continuing with database features disabled.",
  );
};

const logPostgresDisabled = (reason: string) => {
  console.warn(
    `PostgreSQL disabled for this process (${reason}). Features that depend on the database are unavailable.`,
  );
};

const canRunDegraded = () =>
  process.env.ALLOW_DB_FAILURE === "true" ||
  process.env.NODE_ENV === "production";

// Initialize database schema
const initializeSchema = async (pool: Pool) => {
  try {
    console.log("Initializing database schema...");

    // Check if all required tables exist
    const requiredTables = ["users", "patient_schedules", "messaging_config"];
    let schemaExists = true;

    for (const table of requiredTables) {
      try {
        await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ Table ${table} exists`);
      } catch (error: any) {
        if (error.code === "42P01") {
          console.log(`❌ Table ${table} does not exist`);
          schemaExists = false;
        } else {
          // Some other error, re-throw
          throw error;
        }
      }
    }

    if (schemaExists) {
      console.log("Database schema already exists, skipping initialization");
      return;
    } else {
      console.log("Database schema incomplete, proceeding with initialization");
    }

    // Read and execute init.sql
    const initSqlPath = path.join(process.cwd(), "server/config/init.sql");
    if (fs.existsSync(initSqlPath)) {
      console.log("Executing init.sql...");
      const initSql = fs.readFileSync(initSqlPath, "utf8");
      await pool.query(initSql);
      console.log("✅ init.sql executed successfully");
    } else {
      console.log("⚠️ init.sql not found at:", initSqlPath);
    }

    // Read and execute messaging-tables.sql
    const messagingSqlPath = path.join(
      process.cwd(),
      "server/config/messaging-tables.sql",
    );
    if (fs.existsSync(messagingSqlPath)) {
      console.log("Executing messaging-tables.sql...");
      const messagingSql = fs.readFileSync(messagingSqlPath, "utf8");
      await pool.query(messagingSql);
      console.log("✅ messaging-tables.sql executed successfully");
    } else {
      console.log("⚠️ messaging-tables.sql not found at:", messagingSqlPath);
    }

    console.log("Database schema initialized successfully");
  } catch (error) {
    console.error("Error initializing database schema:", error);
    throw error;
  }
};

// Initialize connections
export const initializeDatabase = async () => {
  if (!shouldUsePostgreSQL) {
    if (process.env.NODE_ENV === "production") {
      logPostgresNotConfigured();
    }
    postgresAvailable = false;
  }

  if (shouldUsePostgreSQL && !dbPool) {
    dbPool = new Pool(dbConfig);
  }

  if (dbPool) {
    try {
      await dbPool.query("SELECT NOW()");
      postgresAvailable = true;
      console.log("PostgreSQL connected successfully");

      const connectionInfo = dbPool.options;
      console.log("Database connection info:", {
        host: connectionInfo.host,
        port: connectionInfo.port,
        database: connectionInfo.database,
        user: connectionInfo.user,
        ssl: !!connectionInfo.ssl,
        maxConnections: connectionInfo.max,
      });

      // Initialize database schema
      await initializeSchema(dbPool);
    } catch (error) {
      postgresAvailable = false;
      console.error("Database connection failed:", error);

      try {
        await dbPool.end();
      } catch (shutdownError) {
        console.warn(
          "Failed to close database pool after startup failure:",
          shutdownError,
        );
      }

      dbPool = null;

      if (!canRunDegraded()) {
        throw error;
      }

      logPostgresDisabled("startup failure");
    }
  }

  if (redisClient) {
    try {
      await redisClient.connect();
      console.log("Redis connected successfully");
    } catch (error) {
      console.log(
        "Redis connection failed, continuing without cache:",
        (error as Error).message,
      );
      redisClient = null;
    }
  }
};

// Graceful shutdown
export const closeDatabase = async () => {
  try {
    if (dbPool) {
      await dbPool.end();
      dbPool = null;
    }
    if (redisClient) {
      await redisClient.quit();
    }
    console.log("Database connections closed");
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
};

// Health check
export const healthCheck = async () => {
  try {
    if (postgresAvailable && dbPool) {
      await dbPool.query("SELECT 1");

      const redisStatus = redisClient
        ? await redisClient
            .ping()
            .then(() => "connected")
            .catch(() => "disconnected")
        : "not_configured";

      return {
        status: "healthy",
        database: "postgresql",
        redis: redisStatus,
        timestamp: new Date().toISOString(),
      };
    }

    const redisStatus = redisClient ? "not_connected" : "not_configured";

    return {
      status: shouldUsePostgreSQL ? "degraded" : "not_configured",
      database: shouldUsePostgreSQL ? "unavailable" : "not_configured",
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Query helper for PostgreSQL
export const query = async (text: string, params: any[] = []): Promise<any> => {
  if (postgresAvailable && dbPool) {
    const result = await dbPool.query(text, params);
    return result.rows;
  }

  throw new Error("PostgreSQL is not available");
};

// Export database type info
export const getDatabaseInfo = () => ({
  type: "PostgreSQL",
  hasRedis: !!redisClient,
  isProduction: process.env.NODE_ENV === "production",
  connectionString: process.env.DATABASE_URL
    ? "[REDACTED]"
    : `${process.env.DB_HOST}:${process.env.DB_PORT}`,
  available: postgresAvailable,
});
