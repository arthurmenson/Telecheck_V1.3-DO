/**
 * Alerts Routes - Alert management and notification system
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { AlertSchema } from "../app";

interface AlertsRouteOptions {
  prisma: PrismaClient;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    role: string;
  };
  requestId: string;
}

export async function alertsRoutes(
  fastify: FastifyInstance,
  options: AlertsRouteOptions,
) {
  const { prisma } = options;

  /**
   * GET /alerts - Get alerts for current user or all alerts (for providers)
   */
  fastify.get(
    "/",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const query = request.query as any;

      try {
        const {
          page = 1,
          limit = 20,
          severity,
          acknowledged,
          resolved,
          patientId,
        } = query;

        const alerts = await getAlerts({
          page: parseInt(page),
          limit: parseInt(limit),
          severity,
          acknowledged:
            acknowledged !== undefined ? acknowledged === "true" : undefined,
          resolved: resolved !== undefined ? resolved === "true" : undefined,
          patientId:
            request.user?.role === "patient" ? request.user.id : patientId,
          userRole: request.user?.role,
        });

        reply.send(alerts);
      } catch (error) {
        fastify.log.error(error, "Error fetching alerts");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to fetch alerts",
        });
      }
    },
  );

  /**
   * POST /alerts - Create new alert
   */
  fastify.post(
    "/",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        // Only providers and system can create alerts
        if (request.user?.role === "patient") {
          reply.status(403).send({
            success: false,
            error: "Access denied",
            message: "Patients cannot create alerts",
          });
          return;
        }

        const alertData = AlertSchema.parse(request.body);

        const newAlert = await createAlert({
          ...alertData,
          triggeredBy: request.user?.id,
          triggeredAt: new Date(),
        });

        // Send notification
        await sendAlertNotification(newAlert);

        fastify.log.info(
          {
            alertId: newAlert.id,
            patientId: alertData.patientId,
            severity: alertData.severity,
            triggeredBy: request.user?.id,
            requestId: request.requestId,
          },
          "Alert created",
        );

        reply.status(201).send({
          id: newAlert.id,
          status: "created",
          message: "Alert created successfully",
        });
      } catch (error) {
        fastify.log.error(error, "Error creating alert");

        if (error instanceof Error && error.name === "ZodError") {
          reply.status(400).send({
            success: false,
            error: "Validation error",
            message: "Invalid alert data",
            details: error.message,
          });
          return;
        }

        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to create alert",
        });
      }
    },
  );

  /**
   * GET /alerts/:id - Get specific alert
   */
  fastify.get(
    "/:id",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        const alert = await getAlertById(id);

        if (!alert) {
          reply.status(404).send({
            success: false,
            error: "Alert not found",
          });
          return;
        }

        // Check permissions
        if (
          request.user?.role === "patient" &&
          alert.patientId !== request.user.id
        ) {
          reply.status(403).send({
            success: false,
            error: "Access denied",
            message: "You can only access your own alerts",
          });
          return;
        }

        reply.send(alert);
      } catch (error) {
        fastify.log.error(error, "Error fetching alert");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to fetch alert",
        });
      }
    },
  );

  /**
   * POST /alerts/:id/acknowledge - Acknowledge alert
   */
  fastify.post(
    "/:id/acknowledge",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        const alert = await getAlertById(id);

        if (!alert) {
          reply.status(404).send({
            success: false,
            error: "Alert not found",
          });
          return;
        }

        const acknowledgedAlert = await acknowledgeAlert({
          alertId: id,
          acknowledgedBy: request.user?.id,
          acknowledgedAt: new Date(),
          notes: (request.body as any)?.notes,
        });

        fastify.log.info(
          {
            alertId: id,
            acknowledgedBy: request.user?.id,
            requestId: request.requestId,
          },
          "Alert acknowledged",
        );

        reply.send({
          id: acknowledgedAlert.id,
          status: "acknowledged",
          message: "Alert acknowledged successfully",
        });
      } catch (error) {
        fastify.log.error(error, "Error acknowledging alert");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to acknowledge alert",
        });
      }
    },
  );

  /**
   * POST /alerts/:id/resolve - Resolve alert
   */
  fastify.post(
    "/:id/resolve",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        // Only providers can resolve alerts
        if (request.user?.role === "patient") {
          reply.status(403).send({
            success: false,
            error: "Access denied",
            message: "Only healthcare providers can resolve alerts",
          });
          return;
        }

        const alert = await getAlertById(id);

        if (!alert) {
          reply.status(404).send({
            success: false,
            error: "Alert not found",
          });
          return;
        }

        const resolvedAlert = await resolveAlert({
          alertId: id,
          resolvedBy: request.user?.id,
          resolvedAt: new Date(),
          resolution: (request.body as any)?.resolution,
        });

        fastify.log.info(
          {
            alertId: id,
            resolvedBy: request.user?.id,
            requestId: request.requestId,
          },
          "Alert resolved",
        );

        reply.send({
          id: resolvedAlert.id,
          status: "resolved",
          message: "Alert resolved successfully",
        });
      } catch (error) {
        fastify.log.error(error, "Error resolving alert");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to resolve alert",
        });
      }
    },
  );

  /**
   * GET /alerts/statistics - Get alert statistics
   */
  fastify.get(
    "/statistics",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const query = request.query as any;

      try {
        const { period = "30d", patientId } = query;

        const stats = await getAlertStatistics({
          period,
          patientId:
            request.user?.role === "patient" ? request.user.id : patientId,
          userRole: request.user?.role,
        });

        reply.send(stats);
      } catch (error) {
        fastify.log.error(error, "Error fetching alert statistics");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to fetch alert statistics",
        });
      }
    },
  );

  /**
   * POST /alerts/bulk-acknowledge - Acknowledge multiple alerts
   */
  fastify.post(
    "/bulk-acknowledge",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { alertIds, notes } = request.body as {
          alertIds: string[];
          notes?: string;
        };

        if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
          reply.status(400).send({
            success: false,
            error: "Invalid request",
            message: "alertIds array is required",
          });
          return;
        }

        const results = await bulkAcknowledgeAlerts({
          alertIds,
          acknowledgedBy: request.user?.id,
          acknowledgedAt: new Date(),
          notes,
        });

        fastify.log.info(
          {
            alertCount: alertIds.length,
            acknowledgedBy: request.user?.id,
            requestId: request.requestId,
          },
          "Bulk alert acknowledgment",
        );

        reply.send({
          acknowledged: results.acknowledged,
          failed: results.failed,
          message: `${results.acknowledged} alerts acknowledged, ${results.failed} failed`,
        });
      } catch (error) {
        fastify.log.error(error, "Error bulk acknowledging alerts");
        reply.status(500).send({
          success: false,
          error: "Internal server error",
          message: "Failed to acknowledge alerts",
        });
      }
    },
  );
}

