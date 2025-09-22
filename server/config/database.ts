import { Pool } from "pg";
import { createClient } from "redis";

import { resolveSecretSync, type SecretReferenceInput } from "./secretManager";
import { logger } from "../utils/logger";

const dbLogger = logger.child({ component: "database" });

const nodeEnv = process.env.NODE_ENV || "development";
const isTestEnv = nodeEnv === "test";

const parseSecretReference = (
  raw: string | undefined,
): SecretReferenceInput | undefined => {
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed) as SecretReferenceInput;
    } catch (error) {
      dbLogger.warn("database.secret.parse_failed", {
        message: (error as Error).message,
      });
      return trimmed;
    }
  }

  return trimmed;
};

const resolveManagedSecret = ({
  reference,
  fallback,
  description,
  required,
}: {
  reference?: SecretReferenceInput;
  fallback?: string;
  description: string;
  required?: boolean;
}) => {
  if (!reference) {
    return fallback;
  }

  return resolveSecretSync({
    reference,
    fallback,
    description,
    required,
  });
};

// PostgreSQL is required in production, optional in development
const databaseUrlReference = parseSecretReference(
  process.env.DATABASE_URL_SECRET_REF || process.env.DATABASE_URL_REF,
);

const resolvedDatabaseUrl = !isTestEnv
  ? resolveManagedSecret({
      reference: databaseUrlReference,
      fallback: process.env.DATABASE_URL,
      description: "PostgreSQL connection string",
    })
  : process.env.DATABASE_URL;

const usePostgreSQL = !!(resolvedDatabaseUrl || process.env.DB_HOST);

// Enforce PostgreSQL in production
if (process.env.NODE_ENV === "production" && !usePostgreSQL) {
  throw new Error(
    "PostgreSQL is required in production. Set DATABASE_URL or DB_HOST environment variable.",
  );
}

// Database configuration for PostgreSQL
const dbConfig = {
  connectionString: resolvedDatabaseUrl,
  host: isTestEnv
    ? process.env.TEST_DB_HOST || "localhost"
    : process.env.DB_HOST || "localhost",
  port: parseInt(
    isTestEnv
      ? process.env.TEST_DB_PORT || "5432"
      : process.env.DB_PORT || "5432",
  ),
  database: isTestEnv
    ? process.env.TEST_DB_NAME || "telecheck_test"
    : process.env.DB_NAME || "telecheck",
  user: isTestEnv
    ? process.env.TEST_DB_USER || "postgres"
    : process.env.DB_USER || "postgres",
  password: (() => {
    if (isTestEnv) {
      return process.env.TEST_DB_PASSWORD || "password";
    }

    const reference = parseSecretReference(
      process.env.DB_PASSWORD_SECRET_REF || process.env.DB_PASSWORD_REF,
    );
    const fallback = process.env.DB_PASSWORD || undefined;

    return resolveManagedSecret({
      reference,
      fallback,
      description: "database password",
      required: nodeEnv === "production" && !resolvedDatabaseUrl,
    });
  })(),
  max: parseInt(process.env.DB_MAX_CONNECTIONS || "50"),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl:
    nodeEnv === "production"
      ? {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
          ca: resolveManagedSecret({
            reference: parseSecretReference(process.env.DB_SSL_CA_SECRET_REF),
            fallback: process.env.DB_SSL_CA,
            description: "database SSL CA",
          }),
          cert: resolveManagedSecret({
            reference: parseSecretReference(process.env.DB_SSL_CERT_SECRET_REF),
            fallback: process.env.DB_SSL_CERT,
            description: "database SSL certificate",
          }),
          key: resolveManagedSecret({
            reference: parseSecretReference(process.env.DB_SSL_KEY_SECRET_REF),
            fallback: process.env.DB_SSL_KEY,
            description: "database SSL private key",
          }),
        }
      : false,
};

// Redis configuration
const redisConfig = {
  url:
    process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || "6379"}`,
  password: !isTestEnv
    ? resolveManagedSecret({
        reference: parseSecretReference(
          process.env.REDIS_PASSWORD_SECRET_REF ||
            process.env.REDIS_PASSWORD_REF,
        ),
        fallback: process.env.REDIS_PASSWORD,
        description: "Redis password",
      })
    : process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  tls:
    nodeEnv === "production" && process.env.REDIS_SSL === "true"
      ? {}
      : undefined,
};

// Create database pool
export const dbPool = usePostgreSQL ? new Pool(dbConfig) : null;

// Create Redis client
let redisClient: any = null;
try {
  if (
    process.env.REDIS_URL ||
    process.env.REDIS_HOST ||
    process.env.NODE_ENV === "production"
  ) {
    redisClient = createClient(redisConfig);
  }
} catch (error) {
  dbLogger.warn("redis.client.initialization_failed", {
    message: (error as Error).message,
  });
}

export { redisClient };

// Initialize connections
export const initializeDatabase = async () => {
  try {
    if (usePostgreSQL && dbPool) {
      // Test PostgreSQL connection
      await dbPool.query("SELECT NOW()");
      dbLogger.info("database.connection.success", {
        engine: "postgresql",
      });

      // Log connection info (without sensitive data)
      const connectionInfo = dbPool.options;
      dbLogger.debug("database.connection.details", {
        host: connectionInfo.host,
        port: connectionInfo.port,
        database: connectionInfo.database,
        user: connectionInfo.user,
        ssl: !!connectionInfo.ssl,
        maxConnections: connectionInfo.max,
      });
    } else if (!isTestEnv) {
      throw new Error(
        "PostgreSQL is required. Please set database environment variables.",
      );
    } else {
      dbLogger.info("database.connection.skipped", {
        reason: "test_environment_without_database",
      });
    }

    // Connect to Redis if available
    if (redisClient) {
      try {
        await redisClient.connect();
        dbLogger.info("redis.connection.success", {
          url: redisConfig.url,
        });
      } catch (error) {
        dbLogger.warn("redis.connection.failed", {
          message: (error as Error).message,
        });
        redisClient = null;
      }
    }
  } catch (error) {
    dbLogger.error("database.connection.failed", {
      message: (error as Error).message,
    });
    throw error;
  }
};

// Graceful shutdown
export const closeDatabase = async () => {
  try {
    if (dbPool) {
      await dbPool.end();
    }
    if (redisClient) {
      await redisClient.quit();
    }
    dbLogger.info("database.connections.closed");
  } catch (error) {
    dbLogger.error("database.connections.close_failed", {
      message: (error as Error).message,
    });
  }
};

// Health check
export const healthCheck = async () => {
  try {
    if (usePostgreSQL && dbPool) {
      await dbPool.query("SELECT 1");
    } else {
      throw new Error("PostgreSQL not configured");
    }

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
  } catch (error) {
    dbLogger.error("database.health_check.failed", {
      message: (error as Error).message,
    });
    return {
      status: "unhealthy",
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Query helper for PostgreSQL
export const query = async (text: string, params: any[] = []): Promise<any> => {
  if (usePostgreSQL && dbPool) {
    const result = await dbPool.query(text, params);
    return result.rows;
  } else {
    throw new Error("PostgreSQL not configured");
  }
};

// Export database type info
export const getDatabaseInfo = () => ({
  type: "PostgreSQL",
  hasRedis: !!redisClient,
  isProduction: process.env.NODE_ENV === "production",
  connectionString: process.env.DATABASE_URL
    ? "[REDACTED]"
    : `${process.env.DB_HOST}:${process.env.DB_PORT}`,
});
