/**
 * RPM Routes - Remote Patient Monitoring specific endpoints
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { VitalSignsSchema } from '../app';

interface RPMRouteOptions {
  prisma: PrismaClient;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    role: string;
  };
  requestId: string;
}

export async function rpmRoutes(
  fastify: FastifyInstance,
  options: RPMRouteOptions
) {
  const { prisma } = options;

  /**
   * GET /rpm/patients/:id/vitals - Get patient vitals
   */
  fastify.get('/patients/:id/vitals', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const query = request.query as any;

    try {
      const {
        days = '7',
        limit = 20
      } = query;

      // Check permissions - patients can only access their own data
      if (request.user?.role === 'patient' && request.user.id !== id) {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'You can only access your own vitals data'
        });
        return;
      }

      const vitals = await getPatientVitals({
        patientId: id,
        days: parseInt(days),
        limit: parseInt(limit)
      });

      // Match MSW handler response format
      reply.send({
        patientId: id,
        days,
        vitals: vitals || []
      });

    } catch (error) {
      fastify.log.error(error, 'Error fetching patient vitals');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch patient vitals'
      });
    }
  });

  /**
   * GET /rpm/patients/:id/alerts - Get patient alerts
   */
  fastify.get('/patients/:id/alerts', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const query = request.query as any;

    try {
      const {
        severity,
        acknowledged,
        resolved
      } = query;

      // Check permissions
      if (request.user?.role === 'patient' && request.user.id !== id) {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'You can only access your own alerts'
        });
        return;
      }

      const alerts = await getPatientAlerts({
        patientId: id,
        severity,
        acknowledged: acknowledged !== undefined ? acknowledged === 'true' : undefined,
        resolved: resolved !== undefined ? resolved === 'true' : undefined
      });

      // Match MSW handler response format
      reply.send({
        patientId: id,
        alerts: alerts || []
      });

    } catch (error) {
      fastify.log.error(error, 'Error fetching patient alerts');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch patient alerts'
      });
    }
  });

  /**
   * GET /rpm/patients/:id/thresholds - Get patient thresholds
   */
  fastify.get('/patients/:id/thresholds', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      // Check permissions
      if (request.user?.role === 'patient' && request.user.id !== id) {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'You can only access your own thresholds'
        });
        return;
      }

      const thresholds = await getPatientThresholds(id);

      // Match MSW handler response format
      reply.send({
        patientId: id,
        fsr: {},
        hr: {},
        thresholds: thresholds || []
      });

    } catch (error) {
      fastify.log.error(error, 'Error fetching patient thresholds');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch patient thresholds'
      });
    }
  });

  /**
   * POST /rpm/patients/:id/thresholds - Update patient thresholds
   */
  fastify.post('/patients/:id/thresholds', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      // Only providers and admins can update thresholds
      if (request.user?.role === 'patient') {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'Only healthcare providers can update thresholds'
        });
        return;
      }

      const thresholdData = request.body as any;

      const updatedThresholds = await updatePatientThresholds(id, {
        ...thresholdData,
        updatedBy: request.user?.id,
        updatedAt: new Date()
      });

      fastify.log.info({
        patientId: id,
        updatedBy: request.user?.id,
        requestId: request.requestId
      }, 'Patient thresholds updated');

      reply.send({
        patientId: id,
        status: 'updated',
        message: 'Thresholds updated successfully',
        thresholds: updatedThresholds
      });

    } catch (error) {
      fastify.log.error(error, 'Error updating patient thresholds');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update patient thresholds'
      });
    }
  });

  /**
   * POST /rpm/patients/:id/alerts/:alertId/acknowledge - Acknowledge alert
   */
  fastify.post('/patients/:id/alerts/:alertId/acknowledge', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id, alertId } = request.params as { id: string; alertId: string };

    try {
      const acknowledgedAlert = await acknowledgeAlert({
        alertId,
        acknowledgedBy: request.user?.id,
        acknowledgedAt: new Date()
      });

      if (!acknowledgedAlert) {
        reply.status(404).send({
          success: false,
          error: 'Alert not found'
        });
        return;
      }

      fastify.log.info({
        alertId,
        patientId: id,
        acknowledgedBy: request.user?.id,
        requestId: request.requestId
      }, 'Alert acknowledged');

      reply.send({
        id: alertId,
        status: 'acknowledged',
        message: 'Alert acknowledged successfully'
      });

    } catch (error) {
      fastify.log.error(error, 'Error acknowledging alert');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to acknowledge alert'
      });
    }
  });

  /**
   * GET /rpm/dashboard - Get RPM dashboard data
   */
  fastify.get('/dashboard', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const query = request.query as any;

    try {
      const {
        patientId,
        timeframe = '7d'
      } = query;

      // For patient role, only show their own data
      const targetPatientId = request.user?.role === 'patient' ? 
        request.user.id : 
        patientId;

      const dashboardData = await getRPMDashboard({
        patientId: targetPatientId,
        timeframe,
        userRole: request.user?.role
      });

      reply.send(dashboardData);

    } catch (error) {
      fastify.log.error(error, 'Error fetching RPM dashboard data');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch dashboard data'
      });
    }
  });

  /**
   * GET /rpm/patients - Get all patients (for providers)
   */
  fastify.get('/patients', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const query = request.query as any;

    try {
      // Only providers and admins can view all patients
      if (request.user?.role === 'patient') {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'Patients can only access their own data'
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        search,
        alertLevel = 'all'
      } = query;

      const patients = await getRPMPatients({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        alertLevel,
        providerId: request.user?.role === 'doctor' ? request.user.id : undefined
      });

      reply.send(patients);

    } catch (error) {
      fastify.log.error(error, 'Error fetching RPM patients');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch patients'
      });
    }
  });
}

