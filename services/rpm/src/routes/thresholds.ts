/**
 * Thresholds Routes - Patient monitoring threshold management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { ThresholdSchema } from '../app';

interface ThresholdsRouteOptions {
  prisma: PrismaClient;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    role: string;
  };
  requestId: string;
}

export async function thresholdsRoutes(
  fastify: FastifyInstance,
  options: ThresholdsRouteOptions
) {
  const { prisma } = options;

  /**
   * GET /thresholds - Get thresholds for current patient or all patients
   */
  fastify.get('/', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const query = request.query as any;

    try {
      const {
        patientId,
        vital,
        enabled
      } = query;

      const thresholds = await getThresholds({
        patientId: request.user?.role === 'patient' ? request.user.id : patientId,
        vital,
        enabled: enabled !== undefined ? enabled === 'true' : undefined,
        userRole: request.user?.role
      });

      reply.send(thresholds);

    } catch (error) {
      fastify.log.error(error, 'Error fetching thresholds');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch thresholds'
      });
    }
  });

  /**
   * POST /thresholds - Create new threshold
   */
  fastify.post('/', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // Only providers can create/modify thresholds
      if (request.user?.role === 'patient') {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'Only healthcare providers can create thresholds'
        });
        return;
      }

      const thresholdData = ThresholdSchema.parse(request.body);

      const newThreshold = await createThreshold({
        ...thresholdData,
        createdBy: request.user?.id,
        createdAt: new Date()
      });

      fastify.log.info({
        thresholdId: newThreshold.id,
        patientId: thresholdData.patientId,
        vital: thresholdData.vital,
        createdBy: request.user?.id,
        requestId: request.requestId
      }, 'Threshold created');

      reply.status(201).send({
        id: newThreshold.id,
        status: 'created',
        message: 'Threshold created successfully'
      });

    } catch (error) {
      fastify.log.error(error, 'Error creating threshold');
      
      if (error instanceof Error && error.name === 'ZodError') {
        reply.status(400).send({
          success: false,
          error: 'Validation error',
          message: 'Invalid threshold data',
          details: error.message
        });
        return;
      }

      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create threshold'
      });
    }
  });

  /**
   * GET /thresholds/:id - Get specific threshold
   */
  fastify.get('/:id', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const threshold = await getThresholdById(id);

      if (!threshold) {
        reply.status(404).send({
          success: false,
          error: 'Threshold not found'
        });
        return;
      }

      // Check permissions
      if (request.user?.role === 'patient' && threshold.patientId !== request.user.id) {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'You can only access your own thresholds'
        });
        return;
      }

      reply.send(threshold);

    } catch (error) {
      fastify.log.error(error, 'Error fetching threshold');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch threshold'
      });
    }
  });

  /**
   * PUT /thresholds/:id - Update threshold
   */
  fastify.put('/:id', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      // Only providers can modify thresholds
      if (request.user?.role === 'patient') {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'Only healthcare providers can modify thresholds'
        });
        return;
      }

      const updateData = ThresholdSchema.partial().parse(request.body);

      const updatedThreshold = await updateThreshold(id, {
        ...updateData,
        updatedBy: request.user?.id,
        updatedAt: new Date()
      });

      if (!updatedThreshold) {
        reply.status(404).send({
          success: false,
          error: 'Threshold not found'
        });
        return;
      }

      fastify.log.info({
        thresholdId: id,
        updatedBy: request.user?.id,
        requestId: request.requestId
      }, 'Threshold updated');

      reply.send({
        id: updatedThreshold.id,
        status: 'updated',
        message: 'Threshold updated successfully'
      });

    } catch (error) {
      fastify.log.error(error, 'Error updating threshold');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update threshold'
      });
    }
  });

  /**
   * DELETE /thresholds/:id - Delete threshold
   */
  fastify.delete('/:id', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      // Only providers can delete thresholds
      if (request.user?.role === 'patient') {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'Only healthcare providers can delete thresholds'
        });
        return;
      }

      const deleted = await deleteThreshold(id);

      if (!deleted) {
        reply.status(404).send({
          success: false,
          error: 'Threshold not found'
        });
        return;
      }

      fastify.log.info({
        thresholdId: id,
        deletedBy: request.user?.id,
        requestId: request.requestId
      }, 'Threshold deleted');

      reply.send({
        id,
        status: 'deleted',
        message: 'Threshold deleted successfully'
      });

    } catch (error) {
      fastify.log.error(error, 'Error deleting threshold');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete threshold'
      });
    }
  });

  /**
   * POST /thresholds/bulk-update - Bulk update thresholds for a patient
   */
  fastify.post('/bulk-update', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // Only providers can modify thresholds
      if (request.user?.role === 'patient') {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'Only healthcare providers can modify thresholds'
        });
        return;
      }

      const { patientId, thresholds } = request.body as { 
        patientId: string; 
        thresholds: any[] 
      };

      if (!patientId || !thresholds || !Array.isArray(thresholds)) {
        reply.status(400).send({
          success: false,
          error: 'Invalid request',
          message: 'patientId and thresholds array are required'
        });
        return;
      }

      const results = await bulkUpdateThresholds({
        patientId,
        thresholds,
        updatedBy: request.user?.id,
        updatedAt: new Date()
      });

      fastify.log.info({
        patientId,
        thresholdCount: thresholds.length,
        updatedBy: request.user?.id,
        requestId: request.requestId
      }, 'Bulk threshold update');

      reply.send({
        patientId,
        updated: results.updated,
        created: results.created,
        failed: results.failed,
        message: `${results.updated} updated, ${results.created} created, ${results.failed} failed`
      });

    } catch (error) {
      fastify.log.error(error, 'Error bulk updating thresholds');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update thresholds'
      });
    }
  });

  /**
   * GET /thresholds/defaults - Get default thresholds by age/condition
   */
  fastify.get('/defaults', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const query = request.query as any;

    try {
      const {
        age,
        conditions,
        gender
      } = query;

      const defaultThresholds = await getDefaultThresholds({
        age: age ? parseInt(age) : undefined,
        conditions: conditions ? conditions.split(',') : [],
        gender
      });

      reply.send(defaultThresholds);

    } catch (error) {
      fastify.log.error(error, 'Error fetching default thresholds');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch default thresholds'
      });
    }
  });

  /**
   * POST /thresholds/check - Check vitals against thresholds
   */
  fastify.post('/check', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { patientId, vitals } = request.body as { 
        patientId: string; 
        vitals: any 
      };

      if (!patientId || !vitals) {
        reply.status(400).send({
          success: false,
          error: 'Invalid request',
          message: 'patientId and vitals are required'
        });
        return;
      }

      const violations = await checkThresholds({
        patientId,
        vitals
      });

      reply.send({
        patientId,
        violations,
        alertsGenerated: violations.length,
        status: violations.length > 0 ? 'violations_detected' : 'within_thresholds'
      });

    } catch (error) {
      fastify.log.error(error, 'Error checking thresholds');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to check thresholds'
      });
    }
  });
}

