import { telnyxService } from "./telnyxService";
import { twilioService } from "./twilioService";
import { AuditLogger } from "./auditLogger";
import { thresholdService, ThresholdAlert } from "./thresholdService";

export interface MessageRequest {
  to: string;
  message: string;
  type: "sms" | "voice" | "email";
  priority: "low" | "medium" | "high" | "critical";
  patientId?: string;
  providerId?: string;
  category:
    | "reminder"
    | "alert"
    | "emergency"
    | "appointment"
    | "medication"
    | "education"
    | "system";
  template?: string;
  variables?: Record<string, string>;
  retryAttempts?: number;
  scheduledFor?: string;
  escalationRules?: EscalationRule[];
}

export interface EscalationRule {
  delay: number; // minutes
  recipient: string;
  method: "sms" | "voice" | "email";
  message: string;
}

export interface MessageResponse {
  success: boolean;
  messageId?: string;
  provider: "telnyx" | "twilio" | "email";
  error?: string;
  retryable?: boolean;
  cost?: number;
  deliveryStatus?: "pending" | "sent" | "delivered" | "failed";
}

export interface Contact {
  id: string;
  name: string;
  role:
    | "patient"
    | "provider"
    | "care_coordinator"
    | "emergency_contact"
    | "family";
  phoneNumber?: string;
  email?: string;
  preferredMethod: "sms" | "voice" | "email" | "any";
  emergencyContact?: boolean;
  active: boolean;
  timezone?: string;
  quietHours?: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

export interface CareTeamMember {
  id: string;
  name: string;
  role:
    | "physician"
    | "nurse"
    | "care_coordinator"
    | "diabetes_educator"
    | "pharmacist"
    | "social_worker";
  phoneNumber: string;
  email: string;
  department: string;
  onCall: boolean;
  priority: number; // 1 = highest priority
  escalationOrder: number;
  specialties: string[];
  availableHours: {
    start: string;
    end: string;
    days: string[]; // ['monday', 'tuesday', etc.]
  };
}

// Message templates for different scenarios
const MESSAGE_TEMPLATES = {
  // Critical alerts
  critical_hypoglycemia: {
    sms: "🚨 URGENT: {patientName}'s blood sugar is critically low at {value} mg/dL. Take 15g fast-acting carbs immediately. Call 911 if symptoms persist.",
    voice:
      "This is an urgent medical alert. {patientName}'s blood glucose is critically low at {value} milligrams per deciliter. Please take 15 grams of fast-acting carbohydrates immediately and call 911 if symptoms persist.",
    email: "URGENT MEDICAL ALERT: Critical Hypoglycemia",
  },
  care_team_emergency: {
    sms: "🚨 EMERGENCY: Patient {patientName} has critical glucose level {value} mg/dL. Immediate intervention required. Call patient at {patientPhone}.",
    voice:
      "Emergency alert. Patient {patientName} has a critical glucose level of {value} milligrams per deciliter. Immediate medical intervention is required. Please contact the patient immediately at {patientPhone}.",
    email: "EMERGENCY: Critical Patient Alert - Immediate Action Required",
  },

  // Daily reminders
  medication_reminder: {
    sms: "💊 Reminder: Time to take your {medicationName} ({dosage}). Reply TAKEN when complete. Questions? Call your care team.",
    voice:
      "This is a medication reminder. It's time to take your {medicationName}, {dosage}. Please take your medication now and contact your care team if you have any questions.",
    email: "Daily Medication Reminder",
  },
  glucose_check_reminder: {
    sms: "🩸 Reminder: Please check your blood glucose and log the reading in your app. Your care team is monitoring your progress.",
    voice:
      "This is a reminder to check your blood glucose level and log the reading in your mobile application. Your healthcare team is monitoring your progress.",
    email: "Blood Glucose Check Reminder",
  },

  // Appointment reminders
  appointment_24h: {
    sms: "📅 Reminder: You have an appointment tomorrow at {time} with {provider}. Reply CONFIRM or call {phone} to reschedule.",
    voice:
      "This is a reminder that you have a medical appointment tomorrow at {time} with {provider}. Please call {phone} if you need to reschedule.",
    email: "Appointment Reminder - 24 Hours",
  },
  appointment_2h: {
    sms: "📅 Reminder: Your appointment with {provider} is in 2 hours at {time}. Please arrive 15 minutes early.",
    voice:
      "This is a reminder that your appointment with {provider} is in 2 hours at {time}. Please plan to arrive 15 minutes early.",
    email: "Appointment Reminder - 2 Hours",
  },

  // Device alerts
  device_battery_low: {
    sms: "🔋 Alert: Your {deviceName} battery is low ({battery}%). Please charge your device to continue monitoring.",
    voice:
      "This is a device alert. Your {deviceName} battery is low at {battery} percent. Please charge your device to continue health monitoring.",
    email: "Device Battery Alert",
  },
  device_disconnected: {
    sms: "📱 Alert: Your {deviceName} is disconnected. Please check your device connection to continue monitoring.",
    voice:
      "This is a device connectivity alert. Your {deviceName} is disconnected. Please check your device connection.",
    email: "Device Connectivity Alert",
  },

  // Care coordination
  care_plan_update: {
    sms: "📋 Update: Your care plan has been updated. Review changes in your patient portal or call {phone} with questions.",
    voice:
      "Your healthcare team has updated your care plan. Please review the changes in your patient portal or call {phone} if you have any questions.",
    email: "Care Plan Update Notification",
  },
  lab_results_ready: {
    sms: "🧪 Your lab results are ready. Log into your patient portal to view results or call {phone} to discuss with your provider.",
    voice:
      "Your laboratory results are now available. Please log into your patient portal to view the results or call {phone} to discuss them with your healthcare provider.",
    email: "Lab Results Available",
  },
};

export class MessagingService {
  private readonly messageQueue: Map<string, MessageRequest> = new Map();
  private readonly escalationTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Initialize any background processes
    this.startQueueProcessor();
  }

