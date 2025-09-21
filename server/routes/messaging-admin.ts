import { RequestHandler } from "express";
import { Request, Response } from "express";
import { dbPool } from "../config/database";
import { redisClient } from "../config/database";
import { db } from "../utils/databaseAdapter";
import { MessagingService } from "../utils/messagingService";
import { TelnyxService } from "../utils/telnyxService";
import { TwilioService } from "../utils/twilioService";
import { ScheduledMessagingService } from "../utils/scheduledMessaging";
import { CareTeamService } from "../utils/careTeamService";
import { AuditLogger } from "../utils/auditLogger";

const messagingService = new MessagingService();
const scheduledMessagingService = new ScheduledMessagingService();
const careTeamService = new CareTeamService();

// Get messaging configuration
export async function getMessagingConfig(req: Request, res: Response) {
  try {
    const config = await db.query(
      "SELECT * FROM messaging_config ORDER BY created_at DESC LIMIT 1",
    );

    const defaultConfig = {
      primaryProvider: "telnyx",
      enableSMS: true,
      enableVoice: false,
      enableScheduled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
      maxRetries: 3,
      retryDelay: 5,
      auditLogging: true,
      thresholds: {
        glucoseLow: 70,
        glucoseHigh: 400,
        bpSystolicHigh: 180,
        bpDiastolicHigh: 110,
        heartRateHigh: 120,
        heartRateLow: 50,
        temperatureHigh: 101.5,
        temperatureLow: 95.0,
        oxygenSatLow: 88,
      },
      careTeam: {
        enableAlerts: true,
        escalationTimeout: 15,
        maxEscalationLevels: 3,
      },
    };

    const currentConfig =
      config && config.length > 0
        ? { ...defaultConfig, ...JSON.parse(config[0].config_data) }
        : defaultConfig;

    res.json({
      success: true,
      config: currentConfig,
    });
  } catch (error) {
    console.error("Error fetching messaging config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messaging configuration",
    });
  }
}

// Update messaging configuration
export async function updateMessagingConfig(req: Request, res: Response) {
  try {
    const { config } = req.body;
    const userId = req.user?.id || "admin";

    // Validate configuration
    if (!config || typeof config !== "object") {
      return res.status(400).json({
        success: false,
        error: "Invalid configuration data",
      });
    }

    // Save configuration
    await db.query(
      `INSERT OR REPLACE INTO messaging_config 
       (config_data, updated_by, updated_at) 
       VALUES (?, ?, datetime('now'))`,
      [JSON.stringify(config), userId],
    );

    // Log the configuration change
    AuditLogger.log(
      userId,
      "messaging_config_update",
      "Updated messaging configuration",
      {
        configKeys: Object.keys(config),
        primaryProvider: config.primaryProvider,
        featuresEnabled: {
          sms: config.enableSMS,
          voice: config.enableVoice,
          scheduled: config.enableScheduled,
        },
      },
    );

    res.json({
      success: true,
      message: "Messaging configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating messaging config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update messaging configuration",
    });
  }
}

// Test messaging services
export async function testMessagingService(req: Request, res: Response) {
  try {
    const { provider, type, phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required for testing",
      });
    }

    const testMessage = `Test message from Telecheck AI Healthcare - ${new Date().toLocaleString()}`;
    let result;

    if (type === "sms") {
      if (provider === "telnyx") {
        const telnyxService = new TelnyxService();
        result = await telnyxService.sendSMS(phoneNumber, testMessage);
      } else if (provider === "twilio") {
        const twilioService = new TwilioService();
        result = await twilioService.sendSMS(phoneNumber, testMessage);
      } else {
        // Use messaging service for automatic provider selection
        result = await messagingService.sendMessage({
          to: phoneNumber,
          message: testMessage,
          type: "sms",
          metadata: { isTest: true },
        });
      }
    } else if (type === "voice") {
      if (provider === "telnyx") {
        const telnyxService = new TelnyxService();
        result = await telnyxService.makeCall(phoneNumber, testMessage);
      } else if (provider === "twilio") {
        const twilioService = new TwilioService();
        result = await twilioService.makeCall(phoneNumber, testMessage);
      } else {
        result = await messagingService.sendMessage({
          to: phoneNumber,
          message: testMessage,
          type: "voice",
          metadata: { isTest: true },
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid test type. Must be "sms" or "voice"',
      });
    }

    // Log the test
    AuditLogger.log(
      "admin",
      "messaging_test",
      `Tested ${provider} ${type} service`,
      {
        provider,
        type,
        phoneNumber,
        success: result.success,
        messageId: result.messageId,
      },
    );

    res.json({
      success: true,
      result,
      message: `${type.toUpperCase()} test ${result.success ? "completed successfully" : "failed"}`,
    });
  } catch (error) {
    console.error("Error testing messaging service:", error);
    res.status(500).json({
      success: false,
      error: "Failed to test messaging service",
    });
  }
}

