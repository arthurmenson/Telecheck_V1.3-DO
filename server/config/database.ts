import { Pool } from 'pg';
import { createClient } from 'redis';

// PostgreSQL is required in production, optional in development
const usePostgreSQL = !!(process.env.DATABASE_URL || process.env.DB_HOST);

// Enforce PostgreSQL in production
if (process.env.NODE_ENV === 'production' && !usePostgreSQL) {
  throw new Error('PostgreSQL is required in production. Set DATABASE_URL or DB_HOST environment variable.');
}

// Database configuration for PostgreSQL
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.NODE_ENV === 'test' ? (process.env.TEST_DB_HOST || 'localhost') : (process.env.DB_HOST || 'localhost'),
  port: parseInt(process.env.NODE_ENV === 'test' ? (process.env.TEST_DB_PORT || '5432') : (process.env.DB_PORT || '5432')),
  database: process.env.NODE_ENV === 'test' ? (process.env.TEST_DB_NAME || 'telecheck_test') : (process.env.DB_NAME || 'telecheck'),
  user: process.env.NODE_ENV === 'test' ? (process.env.TEST_DB_USER || 'postgres') : (process.env.DB_USER || 'postgres'),
  password: process.env.NODE_ENV === 'test' ? (process.env.TEST_DB_PASSWORD || 'password') : (process.env.DB_PASSWORD || 'password'),
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '50'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
    ca: process.env.DB_SSL_CA,
    cert: process.env.DB_SSL_CERT,
    key: process.env.DB_SSL_KEY
  } : false
};

// Redis configuration
const redisConfig = {
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  tls: process.env.NODE_ENV === 'production' && process.env.REDIS_SSL === 'true' ? {} : undefined
};

// Create database pool
export const dbPool = usePostgreSQL ? new Pool(dbConfig) : null;

// Create Redis client
let redisClient: any = null;
try {
  if (process.env.REDIS_URL || process.env.REDIS_HOST || process.env.NODE_ENV === 'production') {
    redisClient = createClient(redisConfig);
  }
} catch (error) {
  console.log('ℹ️  Redis not available, continuing without cache');
}

export { redisClient };

// Initialize connections
export const initializeDatabase = async () => {
  try {
    if (usePostgreSQL && dbPool) {
      // Test PostgreSQL connection
      await dbPool.query('SELECT NOW()');
      console.log('✅ PostgreSQL connected successfully');
      
      // Log connection info (without sensitive data)
      const connectionInfo = dbPool.options;
      console.log('📊 Database connection info:', {
        host: connectionInfo.host,
        port: connectionInfo.port,
        database: connectionInfo.database,
        user: connectionInfo.user,
        ssl: !!connectionInfo.ssl,
        maxConnections: connectionInfo.max
      });
    } else {
      throw new Error('PostgreSQL is required. Please set database environment variables.');
    }
    
    // Connect to Redis if available
    if (redisClient) {
      try {
        await redisClient.connect();
        console.log('✅ Redis connected successfully');
      } catch (error) {
        console.log('⚠️  Redis connection failed, continuing without cache:', error.message);
        redisClient = null;
      }
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
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
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

// Health check
export const healthCheck = async () => {
  try {
    if (usePostgreSQL && dbPool) {
      await dbPool.query('SELECT 1');
    } else {
      throw new Error('PostgreSQL not configured');
    }
    
    const redisStatus = redisClient ? 
      await redisClient.ping().then(() => 'connected').catch(() => 'disconnected') : 
      'not_configured';
    
    return { 
      status: 'healthy', 
      database: 'postgresql', 
      redis: redisStatus,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
};

// Query helper for PostgreSQL
export const query = async (text: string, params: any[] = []): Promise<any> => {
  if (usePostgreSQL && dbPool) {
    const result = await dbPool.query(text, params);
    return result.rows;
  } else {
    throw new Error('PostgreSQL not configured');
  }
};

// Export database type info
export const getDatabaseInfo = () => ({
  type: 'PostgreSQL',
  hasRedis: !!redisClient,
  isProduction: process.env.NODE_ENV === 'production',
  connectionString: process.env.DATABASE_URL ? '[REDACTED]' : `${process.env.DB_HOST}:${process.env.DB_PORT}`
});
