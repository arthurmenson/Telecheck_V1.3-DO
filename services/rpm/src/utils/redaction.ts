/**
 * PII/PHI redaction utilities for RPM service
 */

// Re-export from gateway utils for consistency
export {
  redactString,
  redactObject,
  redactPII,
  hashIP,
  redactError,
  createAuditLogEntry,
} from "../../../gateway/src/utils/redaction";

/**
 * Redact vital signs data for logs
 */
export function redactVitalsData(vitals: any): any {
  if (!vitals || typeof vitals !== "object") {
    return vitals;
  }

  return {
    id: vitals.id,
    patientId: vitals.patientId
      ? `[PATIENT_${vitals.patientId.slice(-4)}]`
      : "[PATIENT_UNKNOWN]",
    recordedAt: vitals.recordedAt || "[UNKNOWN_TIME]",
    source: vitals.source || "unknown",
    vitalTypes: Object.keys(vitals).filter(
      (key) =>
        [
          "heartRate",
          "bloodPressureSystolic",
          "bloodPressureDiastolic",
          "temperature",
          "oxygenSaturation",
          "weight",
          "height",
        ].includes(key) &&
        vitals[key] !== undefined &&
        vitals[key] !== null,
    ),
    hasVitals: true,
  };
}

/**
 * Redact alert information for logs
 */
export function redactAlertData(alert: any): any {
  if (!alert || typeof alert !== "object") {
    return alert;
  }

  return {
    id: alert.id,
    patientId: alert.patientId
      ? `[PATIENT_${alert.patientId.slice(-4)}]`
      : "[PATIENT_UNKNOWN]",
    type: alert.type || "unknown",
    severity: alert.severity || "unknown",
    title: alert.title
      ? `[ALERT_TITLE_${alert.title.length}_CHARS]`
      : "[NO_TITLE]",
    messageLength: alert.message ? alert.message.length : 0,
    triggeredAt: alert.triggeredAt || "[UNKNOWN_TIME]",
    acknowledged: alert.acknowledged || false,
    resolved: alert.resolved || false,
  };
}

/**
 * Redact threshold configuration for logs
 */
export function redactThresholdData(threshold: any): any {
  if (!threshold || typeof threshold !== "object") {
    return threshold;
  }

  return {
    id: threshold.id,
    patientId: threshold.patientId
      ? `[PATIENT_${threshold.patientId.slice(-4)}]`
      : "[PATIENT_UNKNOWN]",
    vital: threshold.vital || "unknown",
    hasMin: threshold.min !== null && threshold.min !== undefined,
    hasMax: threshold.max !== null && threshold.max !== undefined,
    enabled: threshold.enabled || false,
    createdAt: threshold.createdAt || "[UNKNOWN_TIME]",
  };
}

/**
 * Redact device information for logs
 */
export function redactDeviceData(device: any): any {
  if (!device || typeof device !== "object") {
    return device;
  }

  return {
    id: device.id,
    patientId: device.patientId
      ? `[PATIENT_${device.patientId.slice(-4)}]`
      : "[PATIENT_UNKNOWN]",
    type: device.type || "unknown",
    manufacturer: device.manufacturer || "unknown",
    model: device.model ? `[MODEL_${device.model.length}_CHARS]` : "[NO_MODEL]",
    isConnected: device.isConnected || false,
    lastSync: device.lastSync || "[UNKNOWN_TIME]",
    serialNumber: device.serialNumber ? "[SERIAL_REDACTED]" : "[NO_SERIAL]",
  };
}

/**
 * Redact patient RPM summary for logs
 */
export function redactRPMSummary(summary: any): any {
  if (!summary || typeof summary !== "object") {
    return summary;
  }

  return {
    patientId: summary.patientId
      ? `[PATIENT_${summary.patientId.slice(-4)}]`
      : "[PATIENT_UNKNOWN]",
    timeframe: summary.timeframe || "unknown",
    vitalsCount: summary.vitalsCount || 0,
    alertsCount: summary.alertsCount || 0,
    devicesCount: summary.devicesCount || 0,
    complianceScore: summary.complianceScore || 0,
    lastActivity: summary.lastActivity || "[UNKNOWN_TIME]",
  };
}