// Helper functions

/**
 * Get thresholds with filtering
 */
async function getThresholds(params: {
  patientId?: string;
  vital?: string;
  enabled?: boolean;
  userRole?: string;
}): Promise<any> {
  // Mock implementation
  const thresholds = [
    {
      id: 'threshold_123',
      patientId: params.patientId || '550e8400-e29b-41d4-a716-446655440000',
      vital: 'heartRate',
      min: 60,
      max: 100,
      enabled: true,
      createdBy: 'provider_456',
      createdAt: '2025-01-01T12:00:00Z',
      updatedAt: '2025-01-01T12:00:00Z'
    },
    {
      id: 'threshold_124',
      patientId: params.patientId || '550e8400-e29b-41d4-a716-446655440000',
      vital: 'bloodPressure',
      min: null,
      max: 140,
      enabled: true,
      createdBy: 'provider_456',
      createdAt: '2025-01-01T12:00:00Z',
      updatedAt: '2025-01-01T12:00:00Z'
    }
  ];

  // Apply filters
  let filteredThresholds = thresholds;
  
  if (params.vital) {
    filteredThresholds = filteredThresholds.filter(t => t.vital === params.vital);
  }
  
  if (params.enabled !== undefined) {
    filteredThresholds = filteredThresholds.filter(t => t.enabled === params.enabled);
  }

  return {
    thresholds: filteredThresholds,
    count: filteredThresholds.length
  };
}

/**
 * Create new threshold
 */
