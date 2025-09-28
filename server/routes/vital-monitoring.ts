import { RequestHandler } from "express";
import { Request, Response } from "express";
import { dbPool } from "../config/database";
import { redisClient } from "../config/database";
import { db } from "../utils/databaseAdapter";
import { MessagingService } from "../utils/messagingService";
import { thresholdService } from "../utils/thresholdService";
import { CareTeamService } from "../utils/careTeamService";
import { AuditLogger } from "../utils/auditLogger";

const messagingService = new MessagingService();
const careTeamService = new CareTeamService();

export interface VitalReading {
  patientId: string;
  vitalType: string;
  value: number;
  unit: string;
  measuredAt: string;
  deviceId?: string;
  notes?: string;
}

// Submit a vital reading and check thresholds
export async function submitVitalReading(req: Request, res: Response) {
  try {
    const { patientId, vitalType, value, unit, measuredAt, deviceId, notes } =
      req.body;
    const userId = req.user?.id || "system";

    if (!patientId || !vitalType || value === undefined || !unit) {
      return res.status(400).json({
        success: false,
        error: "Patient ID, vital type, value, and unit are required",
      });
    }

    // Store the vital reading
    const vitalId = `vital_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.query(
      `INSERT INTO vital_signs 
       (id, user_id, type, value, unit, measured_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        vitalId,
        patientId,
        vitalType,
        value,
        unit,
        measuredAt || new Date().toISOString(),
      ],
    );

    // Check threshold for this patient
    const alert = await thresholdService.checkThreshold(
      patientId,
      vitalType,
      value,
    );

    let alertResponse = null;
    if (alert) {
      // Get care team for this patient
      const team = careTeamService.getCareTeam(patientId);
      const careTeam = team
        ? [
            team.primaryPhysician,
            team.careCoordinator,
            team.onCallProvider,
            ...team.specialists,
          ].filter(Boolean)
        : [];

      if (careTeam.length > 0) {
        // Send alert using messaging service
        const thresholdCheck = await messagingService.checkVitalThreshold(
          patientId,
          vitalType,
          value,
          careTeam,
        );

        alertResponse = {
          alertSent: thresholdCheck.alertSent,
          alert: thresholdCheck.alert,
          messageId: thresholdCheck.messageResponse?.messageId,
        };
      } else {
        // Log that no care team was found
        AuditLogger.log(
          userId,
          "threshold_alert_no_care_team",
          `Threshold exceeded for patient ${patientId} but no care team found`,
          { patientId, vitalType, value, alert },
        );
      }
    }

    // Log the vital submission
    AuditLogger.log(
      userId,
      "vital_reading_submitted",
      `Vital reading submitted for patient ${patientId}: ${vitalType} = ${value} ${unit}`,
      {
        patientId,
        vitalType,
        value,
        unit,
        vitalId,
        deviceId,
        thresholdExceeded: !!alert,
        alertSent: alertResponse?.alertSent || false,
      },
    );

    res.json({
      success: true,
      vitalId,
      thresholdCheck: {
        thresholdExceeded: !!alert,
        alert,
        alertSent: alertResponse?.alertSent || false,
        messageId: alertResponse?.messageId,
      },
      message: alert
        ? `Vital reading recorded. ${alert.severity.toUpperCase()} threshold exceeded - care team notified.`
        : "Vital reading recorded. All values within normal range.",
    });
  } catch (error) {
    console.error("Error submitting vital reading:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit vital reading",
    });
  }
}

// Get vital readings for a patient with threshold analysis
export async function getPatientVitals(req: Request, res: Response) {
  try {
    const { patientId } = req.params;
    const { limit = 50, vitalType, startDate, endDate } = req.query;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: "Patient ID is required",
      });
    }

    const conditions: string[] = ["user_id = $1"];
    const queryParams: any[] = [patientId];

    const addParam = (value: any, transform?: (value: any) => any) => {
      const nextValue = transform ? transform(value) : value;
      queryParams.push(nextValue);
      return `$${queryParams.length}`;
    };

    if (typeof vitalType === "string" && vitalType.trim().length > 0) {
      const placeholder = addParam(vitalType.trim());
      conditions.push(`type = ${placeholder}`);
    }

    const parseDate = (value: unknown) => {
      const raw = Array.isArray(value) ? value[0] : value;
      if (typeof raw !== "string") return null;
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    };

    const startIso = parseDate(startDate);
    if (startIso) {
      const placeholder = addParam(startIso);
      conditions.push(`measured_at >= ${placeholder}::timestamptz`);
    }

    const endIso = parseDate(endDate);
    if (endIso) {
      const placeholder = addParam(endIso);
      conditions.push(`measured_at <= ${placeholder}::timestamptz`);
    }

    const limitNumber = Math.max(parseInt(limit as string, 10) || 50, 1);
    const limitPlaceholder = `$${queryParams.length + 1}`;
    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const vitals = await db.query(
      `SELECT * FROM vital_signs 
       ${whereClause}
       ORDER BY measured_at DESC 
       LIMIT ${limitPlaceholder}`,
      [...queryParams, limitNumber],
    );

    // Analyze each vital against thresholds
    const vitalsWithThresholdAnalysis = [];
    for (const vital of vitals || []) {
      const alert = await thresholdService.checkThreshold(
        patientId,
        vital.type,
        vital.value,
      );
      const effectiveThreshold = await thresholdService.getEffectiveThreshold(
        patientId,
        vital.type,
      );

      vitalsWithThresholdAnalysis.push({
        ...vital,
        thresholdAnalysis: {
          exceedsThreshold: !!alert,
          alert,
          effectiveThreshold,
          status: alert ? alert.severity : "normal",
        },
      });
    }

    res.json({
      success: true,
      patientId,
      vitals: vitalsWithThresholdAnalysis,
      totalCount: vitals?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching patient vitals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch patient vitals",
    });
  }
}

