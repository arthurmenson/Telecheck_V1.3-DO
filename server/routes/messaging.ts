import { Request, Response } from 'express';
import { messagingService, MessageRequest, CareTeamMember } from '../utils/messagingService';
import { AuditLogger } from '../utils/auditLogger';
import { telnyxService } from '../utils/telnyxService';
import { twilioService } from '../utils/twilioService';

/**
 * Send individual message (SMS, voice, or email)
 */
export async function sendMessage(req: Request, res: Response) {
  try {
    const {
      to,
      message,
      type = 'sms',
      priority = 'medium',
      patientId,
      providerId,
      category = 'system',
      template,
      variables,
      escalationRules
    } = req.body;

    // Validation
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Recipient (to) and message are required'
      });
    }

    if (!['sms', 'voice', 'email'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid message type. Must be sms, voice, or email'
      });
    }

    const request: MessageRequest = {
      to,
      message,
      type,
      priority,
      patientId,
      providerId,
      category,
      template,
      variables,
      escalationRules
    };

    const result = await messagingService.sendMessage(request);

    // Log the API request
    AuditLogger.logSystemEvent('messaging_api', 'send_message', {
      type,
      recipient: to,
      success: result.success,
      provider: result.provider,
      userId: req.headers['user-id'] || 'system'
    });

    if (result.success) {
      res.json({
        success: true,
        messageId: result.messageId,
        provider: result.provider,
        deliveryStatus: result.deliveryStatus
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        retryable: result.retryable
      });
    }
  } catch (error) {
    console.error('❌ Send message API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Send critical alert to care team
 */
export async function sendCriticalAlert(req: Request, res: Response) {
  try {
    const {
      patientId,
      alertType,
      data,
      careTeam
    } = req.body;

    // Validation
    if (!patientId || !alertType || !data || !careTeam) {
      return res.status(400).json({
        success: false,
        error: 'PatientId, alertType, data, and careTeam are required'
      });
    }

    if (!Array.isArray(careTeam) || careTeam.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'CareTeam must be a non-empty array'
      });
    }

    console.log(`🚨 Critical alert triggered: ${alertType} for patient ${patientId}`);

    const results = await messagingService.sendCriticalAlert(
      patientId,
      alertType,
      data,
      careTeam
    );

    // Log the critical alert
    AuditLogger.logMedicalEvent(patientId, 'critical_alert', {
      alertType,
      data,
      careTeamNotified: careTeam.length,
      successfulNotifications: results.filter(r => r.success).length,
      userId: req.headers['user-id'] || 'system'
    });

    const successCount = results.filter(r => r.success).length;
    const totalAttempts = results.length;

    res.json({
      success: successCount > 0,
      notificationsSent: successCount,
      totalAttempts,
      results: results.map(r => ({
        success: r.success,
        provider: r.provider,
        messageId: r.messageId,
        error: r.error
      }))
    });
  } catch (error) {
    console.error('❌ Critical alert API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Send daily reminders to patients
 */
export async function sendDailyReminders(req: Request, res: Response) {
  try {
    const { patients } = req.body;

    if (!Array.isArray(patients)) {
      return res.status(400).json({
        success: false,
        error: 'Patients must be an array'
      });
    }

    console.log(`📅 Sending daily reminders to ${patients.length} patients`);

    await messagingService.sendDailyReminders(patients);

    // Log the daily reminder batch
    AuditLogger.logSystemEvent('messaging_api', 'daily_reminders', {
      patientCount: patients.length,
      timestamp: new Date().toISOString(),
      userId: req.headers['user-id'] || 'system'
    });

    res.json({
      success: true,
      message: `Daily reminders processed for ${patients.length} patients`
    });
  } catch (error) {
    console.error('❌ Daily reminders API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Send appointment reminders
 */
export async function sendAppointmentReminders(req: Request, res: Response) {
  try {
    const { appointments, reminderType = '24h' } = req.body;

    if (!Array.isArray(appointments)) {
      return res.status(400).json({
        success: false,
        error: 'Appointments must be an array'
      });
    }

    const results = [];

    for (const appointment of appointments) {
      const template = reminderType === '24h' ? 'appointment_24h' : 'appointment_2h';
      
      const request: MessageRequest = {
        to: appointment.patientPhone,
        message: '',
        type: 'sms',
        priority: 'low',
        patientId: appointment.patientId,
        category: 'appointment',
        template,
        variables: {
          time: appointment.time,
          provider: appointment.providerName,
          phone: appointment.clinicPhone || '(555) 123-4567'
        }
      };

      const result = await messagingService.sendMessage(request);
      results.push({
        patientId: appointment.patientId,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });
    }

    const successCount = results.filter(r => r.success).length;

    // Log appointment reminders
    AuditLogger.logSystemEvent('messaging_api', 'appointment_reminders', {
      reminderType,
      appointmentCount: appointments.length,
      successfulSent: successCount,
      userId: req.headers['user-id'] || 'system'
    });

    res.json({
      success: successCount > 0,
      totalSent: successCount,
      totalAttempts: appointments.length,
      results
    });
  } catch (error) {
    console.error('❌ Appointment reminders API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get message delivery status
 */
export async function getMessageStatus(req: Request, res: Response) {
  try {
    const { messageId, provider } = req.params;

    if (!messageId || !provider) {
      return res.status(400).json({
        success: false,
        error: 'MessageId and provider are required'
      });
    }

    if (!['telnyx', 'twilio'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Provider must be telnyx or twilio'
      });
    }

    const status = await messagingService.getMessageStatus(
      messageId, 
      provider as 'telnyx' | 'twilio'
    );

    res.json(status);
  } catch (error) {
    console.error('❌ Get message status API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Send medication adherence reminder
 */
export async function sendMedicationReminder(req: Request, res: Response) {
  try {
    const {
      patientId,
      patientPhone,
      medicationName,
      dosage,
      dueTime
    } = req.body;

    if (!patientId || !patientPhone || !medicationName || !dosage) {
      return res.status(400).json({
        success: false,
        error: 'PatientId, patientPhone, medicationName, and dosage are required'
      });
    }

    const request: MessageRequest = {
      to: patientPhone,
      message: '',
      type: 'sms',
      priority: 'medium',
      patientId,
      category: 'medication',
      template: 'medication_reminder',
      variables: {
        medicationName,
        dosage
      }
    };

    const result = await messagingService.sendMessage(request);

    // Log medication reminder
    AuditLogger.logMedicationEvent(patientId, 'reminder_sent', {
      medicationName,
      dosage,
      dueTime,
      success: result.success,
      messageId: result.messageId
    });

    if (result.success) {
      res.json({
        success: true,
        messageId: result.messageId,
        provider: result.provider
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Medication reminder API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Send device alert (battery low, disconnected, etc.)
 */
export async function sendDeviceAlert(req: Request, res: Response) {
  try {
    const {
      patientId,
      patientPhone,
      deviceName,
      alertType,
      data
    } = req.body;

    if (!patientId || !patientPhone || !deviceName || !alertType) {
      return res.status(400).json({
        success: false,
        error: 'PatientId, patientPhone, deviceName, and alertType are required'
      });
    }

    let template = '';
    const variables: Record<string, string> = {
      deviceName
    };

    switch (alertType) {
      case 'battery_low':
        template = 'device_battery_low';
        variables.battery = data?.battery?.toString() || '0';
        break;
      case 'disconnected':
        template = 'device_disconnected';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid alertType. Must be battery_low or disconnected'
        });
    }

    const request: MessageRequest = {
      to: patientPhone,
      message: '',
      type: 'sms',
      priority: 'medium',
      patientId,
      category: 'alert',
      template,
      variables
    };

    const result = await messagingService.sendMessage(request);

    // Log device alert
    AuditLogger.logSystemEvent('device_alert', alertType, {
      patientId,
      deviceName,
      alertData: data,
      success: result.success,
      messageId: result.messageId
    });

    if (result.success) {
      res.json({
        success: true,
        messageId: result.messageId,
        provider: result.provider
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Device alert API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Send care plan update notification
 */
export async function sendCarePlanUpdate(req: Request, res: Response) {
  try {
    const {
      patientId,
      patientPhone,
      updateType,
      clinicPhone
    } = req.body;

    if (!patientId || !patientPhone || !updateType) {
      return res.status(400).json({
        success: false,
        error: 'PatientId, patientPhone, and updateType are required'
      });
    }

    const request: MessageRequest = {
      to: patientPhone,
      message: '',
      type: 'sms',
      priority: 'low',
      patientId,
      category: 'education',
      template: 'care_plan_update',
      variables: {
        phone: clinicPhone || '(555) 123-4567'
      }
    };

    const result = await messagingService.sendMessage(request);

    // Log care plan update notification
    AuditLogger.logDataAccess(patientId, 'care_plan', 'update_notification', {
      updateType,
      success: result.success,
      messageId: result.messageId
    });

    if (result.success) {
      res.json({
        success: true,
        messageId: result.messageId,
        provider: result.provider
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Care plan update API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Test messaging service connectivity
 */
export async function testMessagingService(req: Request, res: Response) {
  try {
    const { provider = 'both', testPhone } = req.body;

    const results: any = {};

    if (provider === 'telnyx' || provider === 'both') {
      const testMessage = 'Test message from healthcare platform - Telnyx service check';
      const telnyxResult = testPhone 
        ? await telnyxService.sendSMS(testPhone, testMessage)
        : { success: true, messageId: 'test_mode' };
      
      results.telnyx = {
        available: !!process.env.TELNYX_API_KEY,
        testResult: telnyxResult
      };
    }

    if (provider === 'twilio' || provider === 'both') {
      const testMessage = 'Test message from healthcare platform - Twilio service check';
      const twilioResult = testPhone 
        ? await twilioService.sendSMS(testPhone, testMessage)
        : { success: true, messageId: 'test_mode' };
      
      results.twilio = {
        available: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        testResult: twilioResult
      };
    }

    // Log service test
    AuditLogger.logSystemEvent('messaging_api', 'service_test', {
      provider,
      testPhone: !!testPhone,
      results,
      userId: req.headers['user-id'] || 'system'
    });

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('❌ Test messaging service API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get messaging service status and statistics
 */
export async function getMessagingStatus(req: Request, res: Response) {
  try {
    const status = {
      services: {
        telnyx: {
          available: !!process.env.TELNYX_API_KEY,
          configured: !!(process.env.TELNYX_API_KEY && process.env.TELNYX_PHONE_NUMBER),
          phoneNumber: process.env.TELNYX_PHONE_NUMBER ? 
            process.env.TELNYX_PHONE_NUMBER.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-****') : 
            'Not configured'
        },
        twilio: {
          available: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
          configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
          phoneNumber: process.env.TWILIO_PHONE_NUMBER ? 
            process.env.TWILIO_PHONE_NUMBER.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-****') : 
            'Not configured'
        }
      },
      features: {
        sms: true,
        voice: true,
        failover: true,
        templates: true,
        escalation: true,
        scheduling: true
      },
      statistics: {
        // These would come from a real database in production
        messagesThisMonth: 1234,
        successRate: 96.5,
        avgResponseTime: '2.3s',
        failoverEvents: 8
      }
    };

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('❌ Get messaging status API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
