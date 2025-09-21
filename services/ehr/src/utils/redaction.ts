/**
 * PII/PHI redaction utilities for EHR service
 */

// Re-export from gateway utils for consistency
export { 
  redactString, 
  redactObject, 
  redactPII, 
  hashIP, 
  redactError,
  createAuditLogEntry 
} from '../../../gateway/src/utils/redaction';

/**
 * Redact EHR-specific sensitive data
 */
export function redactEHRData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'medicalRecordNumber',
    'patientId',
    'insuranceNumber',
    'policyNumber',
    'memberNumber',
    'medicalHistory',
    'allergies',
    'medications',
    'symptoms',
    'diagnosis',
    'treatment',
    'notes'
  ];

  const redacted: any = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      redacted[key] = '[PHI_REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactEHRData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Redact patient information for logs
 */
export function redactPatientInfo(patient: any): any {
  if (!patient) return patient;

  return {
    id: patient.id ? `[PATIENT_${patient.id.slice(-4)}]` : '[PATIENT_UNKNOWN]',
    initials: patient.name ? getInitials(patient.name) : '[UNKNOWN]',
    ageGroup: patient.dateOfBirth ? getAgeGroup(patient.dateOfBirth) : '[UNKNOWN]',
    gender: patient.gender || '[UNKNOWN]'
  };
}

/**
 * Get initials from full name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('.');
}

/**
 * Get age group instead of exact age
 */
function getAgeGroup(dateOfBirth: string): string {
  const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  
  if (age < 18) return 'MINOR';
  if (age < 30) return '18-29';
  if (age < 50) return '30-49';
  if (age < 65) return '50-64';
  return '65+';
}

/**
 * Redact appointment details for logs
 */
export function redactAppointmentInfo(appointment: any): any {
  if (!appointment) return appointment;

  return {
    id: appointment.id,
    type: appointment.appointmentType || 'UNKNOWN',
    status: appointment.status || 'UNKNOWN',
    date: appointment.scheduledTime ? 
      new Date(appointment.scheduledTime).toDateString() : 'UNKNOWN',
    provider: appointment.providerId ? 
      `[PROVIDER_${appointment.providerId.slice(-4)}]` : '[PROVIDER_UNKNOWN]'
  };
}

/**
 * Redact message content for logs
 */
export function redactMessageContent(message: any): any {
  if (!message) return message;

  return {
    id: message.id,
    subject: message.subject || '[NO_SUBJECT]',
    contentLength: message.content ? message.content.length : 0,
    priority: message.priority || 'NORMAL',
    hasAttachments: message.attachments && message.attachments.length > 0,
    timestamp: message.sentAt || message.createdAt
  };
}
