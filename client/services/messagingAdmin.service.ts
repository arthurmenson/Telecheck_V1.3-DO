export interface MessagingConfig {
  primaryProvider: 'telnyx' | 'twilio';
  enableSMS: boolean;
  enableVoice: boolean;
  enableScheduled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  maxRetries: number;
  retryDelay: number;
  auditLogging: boolean;
  thresholds: {
    glucoseLow: number;
    glucoseHigh: number;
    bpSystolicHigh: number;
    bpDiastolicHigh: number;
    heartRateHigh: number;
    heartRateLow: number;
    temperatureHigh: number;
    temperatureLow: number;
    oxygenSatLow: number;
  };
  careTeam: {
    enableAlerts: boolean;
    escalationTimeout: number;
    maxEscalationLevels: number;
  };
}

export interface PatientSchedule {
  id: string;
  patientId: string;
  active: boolean;
  scheduleData: any;
  createdAt: string;
  updatedAt: string;
  activeJobs: string[];
}

export interface MessageTemplate {
  id: string;
  type: string;
  name: string;
  content: string;
  variables: string[];
  isDefault?: boolean;
  active?: boolean;
}

export interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  priorityLevel: number;
  availability: any;
  preferences: any;
  active: boolean;
}

export interface MessagingAnalytics {
  period: string;
  overview: {
    totalMessages: number;
    successfulMessages: number;
    failedMessages: number;
    successRate: string;
  };
  providerStats: Array<{
    provider: string;
    type: string;
    count: number;
    success_rate: number;
  }>;
  scheduling: {
    totalActiveJobs: number;
    messagesSentToday: number;
    messagesFailedToday: number;
    activePatients: number;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  details: any;
  timestamp: string;
}

class MessagingAdminService {
  private baseUrl = '/api/admin/messaging';

  async getConfig(): Promise<{ success: boolean; config?: MessagingConfig; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/config`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching messaging config:', error);
      return { success: false, error: 'Failed to fetch configuration' };
    }
  }

  async updateConfig(config: Partial<MessagingConfig>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating messaging config:', error);
      return { success: false, error: 'Failed to update configuration' };
    }
  }

  async testService(provider: 'telnyx' | 'twilio' | 'auto', type: 'sms' | 'voice', phoneNumber: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, type, phoneNumber }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error testing messaging service:', error);
      return { success: false, error: 'Failed to test service' };
    }
  }

  async getAnalytics(period: '24h' | '7d' | '30d' = '24h'): Promise<{ success: boolean; analytics?: MessagingAnalytics; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics?period=${period}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { success: false, error: 'Failed to fetch analytics' };
    }
  }

  async getPatientSchedules(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
  } = {}): Promise<{ success: boolean; schedules?: PatientSchedule[]; pagination?: any; error?: string }> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/schedules?${searchParams}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching patient schedules:', error);
      return { success: false, error: 'Failed to fetch schedules' };
    }
  }

  async updatePatientSchedule(patientId: string, action: 'pause' | 'resume' | 'update', schedule?: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/schedules/${patientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, schedule }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating patient schedule:', error);
      return { success: false, error: 'Failed to update schedule' };
    }
  }

  async getMessageTemplates(): Promise<{ success: boolean; templates?: MessageTemplate[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching message templates:', error);
      return { success: false, error: 'Failed to fetch templates' };
    }
  }

  async updateMessageTemplate(templateId: string, template: Partial<MessageTemplate>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating message template:', error);
      return { success: false, error: 'Failed to update template' };
    }
  }

  async getCareTeamConfig(): Promise<{ success: boolean; careTeam?: { members: CareTeamMember[]; escalationRules: any[] }; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/care-team`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching care team config:', error);
      return { success: false, error: 'Failed to fetch care team configuration' };
    }
  }

  async updateCareTeamMember(memberId: string, member: Partial<CareTeamMember>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/care-team/${memberId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating care team member:', error);
      return { success: false, error: 'Failed to update care team member' };
    }
  }

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{ success: boolean; logs?: AuditLog[]; pagination?: any; error?: string }> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/audit-logs?${searchParams}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { success: false, error: 'Failed to fetch audit logs' };
    }
  }

  async sendWellnessCheck(patientId: string, patientName: string, phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/wellness-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientId, patientName, phoneNumber }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending wellness check:', error);
      return { success: false, error: 'Failed to send wellness check' };
    }
  }
}

export const messagingAdminService = new MessagingAdminService();