// Helper functions

/**
 * Get alerts with filtering and pagination
 */
async function getAlerts(params: {
  page: number;
  limit: number;
  severity?: string;
  acknowledged?: boolean;
  resolved?: boolean;
  patientId?: string;
  userRole?: string;
}): Promise<any> {
  // Mock implementation
  const alerts = [
    {
      id: "alert_123",
      patientId: params.patientId || "550e8400-e29b-41d4-a716-446655440000",
      type: "vitals",
      severity: "high",
      title: "High Blood Pressure Alert",
      message: "Blood pressure reading of 180/110 detected",
      triggeredAt: "2025-01-01T12:00:00Z",
      acknowledged: false,
      acknowledgedAt: null,
      acknowledgedBy: null,
      resolved: false,
      resolvedAt: null,
      metadata: {
        vitalType: "bloodPressure",
        reading: "180/110",
        threshold: "140/90",
      },
    },
  ];

  // Apply filters
  let filteredAlerts = alerts;

  if (params.severity) {
    filteredAlerts = filteredAlerts.filter(
      (a) => a.severity === params.severity,
    );
  }

  if (params.acknowledged !== undefined) {
    filteredAlerts = filteredAlerts.filter(
      (a) => a.acknowledged === params.acknowledged,
    );
  }

  if (params.resolved !== undefined) {
    filteredAlerts = filteredAlerts.filter(
      (a) => a.resolved === params.resolved,
    );
  }

  return {
    alerts: filteredAlerts,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: filteredAlerts.length,
      totalPages: Math.ceil(filteredAlerts.length / params.limit),
    },
  };
}

/**
 * Create new alert
 */
async function createAlert(data: any): Promise<any> {
  // Mock implementation
  const alert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    acknowledged: false,
    resolved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return alert;
}

/**
 * Get alert by ID
 */
async function getAlertById(id: string): Promise<any> {
  // Mock implementation
  if (id === "alert_123") {
    return {
      id,
      patientId: "550e8400-e29b-41d4-a716-446655440000",
      type: "vitals",
      severity: "high",
      title: "High Blood Pressure Alert",
      message: "Blood pressure reading of 180/110 detected",
      triggeredAt: "2025-01-01T12:00:00Z",
      acknowledged: false,
      resolved: false,
    };
  }

  return null;
}

/**
 * Acknowledge alert
 */
async function acknowledgeAlert(params: {
  alertId: string;
  acknowledgedBy?: string;
  acknowledgedAt: Date;
  notes?: string;
}): Promise<any> {
  // Mock implementation
  return {
    id: params.alertId,
    acknowledged: true,
    acknowledgedBy: params.acknowledgedBy,
    acknowledgedAt: params.acknowledgedAt,
    notes: params.notes,
  };
}

/**
 * Resolve alert
 */
async function resolveAlert(params: {
  alertId: string;
  resolvedBy?: string;
  resolvedAt: Date;
  resolution?: string;
}): Promise<any> {
  // Mock implementation
  return {
    id: params.alertId,
    resolved: true,
    resolvedBy: params.resolvedBy,
    resolvedAt: params.resolvedAt,
    resolution: params.resolution,
  };
}

/**
 * Get alert statistics
 */
async function getAlertStatistics(params: {
  period: string;
  patientId?: string;
  userRole?: string;
}): Promise<any> {
  // Mock implementation
  return {
    total: 45,
    bySeverity: {
      low: 15,
      medium: 20,
      high: 8,
      critical: 2,
    },
    byType: {
      vitals: 30,
      medication: 10,
      appointment: 3,
      threshold: 2,
    },
    acknowledged: 38,
    resolved: 35,
    averageResponseTime: "15 minutes",
    period: params.period,
  };
}

/**
 * Bulk acknowledge alerts
 */
async function bulkAcknowledgeAlerts(params: {
  alertIds: string[];
  acknowledgedBy?: string;
  acknowledgedAt: Date;
  notes?: string;
}): Promise<{ acknowledged: number; failed: number }> {
  // Mock implementation
  return {
    acknowledged: params.alertIds.length,
    failed: 0,
  };
}

/**
 * Send alert notification
 */
async function sendAlertNotification(alert: any): Promise<void> {
  // Mock implementation - in real system:
  // 1. Determine notification preferences
  // 2. Send via email, SMS, push notification, etc.
  // 3. Log notification attempts

  console.log("Alert notification sent:", {
    alertId: alert.id,
    patientId: alert.patientId,
    severity: alert.severity,
    title: alert.title,
  });
}
