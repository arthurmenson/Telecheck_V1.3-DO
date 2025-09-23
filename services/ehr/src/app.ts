/**
 * EHR Service - Electronic Health Records management
 * 
 * Features:
 * - Patient management
 * - Intake forms
 * - Provider management
 * - Appointment scheduling with double-booking prevention
 * - Messaging between patients and providers
 * - Audit logging for PHI access
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
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
import { schedulingRoutes } from './routes/scheduling';
import { patientsRoutes } from './routes/patients';
import { intakeRoutes } from './routes/intake';
import { providersRoutes } from './routes/providers';
import { messagingRoutes } from './routes/messaging';
import { trackPHIAccess, trackAuditEvent } from './utils/audit';
import { redactPII } from './utils/redaction';

// Environment configuration
const config = {
  port: parseInt(process.env.PORT || '3002'),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/telecheck_ehr',
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

// Create a mock Prisma client for development/testing
function createMockPrismaClient() {
  return {
    $transaction: async (fn: any) => {
      // Mock transaction function - just execute the function with mock tx
      return await fn({
        appointmentSlot: {
          findFirst: async () => ({ id: 'mock-slot', available: true }),
          update: async () => ({ id: 'mock-slot', available: false }),
        },
        appointment: {
          create: async (data: any) => ({
            id: `apt_${Date.now()}`,
            ...data.data,
            createdAt: new Date(),
            updatedAt: new Date()
          }),
          findUnique: async () => ({ id: 'mock-apt', status: 'confirmed' }),
          update: async (params: any) => ({ id: params.where.id, ...params.data }),
          delete: async () => ({ id: 'mock-apt' }),
        },
        patient: {
          findUnique: async () => ({ id: 'mock-patient', name: 'Mock Patient' }),
        }
      });
    },
    appointmentSlot: {
      findMany: async () => [
        { id: 's1', start: new Date(), end: new Date(), available: true },
        { id: 's2', start: new Date(), end: new Date(), available: true }
      ],
    },
    appointment: {
      findMany: async () => [],
    },
    $disconnect: async () => {},
  };
}

let prisma: any = {} as any;
if (PrismaClientRef && useDb) {
  try {
    prisma = new PrismaClientRef({
      log: config.nodeEnv === 'development' ? ['query', 'error'] : ['error'],
      datasources: { db: { url: config.databaseUrl } },
    });
  } catch (error) {
    server.log.warn({ error }, 'Failed to connect to database, using mock client');
    prisma = createMockPrismaClient();
  }
} else {
  server.log.info('Using mock Prisma client for development');
  prisma = createMockPrismaClient();
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
export const PatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string()
  }).optional(),
  insuranceInfo: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    groupNumber: z.string().optional()
  }).optional()
});

export const IntakeFormSchema = z.object({
  patientId: z.string().uuid(),
  chiefComplaint: z.string().min(1),
  symptoms: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medicalHistory: z.array(z.string()).optional(),
  socialHistory: z.object({
    smoking: z.enum(['never', 'former', 'current']).optional(),
    alcohol: z.enum(['none', 'occasional', 'moderate', 'heavy']).optional(),
    exercise: z.string().optional()
  }).optional()
});

export const BookingRequestSchema = z.object({
  slotId: z.string(),
  patientId: z.string().uuid(),
  appointmentType: z.enum(['consultation', 'follow-up', 'urgent', 'annual']).optional(),
  notes: z.string().optional()
});

export const RescheduleRequestSchema = z.object({
  to: z.string().datetime(),
  reason: z.string().optional()
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

  // File upload support
  await server.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
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
  const isPhiEndpoint = ['/patients/', '/intake', '/messaging/'].some(pattern => 
    request.url.includes(pattern)
  );

  if (isPhiEndpoint && request.user) {
    await trackPHIAccess({
      userId: request.user.id,
      patientId: extractPatientId(request),
      action: mapMethodToAction(request.method),
      resource: request.url,
      requestId: request.requestId,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    });
  }
});

// Helper functions
function extractPatientId(request: FastifyRequest): string {
  // Extract patient ID from URL params or body
  const params = request.params as any;
  const body = request.body as any;
  
  return params?.id || params?.patientId || body?.patientId || 'unknown';
}

function mapMethodToAction(method: string): 'view' | 'create' | 'update' | 'delete' | 'export' {
  switch (method.toUpperCase()) {
    case 'GET': return 'view';
    case 'POST': return 'create';
    case 'PUT':
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return 'view';
  }
}

// Error handler
server.setErrorHandler(async (error, request: AuthenticatedRequest, reply) => {
  server.log.error({
    requestId: request.requestId,
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    userId: request.user?.id
  }, 'EHR service error');

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
    message: statusCode >= 500 ? 'Failed' : error.message,
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
      service: 'ehr',
      version: '1.0.0',
      database: 'connected'
    });
  } catch (error) {
    reply.status(503).send({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'ehr',
      version: '1.0.0',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Register route modules
async function registerRoutes() {
  await server.register(schedulingRoutes, { prefix: '/scheduling', prisma });
  await server.register(patientsRoutes, { prefix: '/patients', prisma });
  await server.register(intakeRoutes, { prefix: '/intake', prisma });
  await server.register(providersRoutes, { prefix: '/providers', prisma });
  await server.register(messagingRoutes, { prefix: '/messaging', prisma });
}

// Graceful shutdown
async function gracefulShutdown() {
  server.log.info('Shutting down EHR service gracefully...');
  
  try {
    await prisma.$disconnect();
    await server.close();
    server.log.info('EHR service shutdown complete');
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

    server.log.info(`🏥 EHR service running on http://${config.host}:${config.port}`);
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