  /**
   * Send message with automatic failover from Telnyx to Twilio
   */
  async sendMessage(request: MessageRequest): Promise<MessageResponse> {
    try {
      // Apply message template if specified
      const processedMessage = this.applyTemplate(request);

      // Log the message request
      AuditLogger.logCommunication(
        request.patientId || "system",
        request.type,
        "outbound",
        {
          recipient: request.to,
          category: request.category,
          priority: request.priority,
          template: request.template,
        },
      );

      let result: MessageResponse;

      // Route based on message type and try primary service first
      switch (request.type) {
        case "sms":
          result = await this.sendSMSWithFailover(request.to, processedMessage);
          break;
        case "voice":
          result = await this.sendVoiceWithFailover(
            request.to,
            processedMessage,
          );
          break;
        case "email":
          result = await this.sendEmail(request.to, processedMessage, request);
          break;
        default:
          throw new Error(`Unsupported message type: ${request.type}`);
      }

      // Schedule escalation if configured and message is critical
      if (
        request.escalationRules &&
        request.priority === "critical" &&
        !result.success
      ) {
        this.scheduleEscalation(request);
      }

      // Log the result
      AuditLogger.logCommunication(
        request.patientId || "system",
        request.type,
        "outbound_result",
        {
          success: result.success,
          provider: result.provider,
          messageId: result.messageId,
          error: result.error,
        },
      );

      return result;
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      return {
        success: false,
        provider: "none" as any,
        error: error instanceof Error ? error.message : "Unknown error",
        retryable: true,
      };
    }
  }

  /**
   * Send SMS with Telnyx primary, Twilio backup
   */
  private async sendSMSWithFailover(
    to: string,
    message: string,
  ): Promise<MessageResponse> {
    // Try Telnyx first
    const telnyxResult = await telnyxService.sendSMS(to, message);

    if (telnyxResult.success) {
      return {
        success: true,
        messageId: telnyxResult.messageId,
        provider: "telnyx",
        deliveryStatus: "sent",
      };
    }

    console.log("⚠️ Telnyx SMS failed, trying Twilio backup...");

    // Fallback to Twilio
    const twilioResult = await twilioService.sendSMS(to, message);

    if (twilioResult.success) {
      return {
        success: true,
        messageId: twilioResult.messageId,
        provider: "twilio",
        deliveryStatus: "sent",
      };
    }

    return {
      success: false,
      provider: "none" as any,
      error: `Both providers failed. Telnyx: ${telnyxResult.error}, Twilio: ${twilioResult.error}`,
      retryable: true,
    };
  }

  /**
   * Send voice message with Telnyx primary, Twilio backup
   */
  private async sendVoiceWithFailover(
    to: string,
    message: string,
  ): Promise<MessageResponse> {
    // Try Telnyx first
    const telnyxResult = await telnyxService.sendVoiceMessage(to, message);

    if (telnyxResult.success) {
      return {
        success: true,
        messageId: telnyxResult.callId,
        provider: "telnyx",
        deliveryStatus: "sent",
      };
    }

    console.log("⚠️ Telnyx voice failed, trying Twilio backup...");

    // Fallback to Twilio
    const twilioResult = await twilioService.sendVoiceMessage(to, message);

    if (twilioResult.success) {
      return {
        success: true,
        messageId: twilioResult.callId,
        provider: "twilio",
        deliveryStatus: "sent",
      };
    }

    return {
      success: false,
      provider: "none" as any,
      error: `Both providers failed. Telnyx: ${telnyxResult.error}, Twilio: ${twilioResult.error}`,
      retryable: true,
    };
  }

