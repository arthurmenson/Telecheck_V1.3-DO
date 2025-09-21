/**
 * Audit logging utilities for RPM service
 */

// Re-export from gateway utils for consistency
export { trackAuditEvent } from '../../../gateway/src/utils/audit';

/**
 * Track RPM-specific events
 */
export async function trackRPMEvent(event: {
  userId?: string;
  action: string;
  resource: string;
  patientId?: string;
  details?: any;
  requestId?: string;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  console.log(JSON.stringify({
    type: 'rpm_audit',
    timestamp: new Date().toISOString(),
    service: 'rpm',
    ...event
  }));
}

/**
 * Track vital signs recording events
 */
export async function trackVitalsEvent(event: {
  userId: string;
  action: 'record' | 'update' | 'delete' | 'view';
  vitalsId: string;
  patientId: string;
  vitalTypes: string[];
  source: 'manual' | 'device' | 'wearable';
  details?: any;
  requestId?: string;
}): Promise<void> {
  await trackRPMEvent({
    userId: event.userId,
    action: `vitals_${event.action}`,
    resource: `/vitals/${event.vitalsId}`,
    patientId: event.patientId,
    details: {
      vitalsId: event.vitalsId,
      vitalTypes: event.vitalTypes,
      source: event.source,
      ...event.details
    },
    requestId: event.requestId
  });
}

/**
 * Track alert-related events
 */
export async function trackAlertEvent(event: {
  userId?: string;
  action: 'create' | 'acknowledge' | 'resolve' | 'escalate';
  alertId: string;
  patientId: string;
  severity: string;
  type: string;
  details?: any;
  requestId?: string;
}): Promise<void> {
  await trackRPMEvent({
    userId: event.userId,
    action: `alert_${event.action}`,
    resource: `/alerts/${event.alertId}`,
    patientId: event.patientId,
    details: {
      alertId: event.alertId,
      severity: event.severity,
      type: event.type,
      ...event.details
    },
    requestId: event.requestId
  });
}

/**
 * Track threshold management events
 */
export async function trackThresholdEvent(event: {
  userId: string;
  action: 'create' | 'update' | 'delete' | 'check';
  thresholdId?: string;
  patientId: string;
  vital: string;
  details?: any;
  requestId?: string;
}): Promise<void> {
  await trackRPMEvent({
    userId: event.userId,
    action: `threshold_${event.action}`,
    resource: event.thresholdId ? `/thresholds/${event.thresholdId}` : '/thresholds',
    patientId: event.patientId,
    details: {
      thresholdId: event.thresholdId,
      vital: event.vital,
      ...event.details
    },
    requestId: event.requestId
  });
}

/**
 * Track device integration events
 */
export async function trackDeviceEvent(event: {
  userId?: string;
  patientId: string;
  deviceId: string;
  action: 'connect' | 'disconnect' | 'sync' | 'error';
  deviceType: string;
  details?: any;
  requestId?: string;
}): Promise<void> {
  await trackRPMEvent({
    userId: event.userId,
    action: `device_${event.action}`,
    resource: `/devices/${event.deviceId}`,
    patientId: event.patientId,
    details: {
      deviceId: event.deviceId,
      deviceType: event.deviceType,
      ...event.details
    },
    requestId: event.requestId
  });
}
