/**
 * RPM Service - Remote Patient Monitoring
 * 
 * Features:
 * - Vital signs tracking and trends
 * - Real-time alerts and threshold monitoring
 * - Patient health analytics
 * - Wearable device integration
 * - Alert notification system
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
let PrismaClientRef: any;
try {
  // Lazy require to avoid prisma generate requirement during unit tests
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClientRef = require('@prisma/client').PrismaClient;
} catch {
  PrismaClientRef = undefined;
}
import pino from 'pino';
import { z } from 'zod';
import { vitalsRoutes } from './routes/vitals';
import { rpmRoutes } from './routes/rpm';
import { alertsRoutes } from './routes/alerts';
import { thresholdsRoutes } from './routes/thresholds';
import { trackAuditEvent } from './utils/audit';
import { redactPII } from './utils/redaction';

// Environment configuration
const config = {
  port: parseInt(process.env.PORT || '3003'),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/telecheck_rpm',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
};

// Logger with PII redaction
const logger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  redact: {
    paths: ['req.headers.authorization', 'password', 'ssn', 'email'],
    censor: '[REDACTED]'
  },
  serializers: {
    req: (req) => redactPII(req),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.headers
    })
  }
});

// Create Fastify instance
const server: FastifyInstance = Fastify({
  logger,
  trustProxy: true,
  disableRequestLogging: false,
  requestIdHeader: 'x-request-id'
});

// Database client
const useDb = process.env.USE_DB !== 'false' && config.nodeEnv !== 'test';
let prisma: any = {} as any;
if (PrismaClientRef && useDb) {
  try {
    prisma = new PrismaClientRef({
      log: config.nodeEnv === 'development' ? ['query', 'error'] : ['error'],
      datasources: { db: { url: config.databaseUrl } },
    });
  } catch {
    prisma = {} as any;
  }
}

// Extended request interface
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
  requestId: string;
}

// Validation schemas
export const VitalSignsSchema = z.object({
  patientId: z.string().uuid(),
  heartRate: z.number().min(30).max(220).optional(),
  bloodPressureSystolic: z.number().min(60).max(250).optional(),
  bloodPressureDiastolic: z.number().min(40).max(150).optional(),
  temperature: z.number().min(90).max(110).optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
  weight: z.number().min(0).max(1000).optional(),
  height: z.number().min(0).max(300).optional(),
  source: z.enum(['manual', 'device', 'wearable']).default('manual'),
  recordedAt: z.string().datetime().optional()
});

export const ThresholdSchema = z.object({
  patientId: z.string().uuid(),
  vital: z.enum(['heartRate', 'bloodPressure', 'temperature', 'oxygenSaturation', 'weight']),
  min: z.number().optional(),
  max: z.number().optional(),
  enabled: z.boolean().default(true)
});

export const AlertSchema = z.object({
  patientId: z.string().uuid(),
  type: z.enum(['vitals', 'medication', 'appointment', 'threshold']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1),
  message: z.string().min(1),
  triggeredBy: z.string().optional(),
  metadata: z.object({}).passthrough().optional()
});

// Register core plugins
async function registerPlugins() {
  // CORS
  await server.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
  });

  // Security headers
  await server.register(helmet, {
    contentSecurityPolicy: false // Handled by gateway
  });
}

// Authentication middleware
server.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
  // Extract user info from gateway headers
  const userId = request.headers['x-user-id'] as string;
  const userRole = request.headers['x-user-role'] as string;
  const requestId = request.headers['x-request-id'] as string;

  if (userId) {
    request.user = {
      id: userId,
      email: '', // Not needed for most operations
      role: userRole || 'patient',
      permissions: [] // Permissions checked at gateway level
    };
  }

  request.requestId = requestId || request.id;
});

// Audit logging hook
server.addHook('onResponse', async (request: AuthenticatedRequest, reply) => {
  if (request.user) {
    await trackAuditEvent({
      userId: request.user.id,
      action: 'api_access',
      resource: request.url,
      method: request.method,
      result: reply.statusCode < 400 ? 'success' : 'failure',
      requestId: request.requestId,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    });
  }
});

// Error handler
server.setErrorHandler(async (error, request: AuthenticatedRequest, reply) => {
  server.log.error({
    requestId: request.requestId,
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    userId: request.user?.id
  }, 'RPM service error');

  const statusCode = error.statusCode || 500;
  const isDevelopment = config.nodeEnv === 'development';

  // Track error in audit log
  await trackAuditEvent({
    userId: request.user?.id,
    action: 'api_access',
    resource: request.url,
    method: request.method,
    result: 'failure',
    details: { error: error.message },
    requestId: request.requestId,
    ip: request.ip,
    userAgent: request.headers['user-agent']
  });

  reply.status(statusCode).send({
    success: false,
    error: error.message || 'Internal Server Error',
    message: statusCode >= 500 ? 'Server error' : error.message,
    requestId: request.requestId,
    ...(isDevelopment && { stack: error.stack })
  });
});

// Health check
server.get('/health', async (request, reply) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'rpm',
      version: '1.0.0',
      database: 'connected'
    });
  } catch (error) {
    reply.status(503).send({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'rpm',
      version: '1.0.0',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Register route modules
async function registerRoutes() {
  // Legacy vitals endpoints (for frontend compatibility)
  await server.register(vitalsRoutes, { prefix: '/vitals', prisma });
  
  // New RPM-specific endpoints
  await server.register(rpmRoutes, { prefix: '/rpm', prisma });
  await server.register(alertsRoutes, { prefix: '/alerts', prisma });
  await server.register(thresholdsRoutes, { prefix: '/thresholds', prisma });
}

// Graceful shutdown
async function gracefulShutdown() {
  server.log.info('Shutting down RPM service gracefully...');
  
  try {
    await prisma.$disconnect();
    await server.close();
    server.log.info('RPM service shutdown complete');
    process.exit(0);
  } catch (error) {
    server.log.error(error, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    await server.listen({
      port: config.port,
      host: config.host
    });

    server.log.info(`📊 RPM service running on http://${config.host}:${config.port}`);
    server.log.info(`📊 Health check: http://${config.host}:${config.port}/health`);
    
  } catch (err) {
    server.log.fatal(err);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  start();
}

export { server, start, prisma };
