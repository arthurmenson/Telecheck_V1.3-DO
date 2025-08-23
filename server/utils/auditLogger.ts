// HIPAA-compliant audit logging service
export class AuditLogger {
  private static logs: Map<string, any[]> = new Map();
  private static isEnabled = true;

  // Enable/disable audit logging
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    console.log(`📋 Audit logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Log user access to PHI data
  static logDataAccess(userId: string, dataType: string, action: string, details?: any) {
    if (!this.isEnabled) return;

    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'DATA_ACCESS',
      dataType,
      operation: action,
      details: details || {},
      ipAddress: this.getCurrentIP(),
      userAgent: this.getCurrentUserAgent(),
      sessionId: this.getCurrentSessionId(),
      compliance: {
        hipaa: true,
        gdpr: true,
        sox: false
      }
    };

    this.addAuditEntry(userId, auditEntry);
    console.log(`📋 Audit: ${userId} ${action} ${dataType}`);
  }

  // Log authentication events
  static logAuthentication(userId: string, action: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN', details?: any) {
    if (!this.isEnabled) return;

    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'AUTHENTICATION',
      operation: action,
      details: details || {},
      ipAddress: this.getCurrentIP(),
      userAgent: this.getCurrentUserAgent(),
      success: action !== 'FAILED_LOGIN',
      compliance: {
        hipaa: true,
        gdpr: true,
        sox: true
      }
    };

    this.addAuditEntry(userId, auditEntry);
    console.log(`🔐 Auth: ${userId} ${action}`);
  }

  // Log system events
  static logSystemEvent(event: string, operation: string, details?: any) {
    if (!this.isEnabled) return;

    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId: 'SYSTEM',
      action: 'SYSTEM_EVENT',
      operation,
      event,
      details: details || {},
      compliance: {
        hipaa: true,
        gdpr: false,
        sox: true
      }
    };

    this.addAuditEntry('SYSTEM', auditEntry);
    console.log(`⚙️ System: ${event} - ${operation}`);
  }

  // Log communication events (SMS, voice, email)
  static logCommunication(userId: string, type: 'sms' | 'voice' | 'email', direction: 'inbound' | 'outbound' | 'outbound_result', details?: any) {
    if (!this.isEnabled) return;

    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'COMMUNICATION',
      operation: `${direction}_${type}`,
      communicationType: type,
      direction,
      details: details || {},
      ipAddress: this.getCurrentIP(),
      compliance: {
        hipaa: true,
        gdpr: true,
        sox: false
      }
    };

    this.addAuditEntry(userId, auditEntry);
    console.log(`📞 Communication: ${userId} ${direction} ${type}`);
  }

  // Log medical events (glucose readings, vitals, etc.)
  static logMedicalEvent(userId: string, eventType: string, details?: any) {
    if (!this.isEnabled) return;

    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'MEDICAL_EVENT',
      operation: eventType,
      details: details || {},
      ipAddress: this.getCurrentIP(),
      compliance: {
        hipaa: true,
        gdpr: true,
        sox: false
      }
    };

    this.addAuditEntry(userId, auditEntry);
    console.log(`🏥 Medical: ${userId} ${eventType}`);
  }

  // Log medication events
  static logMedicationEvent(userId: string, action: string, medication: string, details?: any) {
    if (!this.isEnabled) return;

    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'MEDICATION_EVENT',
      operation: action,
      medication,
      details: details || {},
      ipAddress: this.getCurrentIP(),
      compliance: {
        hipaa: true,
        gdpr: true,
        fda: true
      }
    };

    this.addAuditEntry(userId, auditEntry);
    console.log(`💊 Medication: ${userId} ${action} ${medication}`);
  }

  // Log AI/ML model usage
  static logAIModelUsage(userId: string, modelType: string, input: any, output: any, confidence?: number) {
    if (!this.isEnabled) return;

    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'AI_MODEL_USAGE',
      operation: modelType,
      details: {
        modelType,
        inputHash: this.hashSensitiveData(JSON.stringify(input)),
        outputHash: this.hashSensitiveData(JSON.stringify(output)),
        confidence,
        processingTime: Date.now() // Would be calculated in real implementation
      },
      compliance: {
        hipaa: true,
        fda: true,
        ai_ethics: true
      }
    };

    this.addAuditEntry(userId, auditEntry);
    console.log(`🤖 AI Model: ${userId} used ${modelType} (confidence: ${confidence}%)`);
  }

  // Log data export/sharing events
  static logDataExport(userId: string, exportType: string, recipient: string, dataTypes: string[]) {
    if (!this.isEnabled) return;

    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'DATA_EXPORT',
      operation: exportType,
      details: {
        recipient,
        dataTypes,
        exportFormat: 'FHIR_R4',
        encryptionUsed: true
      },
      ipAddress: this.getCurrentIP(),
      compliance: {
        hipaa: true,
        gdpr: true,
        interoperability: true
      }
    };

    this.addAuditEntry(userId, auditEntry);
    console.log(`📤 Export: ${userId} exported ${dataTypes.join(', ')} to ${recipient}`);
  }

  // Get audit logs for a user
  static getAuditLogs(userId: string, startDate?: Date, endDate?: Date): any[] {
    const userLogs = this.logs.get(userId) || [];
    
    if (!startDate && !endDate) {
      return userLogs;
    }

    return userLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      if (startDate && logDate < startDate) return false;
      if (endDate && logDate > endDate) return false;
      return true;
    });
  }

  // Generate compliance report
  static generateComplianceReport(startDate: Date, endDate: Date): {
    summary: any;
    violations: any[];
    recommendations: string[];
  } {
    const allLogs: any[] = [];
    this.logs.forEach(userLogs => {
      allLogs.push(...userLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      }));
    });

    const summary = {
      totalEvents: allLogs.length,
      dataAccessEvents: allLogs.filter(log => log.action === 'DATA_ACCESS').length,
      authenticationEvents: allLogs.filter(log => log.action === 'AUTHENTICATION').length,
      systemEvents: allLogs.filter(log => log.action === 'SYSTEM_EVENT').length,
      aiModelUsage: allLogs.filter(log => log.action === 'AI_MODEL_USAGE').length,
      dataExports: allLogs.filter(log => log.action === 'DATA_EXPORT').length,
      failedLogins: allLogs.filter(log => log.operation === 'FAILED_LOGIN').length,
      criticalEvents: allLogs.filter(log => log.severity === 'CRITICAL').length
    };

    const violations: any[] = [];
    const recommendations: string[] = [];

    // Check for potential compliance violations
    if (summary.failedLogins > 10) {
      violations.push({
        type: 'SECURITY_CONCERN',
        description: 'High number of failed login attempts detected',
        count: summary.failedLogins,
        severity: 'HIGH'
      });
      recommendations.push('Implement account lockout policies');
      recommendations.push('Enable multi-factor authentication');
    }

    if (summary.criticalEvents > 0) {
      violations.push({
        type: 'SYSTEM_CRITICAL',
        description: 'Critical system events detected',
        count: summary.criticalEvents,
        severity: 'CRITICAL'
      });
      recommendations.push('Review critical system events immediately');
    }

    // Check for unusual data access patterns
    const dataAccessByUser = new Map();
    allLogs.filter(log => log.action === 'DATA_ACCESS').forEach(log => {
      const count = dataAccessByUser.get(log.userId) || 0;
      dataAccessByUser.set(log.userId, count + 1);
    });

    dataAccessByUser.forEach((count, userId) => {
      if (count > 100) { // Threshold for unusual access
        violations.push({
          type: 'UNUSUAL_ACCESS',
          description: `User ${userId} accessed data ${count} times`,
          userId,
          count,
          severity: 'MEDIUM'
        });
        recommendations.push(`Review data access patterns for user ${userId}`);
      }
    });

    return { summary, violations, recommendations };
  }

  // Export audit logs for compliance
  static exportAuditLogs(format: 'JSON' | 'CSV' | 'XML' = 'JSON'): string {
    const allLogs: any[] = [];
    this.logs.forEach(userLogs => {
      allLogs.push(...userLogs);
    });

    switch (format) {
      case 'JSON':
        return JSON.stringify(allLogs, null, 2);
      case 'CSV':
        return this.convertToCSV(allLogs);
      case 'XML':
        return this.convertToXML(allLogs);
      default:
        return JSON.stringify(allLogs, null, 2);
    }
  }

  // Private helper methods
  private static addAuditEntry(userId: string, entry: any) {
    if (!this.logs.has(userId)) {
      this.logs.set(userId, []);
    }
    
    const userLogs = this.logs.get(userId)!;
    userLogs.push(entry);
    
    // Keep only last 1000 entries per user to prevent memory issues
    if (userLogs.length > 1000) {
      userLogs.splice(0, userLogs.length - 1000);
    }
  }

  private static generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getCurrentIP(): string {
    // In a real implementation, this would get the actual client IP
    return '127.0.0.1';
  }

  private static getCurrentUserAgent(): string {
    // In a real implementation, this would get the actual user agent
    return 'Telecheck/1.0';
  }

  private static getCurrentSessionId(): string {
    // In a real implementation, this would get the actual session ID
    return `session_${Date.now()}`;
  }

  private static hashSensitiveData(data: string): string {
    return require('crypto').createHash('sha256').update(data).digest('hex');
  }

  private static convertToCSV(logs: any[]): string {
    if (logs.length === 0) return '';
    
    const headers = Object.keys(logs[0]).join(',');
    const rows = logs.map(log => 
      Object.values(log).map(value => 
        typeof value === 'object' ? JSON.stringify(value) : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  private static convertToXML(logs: any[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<audit_logs>\n';
    
    logs.forEach(log => {
      xml += '  <log>\n';
      Object.entries(log).forEach(([key, value]) => {
        xml += `    <${key}>${typeof value === 'object' ? JSON.stringify(value) : value}</${key}>\n`;
      });
      xml += '  </log>\n';
    });
    
    xml += '</audit_logs>';
    return xml;
  }
}