  /**
   * Send email (placeholder - integrate with email service)
   */
  private async sendEmail(
    to: string,
    message: string,
    request: MessageRequest,
  ): Promise<MessageResponse> {
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    console.log(
      `📧 Email placeholder - would send to ${to}:`,
      message.substring(0, 50) + "...",
    );

    return {
      success: true,
      messageId: `email_${Date.now()}`,
      provider: "email" as any,
      deliveryStatus: "sent",
    };
  }

  /**
   * Apply message template with variable substitution
   */
  private applyTemplate(request: MessageRequest): string {
    if (
      !request.template ||
      !MESSAGE_TEMPLATES[request.template as keyof typeof MESSAGE_TEMPLATES]
    ) {
      return request.message;
    }

    const template =
      MESSAGE_TEMPLATES[request.template as keyof typeof MESSAGE_TEMPLATES];
    let message = template[request.type] || request.message;

    // Replace variables
    if (request.variables) {
      Object.entries(request.variables).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{${key}}`, "g"), value);
      });
    }

    return message;
  }

  /**
   * Check vital sign against patient-specific thresholds and send alert if needed
   */
  async checkVitalThreshold(
    patientId: string,
    vitalType: string,
    value: number,
    careTeam: CareTeamMember[],
  ): Promise<{
    alertSent: boolean;
    alert?: ThresholdAlert;
    messageResponse?: MessageResponse;
  }> {
    try {
      const alert = await thresholdService.checkThreshold(
        patientId,
        vitalType,
        value,
      );

      if (!alert) {
        return { alertSent: false };
      }

      // Send alert based on severity
      const priority =
        alert.severity === "critical"
          ? "critical"
          : alert.severity === "high"
            ? "high"
            : "medium";
      const category = alert.severity === "critical" ? "emergency" : "alert";

      const messageRequest: MessageRequest = {
        to: careTeam[0]?.phone || "", // Send to primary care team member
        message: alert.alertMessage,
        type: alert.severity === "critical" ? "voice" : "sms",
        priority: priority as "low" | "medium" | "high" | "critical",
        patientId,
        category: category as
          | "reminder"
          | "alert"
          | "emergency"
          | "appointment"
          | "medication"
          | "education"
          | "system",
        template: "threshold_alert",
        variables: {
          patient_id: patientId,
          vital_type: vitalType,
          actual_value: alert.actualValue.toString(),
          threshold_value: alert.thresholdValue.toString(),
          unit: alert.unit,
          severity: alert.severity,
          threshold_source: alert.isPatientSpecific
            ? "patient-specific"
            : "global",
        },
      };

      const response = await this.sendMessage(messageRequest);

      AuditLogger.log(
        "SYSTEM",
        "threshold_alert",
        `Threshold alert sent for patient ${patientId}: ${vitalType} = ${alert.actualValue} ${alert.unit}`,
        {
          patientId,
          vitalType,
          actualValue: alert.actualValue,
          thresholdValue: alert.thresholdValue,
          severity: alert.severity,
          isPatientSpecific: alert.isPatientSpecific,
          messageId: response.messageId,
        },
      );

      return { alertSent: true, alert, messageResponse: response };
    } catch (error) {
      console.error("Error checking vital threshold:", error);
      return { alertSent: false };
    }
  }

  /**
   * Send critical alert to care team
   */
  async sendCriticalAlert(
    patientId: string,
    alertType: string,
    data: Record<string, any>,
    careTeam: CareTeamMember[],
  ): Promise<MessageResponse[]> {
    const results: MessageResponse[] = [];

    // Sort care team by priority
    const sortedCareTeam = careTeam.sort((a, b) => a.priority - b.priority);

    for (const member of sortedCareTeam) {
      // Check if member is available based on hours
      if (!this.isCareTeamMemberAvailable(member)) {
        continue;
      }

      const request: MessageRequest = {
        to: member.phoneNumber,
        message: "",
        type: "sms", // Start with SMS for speed
        priority: "critical",
        patientId,
        providerId: member.id,
        category: "emergency",
        template: "care_team_emergency",
        variables: {
          patientName: data.patientName || "Unknown Patient",
          value: data.value?.toString() || "Unknown",
          patientPhone: data.patientPhone || "Not provided",
        },
      };

      const result = await this.sendMessage(request);
      results.push(result);

      // If critical and SMS successful, also make a voice call
      if (result.success && alertType === "critical_hypoglycemia") {
        const voiceRequest = { ...request, type: "voice" as const };
        const voiceResult = await this.sendMessage(voiceRequest);
        results.push(voiceResult);
      }

      // For critical alerts, notify multiple team members
      if (alertType === "critical_hypoglycemia" && results.length < 3) {
        continue; // Send to next team member
      } else if (result.success) {
        break; // Stop after first successful contact for non-critical
      }
    }

    return results;
  }

  /**
   * Send daily reminders to patients
   */
  async sendDailyReminders(
    patients: Array<{
      id: string;
      name: string;
      phoneNumber: string;
      medications: Array<{ name: string; dosage: string; time: string }>;
      deviceBattery?: number;
      lastGlucoseCheck?: string;
    }>,
  ): Promise<void> {
    for (const patient of patients) {
      // Medication reminders
      for (const medication of patient.medications) {
        const now = new Date();
        const medicationTime = new Date(
          `${now.toDateString()} ${medication.time}`,
        );

        // Send reminder 15 minutes before
        const reminderTime = new Date(
          medicationTime.getTime() - 15 * 60 * 1000,
        );

        if (now >= reminderTime && now < medicationTime) {
          await this.sendMessage({
            to: patient.phoneNumber,
            message: "",
            type: "sms",
            priority: "medium",
            patientId: patient.id,
            category: "medication",
            template: "medication_reminder",
            variables: {
              medicationName: medication.name,
              dosage: medication.dosage,
            },
          });
        }
      }

      // Device battery alerts
      if (patient.deviceBattery && patient.deviceBattery < 20) {
        await this.sendMessage({
          to: patient.phoneNumber,
          message: "",
          type: "sms",
          priority: "medium",
          patientId: patient.id,
          category: "alert",
          template: "device_battery_low",
          variables: {
            deviceName: "Glucose Monitor",
            battery: patient.deviceBattery.toString(),
          },
        });
      }

      // Glucose check reminders
      const lastCheck = patient.lastGlucoseCheck
        ? new Date(patient.lastGlucoseCheck)
        : null;
      const hoursAgo = lastCheck
        ? (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60)
        : 24;

      if (hoursAgo > 8) {
        // More than 8 hours since last check
        await this.sendMessage({
          to: patient.phoneNumber,
          message: "",
          type: "sms",
          priority: "low",
          patientId: patient.id,
          category: "reminder",
          template: "glucose_check_reminder",
        });
      }
    }
  }

  /**
   * Schedule escalation rules
   */
  private scheduleEscalation(request: MessageRequest): void {
    if (!request.escalationRules) return;

    const messageId = `escalation_${Date.now()}_${Math.random()}`;

    request.escalationRules.forEach((rule, index) => {
      const timer = setTimeout(
        async () => {
          console.log(
            `⏰ Executing escalation rule ${index + 1} for ${messageId}`,
          );

          await this.sendMessage({
            to: rule.recipient,
            message: rule.message,
            type: rule.method,
            priority: "critical",
            patientId: request.patientId,
            category: "emergency",
          });

          this.escalationTimers.delete(`${messageId}_${index}`);
        },
        rule.delay * 60 * 1000,
      ); // Convert minutes to milliseconds

      this.escalationTimers.set(`${messageId}_${index}`, timer);
    });
  }

  /**
   * Check if care team member is available
   */
  private isCareTeamMemberAvailable(member: CareTeamMember): boolean {
    const now = new Date();
    const currentDay = now.toLocaleLowerCase();
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM

    // Check if today is in available days
    if (!member.availableHours.days.includes(currentDay)) {
      return member.onCall; // Only available if on call
    }

    // Check if current time is within available hours
    const isInHours =
      currentTime >= member.availableHours.start &&
      currentTime <= member.availableHours.end;

    return isInHours || member.onCall;
  }

  /**
   * Start background queue processor
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      // Process any queued messages
      this.processMessageQueue();
    }, 30000); // Process every 30 seconds
  }

  /**
   * Process queued messages
   */
  private async processMessageQueue(): Promise<void> {
    // Implementation for processing queued/scheduled messages
    // This would handle retry logic, scheduled messages, etc.
  }

  /**
   * Get message delivery status
   */
  async getMessageStatus(
    messageId: string,
    provider: "telnyx" | "twilio",
  ): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    switch (provider) {
      case "telnyx":
        return telnyxService.getMessageStatus(messageId);
      case "twilio":
        return twilioService.getMessageStatus(messageId);
      default:
        return { success: false, error: "Unknown provider" };
    }
  }

  /**
   * Validate contact information
   */
  validateContact(contact: Partial<Contact>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!contact.phoneNumber && !contact.email) {
      errors.push("Either phone number or email is required");
    }

    if (
      contact.phoneNumber &&
      !telnyxService.validatePhoneNumber(contact.phoneNumber)
    ) {
      errors.push("Invalid phone number format");
    }

    if (contact.email && !this.validateEmail(contact.email)) {
      errors.push("Invalid email format");
    }

    return { valid: errors.length === 0, errors };
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const messagingService = new MessagingService();

// Export types for external use
export { MESSAGE_TEMPLATES };
