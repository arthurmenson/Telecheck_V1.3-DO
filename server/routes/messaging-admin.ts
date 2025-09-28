import { RequestHandler } from "express";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
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
export async function updateMessagingConfig(
  req: AuthenticatedRequest,
  res: Response,
) {
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
      `INSERT INTO messaging_config (config_data, updated_by, created_at, updated_at)
       VALUES ($1::jsonb, $2, NOW(), NOW())`,
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
export async function testMessagingService(
  req: AuthenticatedRequest,
  res: Response,
) {
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
          priority: "low",
          category: "system",
        });
      }
    } else if (type === "voice") {
      if (provider === "telnyx") {
        const telnyxService = new TelnyxService();
        result = await telnyxService.makeCall(phoneNumber);
      } else if (provider === "twilio") {
        const twilioService = new TwilioService();
        result = await twilioService.sendVoiceMessage(phoneNumber, testMessage);
      } else {
        result = await messagingService.sendMessage({
          to: phoneNumber,
          message: testMessage,
          type: "voice",
          priority: "low",
          category: "system",
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
    const periodValue = Array.isArray(period) ? period[0] : period;
    const intervalMap: Record<string, string> = {
      "24h": "1 day",
      "7d": "7 days",
      "30d": "30 days",
    };
    const interval =
      intervalMap[typeof periodValue === "string" ? periodValue : "24h"] ||
      "1 day";
    const dateCondition = `"sent_at" >= NOW() - INTERVAL '${interval}'`;

    const [totalMessages, successfulMessages, failedMessages, providerStats] =
      await Promise.all([
        db.query(
          `SELECT COUNT(*) as count FROM communication_logs WHERE ${dateCondition}`,
        ),
        db.query(
          `SELECT COUNT(*) as count FROM communication_logs WHERE ${dateCondition} AND status = 'success'`,
        ),
        db.query(
          `SELECT COUNT(*) as count FROM communication_logs WHERE ${dateCondition} AND status = 'failed'`,
        ),
        db.query(`
        SELECT 
          provider,
          type,
          COUNT(*) as count,
          AVG(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100 as success_rate
        FROM communication_logs 
        WHERE ${dateCondition}
        GROUP BY provider, type
      `),
      ]);

    const schedulingStats =
      await scheduledMessagingService.getSchedulingStats();

    const analytics = {
      period: periodValue ?? "24h",
      overview: {
        totalMessages: totalMessages?.[0]?.count || 0,
        successfulMessages: successfulMessages?.[0]?.count || 0,
        failedMessages: failedMessages?.[0]?.count || 0,
        successRate:
          totalMessages?.[0]?.count > 0
            ? (
                ((successfulMessages?.[0]?.count || 0) /
                  (totalMessages?.[0]?.count || 1)) *
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
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 20;
    const offset = (pageNumber - 1) * limitNumber;

    const conditions: string[] = [];
    const filterParams: any[] = [];
    const addParam = (value: any) => {
      filterParams.push(value);
      return `$${filterParams.length}`;
    };

    const searchValue = Array.isArray(search) ? search[0] : search;
    if (typeof searchValue === "string" && searchValue.trim().length > 0) {
      const idPlaceholder = addParam(`%${searchValue.trim()}%`);
      const schedulePlaceholder = addParam(`%${searchValue.trim()}%`);
      conditions.push(
        `(CAST(patient_id AS TEXT) ILIKE ${idPlaceholder} OR CAST(schedule_data AS TEXT) ILIKE ${schedulePlaceholder})`,
      );
    }

    const statusValue = Array.isArray(status) ? status[0] : status;
    if (typeof statusValue === "string" && statusValue.trim().length > 0) {
      if (statusValue === "active" || statusValue === "inactive") {
        const isActive = statusValue === "active";
        const statusPlaceholder = addParam(isActive);
        conditions.push(`active = ${statusPlaceholder}`);
      }
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const listParams = [...filterParams, limitNumber, offset];
    const limitPlaceholder = `$${filterParams.length + 1}`;
    const offsetPlaceholder = `$${filterParams.length + 2}`;

    const [schedules, totalCount] = await Promise.all([
      db.query(
        `SELECT * FROM patient_schedules ${whereClause} ORDER BY updated_at DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
        listParams,
      ),
      db.query(
        `SELECT COUNT(*) as count FROM patient_schedules ${whereClause}`,
        filterParams,
      ),
    ]);

    const processedSchedules =
      schedules?.map((schedule: any) => {
        const rawSchedule = schedule.schedule_data;
        const rawActive =
          typeof schedule.active !== "undefined" ? schedule.active : null;
        const isActive =
          typeof rawActive === "boolean"
            ? rawActive
            : rawActive == null
              ? true
              : rawActive === 1 ||
                rawActive === "1" ||
                `${rawActive}`.toLowerCase() === "true";

        return {
          id: schedule.id,
          patientId: schedule.patient_id,
          active: isActive,
          scheduleData:
            typeof rawSchedule === "string"
              ? JSON.parse(rawSchedule)
              : rawSchedule,
          createdAt: schedule.created_at,
          updatedAt: schedule.updated_at,
          activeJobs: scheduledMessagingService.getActiveJobsForPatient(
            schedule.patient_id,
          ),
        };
      }) || [];

    res.json({
      success: true,
      schedules: processedSchedules,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: Number(totalCount?.[0]?.count || 0),
        totalPages: Math.ceil(
          Number(totalCount?.[0]?.count || 0) / Math.max(limitNumber, 1),
        ),
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
export async function updateMessageTemplate(
  req: AuthenticatedRequest,
  res: Response,
) {
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
      `
        INSERT INTO message_templates (
          id,
          type,
          name,
          content,
          variables,
          updated_by,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          type = EXCLUDED.type,
          name = EXCLUDED.name,
          content = EXCLUDED.content,
          variables = EXCLUDED.variables,
          updated_by = EXCLUDED.updated_by,
          updated_at = EXCLUDED.updated_at
      `,
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
export async function updateCareTeamMember(
  req: AuthenticatedRequest,
  res: Response,
) {
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

    const isActiveValue =
      typeof active === "boolean"
        ? active
        : typeof active === "string"
          ? active.toLowerCase() === "true"
          : Boolean(active);

    await db.query(
      `
        INSERT INTO care_team_members (
          id,
          name,
          role,
          phone,
          email,
          priority_level,
          availability_schedule,
          notification_preferences,
          active,
          updated_by,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          priority_level = EXCLUDED.priority_level,
          availability_schedule = EXCLUDED.availability_schedule,
          notification_preferences = EXCLUDED.notification_preferences,
          active = EXCLUDED.active,
          updated_by = EXCLUDED.updated_by,
          updated_at = EXCLUDED.updated_at
      `,
      [
        memberId,
        name,
        role,
        phone,
        email,
        priorityLevel,
        JSON.stringify(availability || {}),
        JSON.stringify(preferences || {}),
        isActiveValue,
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
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 50;
    const offset = (pageNumber - 1) * limitNumber;

    const conditions: string[] = [];
    const filterParams: any[] = [];
    const addParam = (value: any) => {
      filterParams.push(value);
      return `$${filterParams.length}`;
    };

    const typeValue = Array.isArray(type) ? type[0] : type;
    if (typeof typeValue === "string" && typeValue.trim().length > 0) {
      const placeholder = addParam(`%${typeValue.trim()}%`);
      conditions.push(`action ILIKE ${placeholder}`);
    }

    const parseDateParam = (value: unknown) => {
      const raw = Array.isArray(value) ? value[0] : value;
      if (typeof raw !== "string") return null;
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    };

    const startIso = parseDateParam(startDate);
    if (startIso) {
      const placeholder = addParam(startIso);
      conditions.push(`"timestamp" >= ${placeholder}::timestamp`);
    }

    const endIso = parseDateParam(endDate);
    if (endIso) {
      const placeholder = addParam(endIso);
      conditions.push(`"timestamp" <= ${placeholder}::timestamp`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const listParams = [...filterParams, limitNumber, offset];
    const limitPlaceholder = `$${filterParams.length + 1}`;
    const offsetPlaceholder = `$${filterParams.length + 2}`;

    const [logs, totalCount] = await Promise.all([
      db.query(
        `SELECT * FROM audit_logs ${whereClause} ORDER BY "timestamp" DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
        listParams,
      ),
      db.query(
        `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`,
        filterParams,
      ),
    ]);

    res.json({
      success: true,
      logs: logs || [],
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: Number(totalCount?.[0]?.count || 0),
        totalPages: Math.ceil(
          Number(totalCount?.[0]?.count || 0) / Math.max(limitNumber, 1),
        ),
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
