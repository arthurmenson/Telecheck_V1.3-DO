/**
 * Audit logging utilities for EHR service
 */

// Re-export from gateway utils for consistency
export { trackAuditEvent, trackPHIAccess } from '../../../gateway/src/utils/audit';

/**
 * Track EHR-specific events
 */
export async function trackEHREvent(event: {
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
    type: 'ehr_audit',
    timestamp: new Date().toISOString(),
    service: 'ehr',
    ...event
  }));
}

/**
 * Track appointment-related events
 */
export async function trackAppointmentEvent(event: {
  userId: string;
  action: 'book' | 'cancel' | 'reschedule' | 'complete';
  appointmentId: string;
  patientId: string;
  providerId: string;
  details?: any;
  requestId?: string;
}): Promise<void> {
  await trackEHREvent({
    userId: event.userId,
    action: `appointment_${event.action}`,
    resource: `/appointments/${event.appointmentId}`,
    patientId: event.patientId,
    details: {
      appointmentId: event.appointmentId,
      providerId: event.providerId,
      ...event.details
    },
    requestId: event.requestId
  });
}

/**
 * Track intake form events
 */
export async function trackIntakeEvent(event: {
  userId: string;
  action: 'submit' | 'update' | 'complete' | 'delete';
  intakeId: string;
  patientId: string;
  details?: any;
  requestId?: string;
}): Promise<void> {
  await trackEHREvent({
    userId: event.userId,
    action: `intake_${event.action}`,
    resource: `/intake/${event.intakeId}`,
    patientId: event.patientId,
    details: {
      intakeId: event.intakeId,
      ...event.details
    },
    requestId: event.requestId
  });
}

/**
 * Track provider access events
 */
export async function trackProviderEvent(event: {
  userId: string;
  action: 'view' | 'create' | 'update' | 'deactivate';
  providerId: string;
  details?: any;
  requestId?: string;
}): Promise<void> {
  await trackEHREvent({
    userId: event.userId,
    action: `provider_${event.action}`,
    resource: `/providers/${event.providerId}`,
    details: {
      providerId: event.providerId,
      ...event.details
    },
    requestId: event.requestId
  });
}
