import { messagingService, CareTeamMember } from './messagingService';
import { AuditLogger } from './auditLogger';

export interface PatientCareTeam {
  patientId: string;
  patientName: string;
  patientPhone: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  primaryPhysician: CareTeamMember;
  careCoordinator: CareTeamMember;
  specialists: CareTeamMember[];
  onCallProvider: CareTeamMember;
  escalationRules: {
    level1: CareTeamMember[];
    level2: CareTeamMember[];
    level3: CareTeamMember[];
  };
}

export interface AlertContext {
  alertType: 'critical_hypoglycemia' | 'severe_hyperglycemia' | 'device_disconnected' | 'medication_missed' | 'emergency_response' | 'wound_deterioration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
  requiresImmediate: boolean;
  escalationDelay: number; // minutes
}

// Mock care team data - in production this would come from database
const mockCareTeams: PatientCareTeam[] = [
  {
    patientId: 'rpm_001',
    patientName: 'Margaret Thompson',
    patientPhone: '+15551234567',
    emergencyContact: {
      name: 'John Thompson',
      phone: '+15551234568',
      relationship: 'Spouse'
    },
    primaryPhysician: {
      id: 'provider_001',
      name: 'Dr. Sarah Chen',
      role: 'physician',
      phoneNumber: '+15551234569',
      email: 'sarah.chen@clinic.com',
      department: 'Endocrinology',
      onCall: false,
      priority: 1,
      escalationOrder: 1,
      specialties: ['Diabetes', 'Endocrinology'],
      availableHours: {
        start: '08:00',
        end: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    },
    careCoordinator: {
      id: 'provider_002',
      name: 'Maria Rodriguez, RN',
      role: 'care_coordinator',
      phoneNumber: '+15551234570',
      email: 'maria.rodriguez@clinic.com',
      department: 'Care Coordination',
      onCall: true,
      priority: 2,
      escalationOrder: 2,
      specialties: ['Care Coordination', 'Patient Education'],
      availableHours: {
        start: '07:00',
        end: '19:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      }
    },
    specialists: [
      {
        id: 'provider_003',
        name: 'Dr. Michael Kim',
        role: 'diabetes_educator',
        phoneNumber: '+15551234571',
        email: 'michael.kim@clinic.com',
        department: 'Diabetes Education',
        onCall: false,
        priority: 3,
        escalationOrder: 3,
        specialties: ['Diabetes Education', 'Nutrition'],
        availableHours: {
          start: '09:00',
          end: '16:00',
          days: ['monday', 'wednesday', 'friday']
        }
      }
    ],
    onCallProvider: {
      id: 'provider_004',
      name: 'Dr. Lisa Williams',
      role: 'physician',
      phoneNumber: '+15551234572',
      email: 'lisa.williams@clinic.com',
      department: 'Internal Medicine',
      onCall: true,
      priority: 1,
      escalationOrder: 4,
      specialties: ['Internal Medicine', 'Emergency Care'],
      availableHours: {
        start: '00:00',
        end: '23:59',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }
    },
    escalationRules: {
      level1: [], // Will be populated based on alert type
      level2: [], // Will be populated based on alert type
      level3: []  // Will be populated based on alert type
    }
  }
];

export class CareTeamService {
  private careTeams: Map<string, PatientCareTeam> = new Map();
  private activeAlerts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Initialize with mock data
    mockCareTeams.forEach(team => {
      this.careTeams.set(team.patientId, team);
    });
  }

  /**
   * Get care team for a patient
   */
  getCareTeam(patientId: string): PatientCareTeam | undefined {
    return this.careTeams.get(patientId);
  }

  /**
   * Send alert to appropriate care team members
   */
  async sendAlert(patientId: string, context: AlertContext): Promise<{
    success: boolean;
    notificationsSent: number;
    errors: string[];
  }> {
    const careTeam = this.getCareTeam(patientId);
    if (!careTeam) {
      return {
        success: false,
        notificationsSent: 0,
        errors: ['Care team not found for patient']
      };
    }

    console.log(`🚨 Sending ${context.alertType} alert for patient ${careTeam.patientName}`);

    // Determine alert recipients based on alert type and priority
    const recipients = this.getAlertRecipients(careTeam, context);
    
    // Log the alert initiation
    AuditLogger.logMedicalEvent(patientId, 'care_team_alert_initiated', {
      alertType: context.alertType,
      priority: context.priority,
      recipientCount: recipients.length,
      data: context.data
    });

    const results = [];
    const errors = [];

    // Send immediate alerts
    for (const recipient of recipients) {
      try {
        const result = await messagingService.sendMessage({
          to: recipient.phoneNumber,
          message: this.buildAlertMessage(careTeam, context, recipient),
          type: context.priority === 'critical' ? 'voice' : 'sms',
          priority: context.priority,
          patientId,
          providerId: recipient.id,
          category: context.priority === 'critical' ? 'emergency' : 'alert',
          template: this.getMessageTemplate(context.alertType),
          variables: {
            patientName: careTeam.patientName,
            patientPhone: careTeam.patientPhone,
            ...context.data
          }
        });

        results.push(result);

        // For critical alerts, also send SMS if we sent voice
        if (context.priority === 'critical') {
          const smsResult = await messagingService.sendMessage({
            to: recipient.phoneNumber,
            message: this.buildAlertMessage(careTeam, context, recipient),
            type: 'sms',
            priority: 'critical',
            patientId,
            providerId: recipient.id,
            category: 'emergency',
            template: this.getMessageTemplate(context.alertType),
            variables: {
              patientName: careTeam.patientName,
              patientPhone: careTeam.patientPhone,
              ...context.data
            }
          });
          results.push(smsResult);
        }
      } catch (error) {
        console.error(`❌ Failed to send alert to ${recipient.name}:`, error);
        errors.push(`Failed to notify ${recipient.name}: ${error}`);
      }
    }

    // Schedule escalation if critical and requires immediate response
    if (context.requiresImmediate && context.priority === 'critical') {
      this.scheduleEscalation(patientId, careTeam, context);
    }

    const successCount = results.filter(r => r.success).length;

    return {
      success: successCount > 0,
      notificationsSent: successCount,
      errors
    };
  }

  /**
   * Send daily reminders to care team about patients needing attention
   */
  async sendDailyCareTeamUpdates(): Promise<void> {
    console.log('📅 Sending daily care team updates...');

    for (const [patientId, careTeam] of this.careTeams.entries()) {
      // Mock patient data - in production, get from database
      const patientUpdates = this.generateDailyUpdate(careTeam);

      if (patientUpdates.requiresAttention) {
        await messagingService.sendMessage({
          to: careTeam.careCoordinator.phoneNumber,
          message: patientUpdates.message,
          type: 'sms',
          priority: 'low',
          patientId,
          providerId: careTeam.careCoordinator.id,
          category: 'education'
        });
      }
    }
  }

  /**
   * Handle emergency escalation when alerts are not acknowledged
   */
  private scheduleEscalation(patientId: string, careTeam: PatientCareTeam, context: AlertContext): void {
    const escalationId = `escalation_${patientId}_${Date.now()}`;

    // Level 1 escalation - notify on-call provider
    const level1Timer = setTimeout(async () => {
      console.log(`⚠️ Level 1 escalation for patient ${careTeam.patientName}`);
      
      await messagingService.sendMessage({
        to: careTeam.onCallProvider.phoneNumber,
        message: `🚨 ESCALATION: No response to critical alert for ${careTeam.patientName}. ${context.data.value || ''} ${context.data.unit || ''}. Patient phone: ${careTeam.patientPhone}`,
        type: 'voice',
        priority: 'critical',
        patientId,
        providerId: careTeam.onCallProvider.id,
        category: 'emergency'
      });

      this.activeAlerts.delete(`${escalationId}_level1`);
    }, context.escalationDelay * 60 * 1000);

    // Level 2 escalation - notify emergency contact
    const level2Timer = setTimeout(async () => {
      console.log(`🚨 Level 2 escalation for patient ${careTeam.patientName}`);
      
      if (careTeam.emergencyContact) {
        await messagingService.sendMessage({
          to: careTeam.emergencyContact.phone,
          message: `🚨 EMERGENCY: ${careTeam.patientName} has a critical health alert and care team has not responded. Please contact them immediately at ${careTeam.patientPhone} or call 911.`,
          type: 'voice',
          priority: 'critical',
          patientId,
          category: 'emergency'
        });
      }

      this.activeAlerts.delete(`${escalationId}_level2`);
    }, (context.escalationDelay * 2) * 60 * 1000);

    this.activeAlerts.set(`${escalationId}_level1`, level1Timer);
    this.activeAlerts.set(`${escalationId}_level2`, level2Timer);
  }

  /**
   * Get appropriate alert recipients based on alert type and time
   */
  private getAlertRecipients(careTeam: PatientCareTeam, context: AlertContext): CareTeamMember[] {
    const recipients: CareTeamMember[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const isBusinessHours = currentHour >= 8 && currentHour < 17;
    const currentDay = now.toLocaleDateString('en-us', { weekday: 'long' }).toLowerCase();

    switch (context.alertType) {
      case 'critical_hypoglycemia':
      case 'severe_hyperglycemia':
        // Critical glucose alerts go to all available providers
        if (isBusinessHours) {
          recipients.push(careTeam.primaryPhysician);
          recipients.push(careTeam.careCoordinator);
        } else {
          recipients.push(careTeam.onCallProvider);
        }
        break;

      case 'medication_missed':
        // Medication alerts go to care coordinator during business hours
        if (this.isProviderAvailable(careTeam.careCoordinator, currentDay, currentHour)) {
          recipients.push(careTeam.careCoordinator);
        }
        break;

      case 'device_disconnected':
        // Device alerts go to care coordinator
        recipients.push(careTeam.careCoordinator);
        break;

      case 'wound_deterioration':
        // Wound alerts go to primary physician and care coordinator
        recipients.push(careTeam.primaryPhysician);
        recipients.push(careTeam.careCoordinator);
        break;

      case 'emergency_response':
        // Emergency responses go to all available providers
        recipients.push(careTeam.onCallProvider);
        if (isBusinessHours) {
          recipients.push(careTeam.primaryPhysician);
        }
        break;

      default:
        // Default to care coordinator
        recipients.push(careTeam.careCoordinator);
    }

    return recipients.filter((recipient, index, self) => 
      self.findIndex(r => r.id === recipient.id) === index
    ); // Remove duplicates
  }

  /**
   * Check if a provider is available based on schedule
   */
  private isProviderAvailable(provider: CareTeamMember, day: string, hour: number): boolean {
    if (provider.onCall) return true;

    if (!provider.availableHours.days.includes(day)) {
      return false;
    }

    const startHour = parseInt(provider.availableHours.start.split(':')[0]);
    const endHour = parseInt(provider.availableHours.end.split(':')[0]);

    return hour >= startHour && hour < endHour;
  }

  /**
   * Build alert message for specific provider
   */
  private buildAlertMessage(careTeam: PatientCareTeam, context: AlertContext, recipient: CareTeamMember): string {
    const baseMessage = `🚨 ${context.priority.toUpperCase()} ALERT: ${careTeam.patientName}`;
    
    switch (context.alertType) {
      case 'critical_hypoglycemia':
        return `${baseMessage} - Blood glucose critically low at ${context.data.value} mg/dL. Patient phone: ${careTeam.patientPhone}`;
      
      case 'severe_hyperglycemia':
        return `${baseMessage} - Blood glucose severely high at ${context.data.value} mg/dL. Patient phone: ${careTeam.patientPhone}`;
      
      case 'medication_missed':
        return `${baseMessage} - Missed medication: ${context.data.medicationName}. Patient phone: ${careTeam.patientPhone}`;
      
      case 'device_disconnected':
        return `${baseMessage} - ${context.data.deviceName} disconnected for ${context.data.duration}. Patient phone: ${careTeam.patientPhone}`;
      
      case 'wound_deterioration':
        return `${baseMessage} - Diabetic wound showing deterioration. Location: ${context.data.location}. Patient phone: ${careTeam.patientPhone}`;
      
      case 'emergency_response':
        return `${baseMessage} - Patient sent emergency response via SMS. Immediate contact required: ${careTeam.patientPhone}`;
      
      default:
        return `${baseMessage} - Health alert requires attention. Patient phone: ${careTeam.patientPhone}`;
    }
  }

  /**
   * Get message template for alert type
   */
  private getMessageTemplate(alertType: string): string {
    switch (alertType) {
      case 'critical_hypoglycemia':
        return 'care_team_emergency';
      case 'severe_hyperglycemia':
        return 'care_team_emergency';
      default:
        return 'care_team_alert';
    }
  }

  /**
   * Generate daily update for care team
   */
  private generateDailyUpdate(careTeam: PatientCareTeam): {
    requiresAttention: boolean;
    message: string;
  } {
    // Mock logic - in production, analyze patient data from last 24 hours
    const mockRequiresAttention = Math.random() > 0.7; // 30% chance needs attention
    
    if (mockRequiresAttention) {
      return {
        requiresAttention: true,
        message: `📋 Daily Update: ${careTeam.patientName} - Glucose readings trending high. Missed 1 medication dose. Consider medication adjustment or patient outreach.`
      };
    }

    return {
      requiresAttention: false,
      message: ''
    };
  }

  /**
   * Add new care team member
   */
  addCareTeamMember(patientId: string, member: CareTeamMember): boolean {
    const careTeam = this.getCareTeam(patientId);
    if (!careTeam) return false;

    careTeam.specialists.push(member);
    this.careTeams.set(patientId, careTeam);

    AuditLogger.logSystemEvent('care_team', 'member_added', {
      patientId,
      memberId: member.id,
      memberName: member.name,
      role: member.role
    });

    return true;
  }

  /**
   * Update care team member availability
   */
  updateMemberAvailability(patientId: string, memberId: string, onCall: boolean): boolean {
    const careTeam = this.getCareTeam(patientId);
    if (!careTeam) return false;

    // Update in all possible locations
    const allMembers = [
      careTeam.primaryPhysician,
      careTeam.careCoordinator,
      careTeam.onCallProvider,
      ...careTeam.specialists
    ];

    const member = allMembers.find(m => m.id === memberId);
    if (member) {
      member.onCall = onCall;
      this.careTeams.set(patientId, careTeam);

      AuditLogger.logSystemEvent('care_team', 'availability_updated', {
        patientId,
        memberId,
        onCall
      });

      return true;
    }

    return false;
  }

  /**
   * Get care team statistics
   */
  getCareTeamStats(): {
    totalCareTeams: number;
    totalProviders: number;
    onCallProviders: number;
    avgResponseTime: number;
  } {
    const totalCareTeams = this.careTeams.size;
    let totalProviders = 0;
    let onCallProviders = 0;

    for (const [, careTeam] of this.careTeams.entries()) {
      const allMembers = [
        careTeam.primaryPhysician,
        careTeam.careCoordinator,
        careTeam.onCallProvider,
        ...careTeam.specialists
      ];

      // Remove duplicates
      const uniqueMembers = allMembers.filter((member, index, self) => 
        self.findIndex(m => m.id === member.id) === index
      );

      totalProviders += uniqueMembers.length;
      onCallProviders += uniqueMembers.filter(m => m.onCall).length;
    }

    return {
      totalCareTeams,
      totalProviders,
      onCallProviders,
      avgResponseTime: 3.2 // Mock average response time in minutes
    };
  }
}

// Export singleton instance
export const careTeamService = new CareTeamService();