// Helper functions

/**
 * Get patient vitals
 */
async function getPatientVitals(params: {
  patientId: string;
  days: number;
  limit: number;
}): Promise<any[]> {
  // Mock implementation - in real system, query database
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - params.days);

  // Return empty array to match MSW handler
  return [];
}

/**
 * Get patient alerts
 */
async function getPatientAlerts(params: {
  patientId: string;
  severity?: string;
  acknowledged?: boolean;
  resolved?: boolean;
}): Promise<any[]> {
  // Mock implementation - return empty array to match MSW handler
  return [];
}

/**
 * Get patient thresholds
 */
async function getPatientThresholds(patientId: string): Promise<any[]> {
  // Mock implementation - return empty array to match MSW handler
  return [];
}

/**
 * Update patient thresholds
 */
async function updatePatientThresholds(patientId: string, data: any): Promise<any[]> {
  // Mock implementation
  return [];
}

/**
 * Acknowledge alert
 */
async function acknowledgeAlert(params: {
  alertId: string;
  acknowledgedBy?: string;
  acknowledgedAt: Date;
}): Promise<any> {
  // Mock implementation
  return {
    id: params.alertId,
    acknowledged: true,
    acknowledgedBy: params.acknowledgedBy,
    acknowledgedAt: params.acknowledgedAt
  };
}

/**
 * Get RPM dashboard data
 */
async function getRPMDashboard(params: {
  patientId?: string;
  timeframe: string;
  userRole?: string;
}): Promise<any> {
  // Mock implementation
  return {
    summary: {
      totalPatients: params.userRole === 'patient' ? 1 : 125,
      activeAlerts: 3,
      criticalAlerts: 1,
      averageCompliance: 87.5
    },
    recentVitals: [],
    activeAlerts: [],
    trends: {
      heartRate: { trend: 'stable', change: 0.2 },
      bloodPressure: { trend: 'improving', change: -5.8 },
      weight: { trend: 'increasing', change: 1.2 }
    },
    timeframe: params.timeframe
  };
}

/**
 * Get RPM patients list
 */
async function getRPMPatients(params: {
  page: number;
  limit: number;
  search?: string;
  alertLevel: string;
  providerId?: string;
}): Promise<any> {
  // Mock implementation
  const patients = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Jane Doe',
      age: 65,
      lastVitals: '2025-01-01T12:00:00Z',
      alertCount: 2,
      highestAlert: 'medium',
      compliance: 85.5,
      devices: ['Blood Pressure Monitor', 'Heart Rate Monitor']
    }
  ];

  return {
    patients,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: patients.length,
      totalPages: Math.ceil(patients.length / params.limit)
    }
  };
}