// Simulate vital readings for testing thresholds
export async function simulateVitalReading(req: Request, res: Response) {
  try {
    const { patientId, vitalType, value } = req.body;

    if (!patientId || !vitalType || value === undefined) {
      return res.status(400).json({
        success: false,
        error: "Patient ID, vital type, and value are required",
      });
    }

    // Get effective threshold for this patient
    const effectiveThreshold = await thresholdService.getEffectiveThreshold(
      patientId,
      vitalType,
    );

    // Check if this would trigger an alert
    const alert = await thresholdService.checkThreshold(
      patientId,
      vitalType,
      value,
    );

    res.json({
      success: true,
      simulation: {
        patientId,
        vitalType,
        value,
        effectiveThreshold,
        wouldTriggerAlert: !!alert,
        alert,
        recommendation: alert
          ? `This reading would trigger a ${alert.severity} alert and notify the care team.`
          : "This reading is within acceptable range for this patient.",
      },
    });
  } catch (error) {
    console.error("Error simulating vital reading:", error);
    res.status(500).json({
      success: false,
      error: "Failed to simulate vital reading",
    });
  }
}

// Get threshold comparison for different patients
export async function comparePatientThresholds(req: Request, res: Response) {
  try {
    const { patientIds, thresholdType } = req.body;

    if (!Array.isArray(patientIds) || !thresholdType) {
      return res.status(400).json({
        success: false,
        error: "Patient IDs array and threshold type are required",
      });
    }

    const comparisons = [];
    for (const patientId of patientIds) {
      const effectiveThreshold = await thresholdService.getEffectiveThreshold(
        patientId,
        thresholdType,
      );
      comparisons.push({
        patientId,
        thresholdType,
        effectiveThreshold,
      });
    }

    res.json({
      success: true,
      thresholdType,
      comparisons,
      summary: {
        totalPatients: comparisons.length,
        usingCustomThresholds: comparisons.filter(
          (c) => c.effectiveThreshold?.isPatientSpecific,
        ).length,
        usingGlobalThresholds: comparisons.filter(
          (c) => !c.effectiveThreshold?.isPatientSpecific,
        ).length,
      },
    });
  } catch (error) {
    console.error("Error comparing patient thresholds:", error);
    res.status(500).json({
      success: false,
      error: "Failed to compare patient thresholds",
    });
  }
}

// Get threshold alerts history
export async function getThresholdAlertsHistory(req: Request, res: Response) {
  try {
    const { patientId, limit = 100, startDate, endDate } = req.query;

    const filters: string[] = ["action = 'threshold_alert'"];
    const queryParams: any[] = [];
    const addParam = (value: any) => {
      queryParams.push(value);
      return `$${queryParams.length}`;
    };

    if (typeof patientId === "string" && patientId.trim().length > 0) {
      const placeholder = addParam(patientId.trim());
      filters.push(`user_id = ${placeholder}`);
    }

    const parseDate = (value: unknown) => {
      const raw = Array.isArray(value) ? value[0] : value;
      if (typeof raw !== "string") return null;
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    };

    const startIso = parseDate(startDate);
    if (startIso) {
      const placeholder = addParam(startIso);
      filters.push(`"timestamp" >= ${placeholder}::timestamptz`);
    }

    const endIso = parseDate(endDate);
    if (endIso) {
      const placeholder = addParam(endIso);
      filters.push(`"timestamp" <= ${placeholder}::timestamptz`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const limitNumber = Math.max(parseInt(limit as string, 10) || 100, 1);
    const limitPlaceholder = `$${queryParams.length + 1}`;

    const alerts = await db.query(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY "timestamp" DESC LIMIT ${limitPlaceholder}`,
      [...queryParams, limitNumber],
    );

    const processedAlerts =
      alerts?.map((alert: any) => {
        const details =
          typeof alert.details === "string"
            ? JSON.parse(alert.details)
            : alert.details;
        return {
          id: alert.id,
          patientId: alert.user_id,
          timestamp: alert.timestamp,
          description: alert.description,
          vitalType: details?.vitalType,
          actualValue: details?.actualValue,
          thresholdValue: details?.thresholdValue,
          severity: details?.severity,
          isPatientSpecific: details?.isPatientSpecific,
          messageId: details?.messageId,
        };
      }) || [];

    res.json({
      success: true,
      alerts: processedAlerts,
      totalCount: processedAlerts.length,
    });
  } catch (error) {
    console.error("Error fetching threshold alerts history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch threshold alerts history",
    });
  }
}