// Get messaging analytics
export async function getMessagingAnalytics(req: Request, res: Response) {
  try {
    const { period = "24h" } = req.query;

    let dateFilter = "";
    if (period === "24h") {
      dateFilter = "datetime(sent_at) >= datetime('now', '-1 day')";
    } else if (period === "7d") {
      dateFilter = "datetime(sent_at) >= datetime('now', '-7 days')";
    } else if (period === "30d") {
      dateFilter = "datetime(sent_at) >= datetime('now', '-30 days')";
    } else {
      dateFilter = "datetime(sent_at) >= datetime('now', '-1 day')";
    }

    const [totalMessages, successfulMessages, failedMessages, providerStats] =
      await Promise.all([
        db.query(
          `SELECT COUNT(*) as count FROM communication_logs WHERE ${dateFilter}`,
        ),
        db.query(
          `SELECT COUNT(*) as count FROM communication_logs WHERE ${dateFilter} AND status = 'success'`,
        ),
        db.query(
          `SELECT COUNT(*) as count FROM communication_logs WHERE ${dateFilter} AND status = 'failed'`,
        ),
        db.query(`
        SELECT 
          provider,
          type,
          COUNT(*) as count,
          AVG(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100 as success_rate
        FROM communication_logs 
        WHERE ${dateFilter}
        GROUP BY provider, type
      `),
      ]);

    const schedulingStats =
      await scheduledMessagingService.getSchedulingStats();

    const analytics = {
      period,
      overview: {
        totalMessages: totalMessages?.[0]?.count || 0,
        successfulMessages: successfulMessages?.[0]?.count || 0,
        failedMessages: failedMessages?.[0]?.count || 0,
        successRate:
          totalMessages?.[0]?.count > 0
            ? (
                ((successfulMessages?.[0]?.count || 0) /
                  totalMessages[0].count) *
                100
              ).toFixed(1)
            : "0.0",
      },
      providerStats: providerStats || [],
      scheduling: schedulingStats,
      trends: {
        // This would typically come from a time-series query
        hourlyVolume: [],
        responseRates: {},
        commonFailures: [],
      },
    };

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching messaging analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messaging analytics",
    });
  }
}

// Get patient messaging schedules
export async function getPatientSchedules(req: Request, res: Response) {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (search) {
      whereClause += " AND (patient_id LIKE ? OR schedule_data LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += " AND active = ?";
      params.push(status === "active" ? 1 : 0);
    }

    const [schedules, totalCount] = await Promise.all([
      db.query(
        `SELECT * FROM patient_schedules ${whereClause} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
        [...params, Number(limit), offset],
      ),
      db.query(
        `SELECT COUNT(*) as count FROM patient_schedules ${whereClause}`,
        params,
      ),
    ]);

    const processedSchedules =
      schedules?.map((schedule: any) => ({
        id: schedule.id,
        patientId: schedule.patient_id,
        active: schedule.active === 1,
        scheduleData: JSON.parse(schedule.schedule_data),
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at,
        activeJobs: scheduledMessagingService.getActiveJobsForPatient(
          schedule.patient_id,
        ),
      })) || [];

    res.json({
      success: true,
      schedules: processedSchedules,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount?.[0]?.count || 0,
        totalPages: Math.ceil((totalCount?.[0]?.count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching patient schedules:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch patient schedules",
    });
  }
}

// Update patient schedule
export async function updatePatientSchedule(req: Request, res: Response) {
  try {
    const { patientId } = req.params;
    const { schedule, action } = req.body;

    if (action === "pause") {
      await scheduledMessagingService.pausePatientSchedule(patientId);
      res.json({
        success: true,
        message: `Schedule paused for patient ${patientId}`,
      });
    } else if (action === "resume") {
      await scheduledMessagingService.resumePatientSchedule(patientId);
      res.json({
        success: true,
        message: `Schedule resumed for patient ${patientId}`,
      });
    } else if (action === "update" && schedule) {
      await scheduledMessagingService.updatePatientSchedule(schedule);
      res.json({
        success: true,
        message: `Schedule updated for patient ${patientId}`,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Invalid action or missing schedule data",
      });
    }
  } catch (error) {
    console.error("Error updating patient schedule:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update patient schedule",
    });
  }
}

// Get message templates
export async function getMessageTemplates(req: Request, res: Response) {
  try {
    const templates = await db.query(
      "SELECT * FROM message_templates ORDER BY type, name",
    );

    const defaultTemplates = [
      {
        id: "med_reminder",
        type: "medication_reminder",
        name: "Medication Reminder",
        content:
          "Reminder: It's time to take your {{medication}} ({{dosage}}). {{instructions}}",
        variables: ["medication", "dosage", "instructions"],
        isDefault: true,
      },
      {
        id: "glucose_check",
        type: "glucose_check",
        name: "Glucose Check Reminder",
        content:
          "Time for your glucose check! Please test your blood sugar and log the results.",
        variables: [],
        isDefault: true,
      },
      {
        id: "appointment_24h",
        type: "appointment_reminder",
        name: "Appointment Reminder (24h)",
        content:
          "Reminder: You have an appointment with {{provider}} tomorrow at {{time}}.",
        variables: ["provider", "time"],
        isDefault: true,
      },
      {
        id: "critical_alert",
        type: "critical_alert",
        name: "Critical Alert",
        content:
          "URGENT: Patient {{patient_name}} requires immediate attention. {{alert_reason}}",
        variables: ["patient_name", "alert_reason"],
        isDefault: true,
      },
    ];

    res.json({
      success: true,
      templates:
        templates && templates.length > 0 ? templates : defaultTemplates,
    });
  } catch (error) {
    console.error("Error fetching message templates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch message templates",
    });
  }
}

// Update message template
export async function updateMessageTemplate(req: Request, res: Response) {
  try {
    const { templateId } = req.params;
    const { name, content, variables, type } = req.body;
    const userId = req.user?.id || "admin";

    if (!name || !content || !type) {
      return res.status(400).json({
        success: false,
        error: "Name, content, and type are required",
      });
    }

    await db.query(
      `INSERT OR REPLACE INTO message_templates 
       (id, type, name, content, variables, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        templateId,
        type,
        name,
        content,
        JSON.stringify(variables || []),
        userId,
      ],
    );

    AuditLogger.log(
      userId,
      "template_update",
      `Updated message template: ${name}`,
      {
        templateId,
        type,
        variables: variables || [],
      },
    );

    res.json({
      success: true,
      message: "Message template updated successfully",
    });
  } catch (error) {
    console.error("Error updating message template:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update message template",
    });
  }
}

