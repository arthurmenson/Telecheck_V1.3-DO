/**
 * Legacy Vitals Routes - Backwards compatibility with existing frontend
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { VitalSignsSchema } from '../app';
import { isChaosMode, simulateChaosError } from '../utils/chaos';

interface VitalsRouteOptions {
  prisma: PrismaClient;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    role: string;
  };
  requestId: string;
}

export async function vitalsRoutes(
  fastify: FastifyInstance,
  options: VitalsRouteOptions
) {
  const { prisma } = options;

  /**
   * GET /vitals/trends - Get vitals trends (legacy endpoint)
   */
  fastify.get('/trends', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const query = request.query as any;

    try {
      const {
        patientId,
        timeframe = '7d',
        vitals
      } = query;

      // Mock trends data to match MSW handler
      const trendsData = {
        series: [
          {
            name: 'glucose',
            data: []
          }
        ],
        timeframe,
        patientId: patientId || request.user?.id
      };

      reply.send(trendsData);

    } catch (error) {
      fastify.log.error(error, 'Error fetching vitals trends');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Server error'
      });
    }
  });

  /**
   * GET /vitals - Get vitals data (legacy endpoint)
   */
  fastify.get('/', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const query = request.query as any;

    try {
      const {
        patientId,
        limit = 20,
        offset = 0
      } = query;

      // Mock vitals data to match MSW handler
      const vitalsData = {
        items: [],
        patientId: patientId || request.user?.id
      };

      reply.send(vitalsData);

    } catch (error) {
      fastify.log.error(error, 'Error fetching vitals');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Server error'
      });
    }
  });

  /**
   * GET /vitals/empty - Test endpoint for empty vitals
   */
  fastify.get('/empty', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    reply.send({
      items: []
    });
  });

  /**
   * GET /vitals/error - Test endpoint for vitals error
   */
  fastify.get('/error', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    reply.status(500).send({
      success: false,
      message: 'Server error'
    });
  });

  /**
   * POST /vitals - Add new vital signs
   */
  fastify.post('/', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const vitalsData = VitalSignsSchema.parse(request.body);

      const newVitals = await createVitalSigns({
        ...vitalsData,
        patientId: vitalsData.patientId || request.user?.id || '',
        recordedBy: request.user?.id,
        recordedAt: vitalsData.recordedAt ? new Date(vitalsData.recordedAt) : new Date()
      });

      // Check thresholds and generate alerts if needed
      await checkVitalsThresholds(newVitals);

      fastify.log.info({
        vitalsId: newVitals.id,
        patientId: newVitals.patientId,
        recordedBy: request.user?.id,
        requestId: request.requestId
      }, 'Vital signs recorded');

      reply.status(201).send({
        id: newVitals.id,
        status: 'recorded',
        message: 'Vital signs recorded successfully'
      });

    } catch (error) {
      fastify.log.error(error, 'Error recording vital signs');
      
      if (error instanceof Error && error.name === 'ZodError') {
        reply.status(400).send({
          success: false,
          error: 'Validation error',
          message: 'Invalid vital signs data',
          details: error.message
        });
        return;
      }

      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to record vital signs'
      });
    }
  });

  /**
   * GET /vitals/statistics - Get vitals statistics
   */
  fastify.get('/statistics', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const query = request.query as any;

    try {
      const {
        patientId,
        period = '30d'
      } = query;

      const stats = await getVitalsStatistics({
        patientId: patientId || request.user?.id,
        period
      });

      reply.send(stats);

    } catch (error) {
      fastify.log.error(error, 'Error fetching vitals statistics');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch vitals statistics'
      });
    }
  });

  /**
   * PUT /vitals/:id - Update vital signs
   */
  fastify.put('/:id', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const updateData = VitalSignsSchema.partial().parse(request.body);

      const updatedVitals = await updateVitalSigns(id, {
        ...updateData,
        updatedBy: request.user?.id,
        updatedAt: new Date()
      });

      if (!updatedVitals) {
        reply.status(404).send({
          success: false,
          error: 'Vital signs record not found'
        });
        return;
      }

      reply.send({
        id: updatedVitals.id,
        status: 'updated',
        message: 'Vital signs updated successfully'
      });

    } catch (error) {
      fastify.log.error(error, 'Error updating vital signs');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update vital signs'
      });
    }
  });

  /**
   * DELETE /vitals/:id - Delete vital signs
   */
  fastify.delete('/:id', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const deleted = await deleteVitalSigns(id);

      if (!deleted) {
        reply.status(404).send({
          success: false,
          error: 'Vital signs record not found'
        });
        return;
      }

      reply.send({
        id,
        status: 'deleted',
        message: 'Vital signs deleted successfully'
      });

    } catch (error) {
      fastify.log.error(error, 'Error deleting vital signs');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete vital signs'
      });
    }
  });
}

// Helper functions

/**
 * Create new vital signs record
 */
async function createVitalSigns(data: any): Promise<any> {
  // Mock implementation - in real system, save to database
  const vitals = {
    id: `vitals_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return vitals;
}

/**
 * Update vital signs record
 */
async function updateVitalSigns(id: string, data: any): Promise<any> {
  // Mock implementation
  return {
    id,
    ...data,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Delete vital signs record
 */
async function deleteVitalSigns(id: string): Promise<boolean> {
  // Mock implementation
  return true;
}

/**
 * Get vitals statistics
 */
async function getVitalsStatistics(params: {
  patientId?: string;
  period: string;
}): Promise<any> {
  // Mock implementation
  return {
    averages: {
      heartRate: 72,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      temperature: 98.6,
      oxygenSaturation: 98
    },
    trends: {
      heartRate: 'stable',
      bloodPressure: 'improving',
      weight: 'increasing'
    },
    alertCount: 2,
    recordingFrequency: '2.3 per day',
    period: params.period
  };
}

/**
 * Check vitals against thresholds and generate alerts
 */
async function checkVitalsThresholds(vitals: any): Promise<void> {
  // Mock implementation - in real system:
  // 1. Fetch patient thresholds from database
  // 2. Compare vital signs against thresholds
  // 3. Generate alerts for any violations
  // 4. Send notifications to care team

  const alerts = [];

  // Example threshold checks
  if (vitals.heartRate && (vitals.heartRate < 60 || vitals.heartRate > 100)) {
    alerts.push({
      type: 'vitals',
      severity: vitals.heartRate < 40 || vitals.heartRate > 140 ? 'critical' : 'medium',
      title: 'Heart Rate Alert',
      message: `Heart rate of ${vitals.heartRate} BPM detected`,
      triggeredBy: vitals.id
    });
  }

  if (vitals.bloodPressureSystolic && vitals.bloodPressureSystolic > 140) {
    alerts.push({
      type: 'vitals',
      severity: vitals.bloodPressureSystolic > 180 ? 'critical' : 'high',
      title: 'High Blood Pressure Alert',
      message: `Blood pressure reading of ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} detected`,
      triggeredBy: vitals.id
    });
  }

  // In real implementation, save alerts to database and send notifications
  for (const alert of alerts) {
    console.log('Alert generated:', alert);
  }
}