async function createThreshold(data: any): Promise<any> {
  // Mock implementation
  const threshold = {
    id: `threshold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return threshold;
}

/**
 * Get threshold by ID
 */
async function getThresholdById(id: string): Promise<any> {
  // Mock implementation
  if (id === 'threshold_123') {
    return {
      id,
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      vital: 'heartRate',
      min: 60,
      max: 100,
      enabled: true,
      createdBy: 'provider_456',
      createdAt: '2025-01-01T12:00:00Z',
      updatedAt: '2025-01-01T12:00:00Z'
    };
  }

  return null;
}

/**
 * Update threshold
 */
async function updateThreshold(id: string, data: any): Promise<any> {
  // Mock implementation
  const existingThreshold = await getThresholdById(id);
  
  if (!existingThreshold) {
    return null;
  }

  return {
    ...existingThreshold,
    ...data,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Delete threshold
 */
async function deleteThreshold(id: string): Promise<boolean> {
  // Mock implementation
  const existingThreshold = await getThresholdById(id);
  return !!existingThreshold;
}

/**
 * Bulk update thresholds
 */
async function bulkUpdateThresholds(params: {
  patientId: string;
  thresholds: any[];
  updatedBy?: string;
  updatedAt: Date;
}): Promise<{ updated: number; created: number; failed: number }> {
  // Mock implementation
  return {
    updated: Math.floor(params.thresholds.length * 0.7),
    created: Math.floor(params.thresholds.length * 0.3),
    failed: 0
  };
}

/**
 * Get default thresholds based on patient characteristics
 */
async function getDefaultThresholds(params: {
  age?: number;
  conditions?: string[];
  gender?: string;
}): Promise<any> {
  // Mock implementation with age-adjusted defaults
  const baseThresholds = {
    heartRate: { min: 60, max: 100 },
    bloodPressure: { min: null, max: 140 },
    temperature: { min: 97.0, max: 99.5 },
    oxygenSaturation: { min: 95, max: null },
    weight: { min: null, max: null }
  };

  // Adjust for age
  if (params.age && params.age > 65) {
    baseThresholds.heartRate.min = 50;
    baseThresholds.bloodPressure.max = 150;
  }

  // Adjust for conditions
  if (params.conditions?.includes('diabetes')) {
    // Add glucose thresholds for diabetic patients
    (baseThresholds as any).glucose = { min: 70, max: 180 };
  }

  return {
    defaults: baseThresholds,
    adjustedFor: {
      age: params.age,
      conditions: params.conditions,
      gender: params.gender
    }
  };
}

/**
 * Check vitals against patient thresholds
 */
async function checkThresholds(params: {
  patientId: string;
  vitals: any;
}): Promise<any[]> {
  // Mock implementation
  const violations = [];

  // Get patient thresholds
  const thresholds = await getThresholds({ patientId: params.patientId });

  for (const threshold of thresholds.thresholds) {
    if (!threshold.enabled) continue;

    const vitalValue = params.vitals[threshold.vital];
    if (vitalValue === undefined || vitalValue === null) continue;

    let violated = false;
    let violationType = '';

    if (threshold.min !== null && vitalValue < threshold.min) {
      violated = true;
      violationType = 'below_minimum';
    } else if (threshold.max !== null && vitalValue > threshold.max) {
      violated = true;
      violationType = 'above_maximum';
    }

    if (violated) {
      violations.push({
        thresholdId: threshold.id,
        vital: threshold.vital,
        value: vitalValue,
        violationType,
        severity: getSeverity(threshold.vital, vitalValue, threshold),
        threshold: {
          min: threshold.min,
          max: threshold.max
        }
      });
    }
  }

  return violations;
}

/**
 * Determine severity of threshold violation
 */
function getSeverity(vital: string, value: number, threshold: any): 'low' | 'medium' | 'high' | 'critical' {
  // Mock implementation - in real system, use clinical guidelines
  const deviation = Math.max(
    threshold.min ? Math.abs(value - threshold.min) / threshold.min : 0,
    threshold.max ? Math.abs(value - threshold.max) / threshold.max : 0
  );

  if (deviation > 0.5) return 'critical';
  if (deviation > 0.3) return 'high';
  if (deviation > 0.15) return 'medium';
  return 'low';
}