// Get care team configuration
export async function getCareTeamConfig(req: Request, res: Response) {
  try {
    const careTeamMembers = await db.query(`
      SELECT 
        id, name, role, phone, email, priority_level,
        availability_schedule, notification_preferences,
        active, created_at, updated_at
      FROM care_team_members 
      ORDER BY priority_level, name
    `);

    const escalationRules = await db.query(`
      SELECT * FROM escalation_rules ORDER BY level
    `);

    res.json({
      success: true,
      careTeam: {
        members: careTeamMembers || [],
        escalationRules: escalationRules || [],
      },
    });
  } catch (error) {
    console.error("Error fetching care team config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch care team configuration",
    });
  }
}

// Update care team member
export async function updateCareTeamMember(req: Request, res: Response) {
  try {
    const { memberId } = req.params;
    const {
      name,
      role,
      phone,
      email,
      priorityLevel,
      availability,
      preferences,
      active,
    } = req.body;
    const userId = req.user?.id || "admin";

    await db.query(
      `INSERT OR REPLACE INTO care_team_members
       (id, name, role, phone, email, priority_level, availability_schedule, 
        notification_preferences, active, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        memberId,
        name,
        role,
        phone,
        email,
        priorityLevel,
        JSON.stringify(availability || {}),
        JSON.stringify(preferences || {}),
        active ? 1 : 0,
        userId,
      ],
    );

    AuditLogger.log(
      userId,
      "care_team_update",
      `Updated care team member: ${name}`,
      {
        memberId,
        role,
        priorityLevel,
        active,
      },
    );

    res.json({
      success: true,
      message: "Care team member updated successfully",
    });
  } catch (error) {
    console.error("Error updating care team member:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update care team member",
    });
  }
}

// Get audit logs for messaging
export async function getMessagingAuditLogs(req: Request, res: Response) {
  try {
    const { page = 1, limit = 50, type, startDate, endDate } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (type) {
      whereClause += " AND action LIKE ?";
      params.push(`%${type}%`);
    }

    if (startDate) {
      whereClause += " AND datetime(timestamp) >= datetime(?)";
      params.push(startDate);
    }

    if (endDate) {
      whereClause += " AND datetime(timestamp) <= datetime(?)";
      params.push(endDate);
    }

    const [logs, totalCount] = await Promise.all([
      db.query(
        `SELECT * FROM audit_logs ${whereClause} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [...params, Number(limit), offset],
      ),
      db.query(
        `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`,
        params,
      ),
    ]);

    res.json({
      success: true,
      logs: logs || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount?.[0]?.count || 0,
        totalPages: Math.ceil((totalCount?.[0]?.count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audit logs",
    });
  }
}

// Send test wellness check
export async function sendWellnessCheck(req: Request, res: Response) {
  try {
    const { patientId, patientName, phoneNumber } = req.body;

    if (!patientId || !patientName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "Patient ID, name, and phone number are required",
      });
    }

    const result = await scheduledMessagingService.sendWellnessCheck(
      patientId,
      patientName,
      phoneNumber,
    );

    res.json({
      success: result,
      message: result
        ? "Wellness check sent successfully"
        : "Failed to send wellness check",
    });
  } catch (error) {
    console.error("Error sending wellness check:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send wellness check",
    });
  }
}
