/**
 * API Gateway - Central entry point for all Telecheck services
 * 
 * Features:
 * - JWT authentication & authorization
 * - Service routing & load balancing
 * - Rate limiting & request throttling
 * - Request/response logging & metrics
 * - CORS handling
 * - Request ID tracking
 * - Audit logging for PHI access
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
import { redactPII } from './utils/redaction';
import { trackAuditEvent } from './utils/audit';
import { getFeatureFlag } from './utils/featureFlags';

// Environment configuration
const config = {
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  nodeEnv: process.env.NODE_ENV || 'development',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Service endpoints
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    ehr: process.env.EHR_SERVICE_URL || 'http://localhost:3002',
    rpm: process.env.RPM_SERVICE_URL || 'http://localhost:3003',
    labs: process.env.LABS_SERVICE_URL || 'http://localhost:3004',
    medications: process.env.MEDICATIONS_SERVICE_URL || 'http://localhost:3005',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3006',
    messaging: process.env.MESSAGING_SERVICE_URL || 'http://localhost:3007',
    files: process.env.FILES_SERVICE_URL || 'http://localhost:3008',
    billing: process.env.BILLING_SERVICE_URL || 'http://localhost:3009',
    messagingAdmin: process.env.MESSAGING_ADMIN_SERVICE_URL || 'http://localhost:3010',
  }
};

const skipAuth = process.env.SKIP_AUTH === 'true' || config.nodeEnv !== 'production';

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
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId'
});

// Interface definitions
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
  requestId: string;
}

interface ServiceRoute {
  prefix: string;
  target: string;
  requiresAuth: boolean;
  permissions?: string[];
  rateLimit?: {
    max: number;
    timeWindow: string;
  };
}

// Service routing configuration
const serviceRoutes: ServiceRoute[] = [
  {
    prefix: '/api/auth',
    target: config.services.auth,
    requiresAuth: false,
  },
  {
    prefix: '/api/admin/messaging',
    target: config.services.messagingAdmin,
    requiresAuth: true,
    permissions: ['admin:read'],
    rateLimit: { max: 100, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/ehr',
    target: config.services.ehr,
    requiresAuth: true,
    permissions: ['ehr:read', 'ehr:write'],
    rateLimit: { max: 100, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/rpm',
    target: config.services.rpm,
    requiresAuth: true,
    permissions: ['rpm:read'],
    rateLimit: { max: 200, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/vitals',
    target: config.services.rpm,
    requiresAuth: true,
    permissions: ['rpm:read'],
    rateLimit: { max: 200, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/labs',
    target: config.services.labs,
    requiresAuth: true,
    permissions: ['labs:read', 'labs:write'],
    rateLimit: { max: 50, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/analyze-lab',
    target: config.services.labs,
    requiresAuth: true,
    permissions: ['labs:analyze'],
    rateLimit: { max: 10, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/medications',
    target: config.services.medications,
    requiresAuth: true,
    permissions: ['medications:read', 'medications:write'],
    rateLimit: { max: 100, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/analytics',
    target: config.services.analytics,
    requiresAuth: true,
    permissions: ['analytics:read'],
    rateLimit: { max: 50, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/admin',
    target: config.services.analytics,
    requiresAuth: true,
    permissions: ['admin:read'],
    rateLimit: { max: 100, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/files',
    target: config.services.files,
    requiresAuth: true,
    permissions: ['files:read', 'files:write'],
    rateLimit: { max: 20, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/billing',
    target: config.services.billing,
    requiresAuth: true,
    permissions: ['billing:read', 'billing:write'],
    rateLimit: { max: 30, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/eligibility',
    target: config.services.billing,
    requiresAuth: true,
    permissions: ['billing:eligibility'],
    rateLimit: { max: 30, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/chat',
    target: config.services.messaging,
    requiresAuth: true,
    permissions: ['messaging:read', 'messaging:write'],
    rateLimit: { max: 100, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/patients',
    target: config.services.ehr,
    requiresAuth: true,
    permissions: ['ehr:read'],
    rateLimit: { max: 100, timeWindow: '1 minute' }
  },
  {
    prefix: '/api/commerce',
    target: config.services.medications,
    requiresAuth: true,
    permissions: ['pharmacy:read', 'pharmacy:write'],
    rateLimit: { max: 50, timeWindow: '1 minute' }
  }
];

// Register core plugins
async function registerPlugins() {
  // CORS
  await server.register(cors, {
    origin: (origin, cb) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://telecheck.health',
        'https://*.telecheck.health'
      ];
      
      if (!origin || allowedOrigins.some(allowed => 
        allowed.includes('*') ? 
          origin.endsWith(allowed.replace('*.', '')) : 
          origin === allowed
      )) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
  });

  // Security headers
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
      },
    },
  });

  // Rate limiting
  await server.register(rateLimit, {
    global: true,
    max: 1000,
    timeWindow: '1 minute',
    redis: config.redisUrl,
    skipOnError: true,
    errorResponseBuilder: (req, context) => ({
      error: 'Rate limit exceeded',
      message: `Too many requests, limit: ${context.max} per ${context.timeWindow}`,
      retryAfter: context.ttl
    })
  });

  // JWT
  await server.register(jwt, {
    secret: config.jwtSecret,
    sign: {
      expiresIn: '1h'
    },
    verify: {
      extractToken: (request) => {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          return authHeader.substring(7);
        }
        return null;
      }
    }
  });
}

// Authentication middleware
async function authenticate(request: AuthenticatedRequest, reply: FastifyReply) {
  if (skipAuth) {
    // Populate a dev user if missing auth
    request.user = request.user || { id: 'dev-user', email: 'dev@telecheck', role: 'admin', permissions: [] };
    return;
  }
  try {
    const decoded = await request.jwtVerify() as any;
    request.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role || 'patient',
      permissions: decoded.permissions || []
    };
    
    await trackAuditEvent({
      userId: request.user.id,
      action: 'api_access',
      resource: request.url,
      method: request.method,
      requestId: request.id,
      userAgent: request.headers['user-agent'],
      ip: request.ip
    });
    
  } catch (err) {
    reply.status(401).send({
      error: 'Authentication required',
      message: 'Invalid or missing authentication token'
    });
    return;
  }
}

// Authorization middleware
function authorize(requiredPermissions: string[] = []) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (skipAuth) return;
    if (!request.user) {
      reply.status(401).send({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
      return;
    }

    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.some(permission => 
        request.user?.permissions.includes(permission) ||
        request.user?.role === 'admin'
      );

      if (!hasPermission) {
        reply.status(403).send({
          error: 'Insufficient permissions',
          message: `Required permissions: ${requiredPermissions.join(', ')}`
        });
        return;
      }
    }
  };
}

// Request ID middleware
server.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
  // Generate or use existing request ID
  request.requestId = request.headers['x-request-id'] as string || uuidv4();
  reply.header('x-request-id', request.requestId);
  
  // Add request start time for latency tracking
  request.startTime = Date.now();
});

// Response time logging
server.addHook('onSend', async (request: AuthenticatedRequest, reply) => {
  const duration = Date.now() - (request.startTime || Date.now());
  reply.header('x-response-time', `${duration}ms`);
  
  // Log request completion
  server.log.info({
    requestId: request.requestId,
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    duration,
    userId: request.user?.id
  }, 'Request completed');
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
  }, 'Request error');

  const statusCode = error.statusCode || 500;
  const isDevelopment = config.nodeEnv === 'development';

  reply.status(statusCode).send({
    error: error.message || 'Internal Server Error',
    requestId: request.requestId,
    ...(isDevelopment && { stack: error.stack })
  });
});

// Service proxy function
async function proxyToService(request: FastifyRequest, reply: FastifyReply, targetUrl: string) {
  const url = new URL(request.url.replace('/api', ''), targetUrl);
  
  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: {
        ...request.headers as Record<string, string>,
        'x-request-id': (request as AuthenticatedRequest).requestId,
        'x-user-id': (request as AuthenticatedRequest).user?.id || '',
        'x-user-role': (request as AuthenticatedRequest).user?.role || '',
        'host': new URL(targetUrl).host
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? 
        JSON.stringify(request.body) : undefined
    });

    const data = await response.text();
    
    // Forward response headers
    for (const [key, value] of response.headers.entries()) {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        reply.header(key, value);
      }
    }

    reply.status(response.status);
    
    // Try to parse as JSON, fallback to text
    try {
      const jsonData = JSON.parse(data);
      reply.send(jsonData);
    } catch {
      reply.send(data);
    }

  } catch (error) {
    server.log.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      targetUrl,
      requestId: (request as AuthenticatedRequest).requestId
    }, 'Service proxy error');
    
    reply.status(503).send({
      error: 'Service unavailable',
      message: 'Unable to reach downstream service',
      service: targetUrl
    });
  }
}

// Register service routes
async function registerServiceRoutes() {
  for (const route of serviceRoutes) {
    const routeOptions: any = {
      prefix: route.prefix
    };

    if (route.rateLimit) {
      routeOptions.rateLimit = route.rateLimit;
    }

    await server.register(async function (fastify) {
      // Add authentication hook if required and not skipping
      if (route.requiresAuth && !skipAuth) {
        fastify.addHook('preHandler', authenticate);
        
        if (route.permissions) {
          fastify.addHook('preHandler', authorize(route.permissions));
        }
      }

      // Catch-all route handler
      fastify.all('/*', async (request, reply) => {
        await proxyToService(request, reply, route.target);
      });
    }, routeOptions);
  }
}

// Health check endpoint
server.get('/health', async (request, reply) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.nodeEnv,
    requestId: (request as AuthenticatedRequest).requestId
  };

  reply.send(health);
});

// API documentation endpoint
server.get('/api/docs', async (request, reply) => {
  const docs = {
    name: 'Telecheck API Gateway',
    version: '1.0.0',
    description: 'Central API gateway for Telecheck health platform',
    services: serviceRoutes.map(route => ({
      prefix: route.prefix,
      requiresAuth: route.requiresAuth,
      permissions: route.permissions,
      rateLimit: route.rateLimit
    })),
    authentication: {
      type: 'Bearer',
      header: 'Authorization',
      format: 'Bearer <token>'
    }
  };

  reply.send(docs);
});

// Initialize server
async function start() {
  try {
    await registerPlugins();
    await registerServiceRoutes();

    await server.listen({
      port: config.port,
      host: config.host
    });

    server.log.info(`🚀 API Gateway running on http://${config.host}:${config.port}`);
    server.log.info(`📊 Health check: http://${config.host}:${config.port}/health`);
    server.log.info(`📚 API docs: http://${config.host}:${config.port}/api/docs`);
    
  } catch (err) {
    server.log.fatal(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  server.log.info('SIGTERM received, shutting down gracefully');
  await server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  server.log.info('SIGINT received, shutting down gracefully');
  await server.close();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  start();
}

export { server, start };
