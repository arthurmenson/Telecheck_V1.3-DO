/**
 * HIPAA-compliant audit logging utilities
 */

import { createAuditLogEntry } from './redaction';

// Audit event types
export type AuditEventType = 
  | 'api_access'
  | 'phi_access'
  | 'phi_create'
  | 'phi_update'
  | 'phi_delete'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'permission_denied'
  | 'data_export'
  | 'admin_action'
  | 'system_access'
  | 'configuration_change';

export interface AuditEvent {
  userId?: string;
  action: AuditEventType;
  resource: string;
  method?: string;
  result?: 'success' | 'failure';
  details?: any;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
}

/**
 * Track audit event for compliance
 */
export async function trackAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const auditEntry = createAuditLogEntry({
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      result: event.result || 'success',
      details: {
        method: event.method,
        sessionId: event.sessionId,
        ...event.details
      },
      ip: event.ip,
      userAgent: event.userAgent,
      requestId: event.requestId
    });

    // Log to stdout (will be captured by log aggregation)
    console.log(JSON.stringify({
      type: 'audit',
      ...auditEntry
    }));

    // In production, also send to audit service or EventBridge
    if (process.env.NODE_ENV === 'production') {
      await sendToAuditService(auditEntry);
    }

  } catch (error) {
    // Never fail the main request due to audit logging issues
    console.error('Audit logging failed:', error);
  }
}

/**
 * Send audit event to external audit service or AWS EventBridge
 */
async function sendToAuditService(auditEntry: any): Promise<void> {
  try {
    const auditServiceUrl = process.env.AUDIT_SERVICE_URL;
    const eventBridgeArn = process.env.EVENTBRIDGE_ARN;

    if (auditServiceUrl) {
      // Send to dedicated audit service
      await fetch(`${auditServiceUrl}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AUDIT_SERVICE_TOKEN}`
        },
        body: JSON.stringify(auditEntry)
      });
    } else if (eventBridgeArn) {
      // Send to AWS EventBridge
      const { EventBridgeClient, PutEventsCommand } = await import('@aws-sdk/client-eventbridge');
      
      const client = new EventBridgeClient({
        region: process.env.AWS_REGION || 'us-east-1'
      });

      const command = new PutEventsCommand({
        Entries: [{
          Source: 'telecheck.audit',
          DetailType: 'Audit Event',
          Detail: JSON.stringify(auditEntry),
          EventBusName: eventBridgeArn
        }]
      });

      await client.send(command);
    }
  } catch (error) {
    console.error('Failed to send audit event to external service:', error);
  }
}

/**
 * Track PHI access specifically (high-risk operations)
 */
export async function trackPHIAccess(event: {
  userId: string;
  patientId: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'export';
  resource: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  await trackAuditEvent({
    userId: event.userId,
    action: 'phi_access',
    resource: event.resource,
    result: 'success',
    details: {
      patientId: event.patientId,
      phiAction: event.action,
      complianceFlag: 'HIPAA_PHI_ACCESS'
    },
    ip: event.ip,
    userAgent: event.userAgent,
    requestId: event.requestId
  });
}

/**
 * Track failed authentication attempts
 */
export async function trackAuthFailure(event: {
  email?: string;
  reason: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}): Promise<void> {
  await trackAuditEvent({
    action: 'login_failure',
    resource: '/auth/login',
    result: 'failure',
    details: {
      email: event.email,
      reason: event.reason,
      securityFlag: 'AUTH_FAILURE'
    },
    ip: event.ip,
    userAgent: event.userAgent,
    requestId: event.requestId
  });
}

/**
 * Track successful authentication
 */
export async function trackAuthSuccess(event: {
  userId: string;
  email: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}): Promise<void> {
  await trackAuditEvent({
    userId: event.userId,
    action: 'login_success',
    resource: '/auth/login',
    result: 'success',
    details: {
      email: event.email,
      securityFlag: 'AUTH_SUCCESS'
    },
    ip: event.ip,
    userAgent: event.userAgent,
    requestId: event.requestId
  });
}

/**
 * Track permission denied events
 */
export async function trackPermissionDenied(event: {
  userId?: string;
  resource: string;
  requiredPermissions: string[];
  userPermissions?: string[];
  ip?: string;
  userAgent?: string;
  requestId?: string;
}): Promise<void> {
  await trackAuditEvent({
    userId: event.userId,
    action: 'permission_denied',
    resource: event.resource,
    result: 'failure',
    details: {
      requiredPermissions: event.requiredPermissions,
      userPermissions: event.userPermissions,
      securityFlag: 'PERMISSION_DENIED'
    },
    ip: event.ip,
    userAgent: event.userAgent,
    requestId: event.requestId
  });
}

/**
 * Track administrative actions
 */
export async function trackAdminAction(event: {
  userId: string;
  action: string;
  resource: string;
  details?: any;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}): Promise<void> {
  await trackAuditEvent({
    userId: event.userId,
    action: 'admin_action',
    resource: event.resource,
    result: 'success',
    details: {
      adminAction: event.action,
      ...event.details,
      complianceFlag: 'ADMIN_ACTION'
    },
    ip: event.ip,
    userAgent: event.userAgent,
    requestId: event.requestId
  });
}

/**
 * Track data export events (for HIPAA compliance)
 */
export async function trackDataExport(event: {
  userId: string;
  dataType: string;
  recordCount: number;
  format: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}): Promise<void> {
  await trackAuditEvent({
    userId: event.userId,
    action: 'data_export',
    resource: '/export',
    result: 'success',
    details: {
      dataType: event.dataType,
      recordCount: event.recordCount,
      format: event.format,
      complianceFlag: 'DATA_EXPORT_HIPAA'
    },
    ip: event.ip,
    userAgent: event.userAgent,
    requestId: event.requestId
  });
}
