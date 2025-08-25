import { db as database } from "../utils/databaseAdapter";
import { AuditLogger } from "./auditLogger";

export interface Threshold {
  type: string;
  value: number;
  unit: string;
  isPatientSpecific: boolean;
  notes?: string;
}

export interface ThresholdAlert {
  patientId: string;
  thresholdType: string;
  actualValue: number;
  thresholdValue: number;
  unit: string;
  severity: "low" | "medium" | "high" | "critical";
  isPatientSpecific: boolean;
  alertMessage: string;
}

export interface PatientThreshold {
  id?: number;
  patientId: string;
  thresholdType: string;
  thresholdValue: number;
  unit: string;
  notes?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Default threshold configurations
const DEFAULT_THRESHOLDS = {
  glucose_low: { value: 70, unit: "mg/dL", severity: "critical" },
  glucose_high: { value: 400, unit: "mg/dL", severity: "critical" },
  bp_systolic_high: { value: 180, unit: "mmHg", severity: "high" },
  bp_diastolic_high: { value: 110, unit: "mmHg", severity: "high" },
  bp_systolic_low: { value: 90, unit: "mmHg", severity: "medium" },
  bp_diastolic_low: { value: 60, unit: "mmHg", severity: "medium" },
  heart_rate_high: { value: 120, unit: "bpm", severity: "high" },
  heart_rate_low: { value: 50, unit: "bpm", severity: "high" },
  temperature_high: { value: 101.5, unit: "°F", severity: "high" },
  temperature_low: { value: 95.0, unit: "°F", severity: "high" },
  oxygen_saturation_low: { value: 88, unit: "%", severity: "critical" },
  weight_change_percentage: { value: 5, unit: "%", severity: "medium" }, // 5% weight change
  systolic_pressure_critical: {
    value: 200,
    unit: "mmHg",
    severity: "critical",
  },
  diastolic_pressure_critical: {
    value: 120,
    unit: "mmHg",
    severity: "critical",
  },
};

export class ThresholdService {
  /**
   * Get effective threshold for a patient (patient-specific if exists, otherwise global)
   */
  async getEffectiveThreshold(
    patientId: string,
    thresholdType: string,
  ): Promise<Threshold | null> {
    try {
      // First check for patient-specific threshold
      const patientThreshold = await database.query(
        `SELECT * FROM patient_thresholds 
         WHERE patient_id = ? AND threshold_type = ? AND is_active = 1`,
        [patientId, thresholdType],
      );

      if (patientThreshold && patientThreshold.length > 0) {
        const pt = patientThreshold[0];
        return {
          type: pt.threshold_type,
          value: pt.threshold_value,
          unit: pt.unit,
          isPatientSpecific: true,
          notes: pt.notes,
        };
      }

      // Fall back to global threshold from messaging config
      const config = await database.query(
        "SELECT config_data FROM messaging_config ORDER BY created_at DESC LIMIT 1",
      );

      if (config && config.length > 0) {
        const configData = JSON.parse(config[0].config_data);
        const globalThresholds = configData.thresholds || {};

        // Map threshold types to config keys
        const thresholdMap: Record<string, string> = {
          glucose_low: "glucoseLow",
          glucose_high: "glucoseHigh",
          bp_systolic_high: "bpSystolicHigh",
          bp_diastolic_high: "bpDiastolicHigh",
          heart_rate_high: "heartRateHigh",
          heart_rate_low: "heartRateLow",
          temperature_high: "temperatureHigh",
          temperature_low: "temperatureLow",
          oxygen_saturation_low: "oxygenSatLow",
        };

        const configKey = thresholdMap[thresholdType];
        if (configKey && globalThresholds[configKey] !== undefined) {
          const defaultThreshold =
            DEFAULT_THRESHOLDS[
              thresholdType as keyof typeof DEFAULT_THRESHOLDS
            ];
          return {
            type: thresholdType,
            value: globalThresholds[configKey],
            unit: defaultThreshold?.unit || "",
            isPatientSpecific: false,
          };
        }
      }

      // Use hardcoded defaults as final fallback
      const defaultThreshold =
        DEFAULT_THRESHOLDS[thresholdType as keyof typeof DEFAULT_THRESHOLDS];
      if (defaultThreshold) {
        return {
          type: thresholdType,
          value: defaultThreshold.value,
          unit: defaultThreshold.unit,
          isPatientSpecific: false,
        };
      }

      return null;
    } catch (error) {
      console.error(
        `Error getting effective threshold for patient ${patientId}, type ${thresholdType}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Check if a vital sign reading exceeds the threshold for a patient
   */
  async checkThreshold(
    patientId: string,
    vitalType: string,
    value: number,
  ): Promise<ThresholdAlert | null> {
    try {
      const thresholdTypes = this.getThresholdTypesForVital(vitalType, value);

      for (const thresholdType of thresholdTypes) {
        const threshold = await this.getEffectiveThreshold(
          patientId,
          thresholdType,
        );

        if (!threshold) continue;

        const isExceeded = this.isThresholdExceeded(
          thresholdType,
          value,
          threshold.value,
        );

        if (isExceeded) {
          const severity = this.getSeverity(
            thresholdType,
            value,
            threshold.value,
          );
          const alertMessage = this.generateAlertMessage(
            vitalType,
            value,
            threshold,
          );

          return {
            patientId,
            thresholdType,
            actualValue: value,
            thresholdValue: threshold.value,
            unit: threshold.unit,
            severity,
            isPatientSpecific: threshold.isPatientSpecific,
            alertMessage,
          };
        }
      }

      return null;
    } catch (error) {
      console.error(
        `Error checking threshold for patient ${patientId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Set or update a patient-specific threshold
   */
  async setPatientThreshold(
    threshold: Omit<PatientThreshold, "id" | "createdAt" | "updatedAt">,
  ): Promise<boolean> {
    try {
      await database.query(
        `INSERT OR REPLACE INTO patient_thresholds 
         (patient_id, threshold_type, threshold_value, unit, notes, is_active, created_by, updated_by, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          threshold.patientId,
          threshold.thresholdType,
          threshold.thresholdValue,
          threshold.unit,
          threshold.notes || null,
          threshold.isActive ? 1 : 0,
          threshold.createdBy,
          threshold.updatedBy || threshold.createdBy,
        ],
      );

      AuditLogger.log(
        threshold.updatedBy || threshold.createdBy,
        "patient_threshold_update",
        `Set patient-specific threshold: ${threshold.thresholdType} = ${threshold.thresholdValue} ${threshold.unit}`,
        {
          patientId: threshold.patientId,
          thresholdType: threshold.thresholdType,
          thresholdValue: threshold.thresholdValue,
          unit: threshold.unit,
        },
      );

      return true;
    } catch (error) {
      console.error("Error setting patient threshold:", error);
      return false;
    }
  }

  /**
   * Get all patient-specific thresholds for a patient
   */
  async getPatientThresholds(patientId: string): Promise<PatientThreshold[]> {
    try {
      const thresholds = await database.query(
        `SELECT * FROM patient_thresholds 
         WHERE patient_id = ? AND is_active = 1 
         ORDER BY threshold_type`,
        [patientId],
      );

      return (
        thresholds?.map((t: any) => ({
          id: t.id,
          patientId: t.patient_id,
          thresholdType: t.threshold_type,
          thresholdValue: t.threshold_value,
          unit: t.unit,
          notes: t.notes,
          isActive: t.is_active === 1,
          createdBy: t.created_by,
          updatedBy: t.updated_by,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        })) || []
      );
    } catch (error) {
      console.error(
        `Error getting patient thresholds for ${patientId}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Remove a patient-specific threshold (revert to global)
   */
  async removePatientThreshold(
    patientId: string,
    thresholdType: string,
    userId: string,
  ): Promise<boolean> {
    try {
      await database.query(
        `UPDATE patient_thresholds 
         SET is_active = 0, updated_by = ?, updated_at = datetime('now')
         WHERE patient_id = ? AND threshold_type = ?`,
        [userId, patientId, thresholdType],
      );

      AuditLogger.log(
        userId,
        "patient_threshold_remove",
        `Removed patient-specific threshold: ${thresholdType}`,
        {
          patientId,
          thresholdType,
          revertedToGlobal: true,
        },
      );

      return true;
    } catch (error) {
      console.error("Error removing patient threshold:", error);
      return false;
    }
  }

  /**
   * Get all patients with custom thresholds
   */
  async getPatientsWithCustomThresholds(): Promise<
    Array<{ patientId: string; thresholdCount: number }>
  > {
    try {
      const results = await database.query(`
        SELECT 
          patient_id, 
          COUNT(*) as threshold_count
        FROM patient_thresholds 
        WHERE is_active = 1 
        GROUP BY patient_id
        ORDER BY patient_id
      `);

      return (
        results?.map((r: any) => ({
          patientId: r.patient_id,
          thresholdCount: r.threshold_count,
        })) || []
      );
    } catch (error) {
      console.error("Error getting patients with custom thresholds:", error);
      return [];
    }
  }

  private getThresholdTypesForVital(
    vitalType: string,
    value: number,
  ): string[] {
    const typeMap: Record<string, string[]> = {
      glucose: ["glucose_low", "glucose_high"],
      blood_glucose: ["glucose_low", "glucose_high"],
      blood_pressure_systolic: [
        "bp_systolic_high",
        "bp_systolic_low",
        "systolic_pressure_critical",
      ],
      blood_pressure_diastolic: [
        "bp_diastolic_high",
        "bp_diastolic_low",
        "diastolic_pressure_critical",
      ],
      heart_rate: ["heart_rate_high", "heart_rate_low"],
      pulse: ["heart_rate_high", "heart_rate_low"],
      temperature: ["temperature_high", "temperature_low"],
      oxygen_saturation: ["oxygen_saturation_low"],
      spo2: ["oxygen_saturation_low"],
      weight: ["weight_change_percentage"],
    };

    return typeMap[vitalType.toLowerCase()] || [];
  }

  private isThresholdExceeded(
    thresholdType: string,
    value: number,
    thresholdValue: number,
  ): boolean {
    const highThresholds = [
      "glucose_high",
      "bp_systolic_high",
      "bp_diastolic_high",
      "heart_rate_high",
      "temperature_high",
      "systolic_pressure_critical",
      "diastolic_pressure_critical",
    ];
    const lowThresholds = [
      "glucose_low",
      "bp_systolic_low",
      "bp_diastolic_low",
      "heart_rate_low",
      "temperature_low",
      "oxygen_saturation_low",
    ];

    if (highThresholds.includes(thresholdType)) {
      return value > thresholdValue;
    } else if (lowThresholds.includes(thresholdType)) {
      return value < thresholdValue;
    }

    return false;
  }

  private getSeverity(
    thresholdType: string,
    value: number,
    thresholdValue: number,
  ): "low" | "medium" | "high" | "critical" {
    const defaultThreshold =
      DEFAULT_THRESHOLDS[thresholdType as keyof typeof DEFAULT_THRESHOLDS];
    if (defaultThreshold) {
      return defaultThreshold.severity as
        | "low"
        | "medium"
        | "high"
        | "critical";
    }

    // Calculate severity based on how far the value exceeds the threshold
    const percentageExceeded =
      Math.abs((value - thresholdValue) / thresholdValue) * 100;

    if (percentageExceeded > 50) return "critical";
    if (percentageExceeded > 25) return "high";
    if (percentageExceeded > 10) return "medium";
    return "low";
  }

  private generateAlertMessage(
    vitalType: string,
    value: number,
    threshold: Threshold,
  ): string {
    const vitalDisplayName = vitalType
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const source = threshold.isPatientSpecific ? "patient-specific" : "global";

    return `${vitalDisplayName}: ${value} ${threshold.unit} exceeds ${source} threshold of ${threshold.value} ${threshold.unit}`;
  }

  /**
   * Get all available threshold types with their descriptions
   */
  getAvailableThresholdTypes(): Array<{
    type: string;
    name: string;
    unit: string;
    description: string;
  }> {
    return [
      {
        type: "glucose_low",
        name: "Glucose Critical Low",
        unit: "mg/dL",
        description: "Critical low blood glucose level",
      },
      {
        type: "glucose_high",
        name: "Glucose Critical High",
        unit: "mg/dL",
        description: "Critical high blood glucose level",
      },
      {
        type: "bp_systolic_high",
        name: "BP Systolic High",
        unit: "mmHg",
        description: "High systolic blood pressure alert",
      },
      {
        type: "bp_diastolic_high",
        name: "BP Diastolic High",
        unit: "mmHg",
        description: "High diastolic blood pressure alert",
      },
      {
        type: "bp_systolic_low",
        name: "BP Systolic Low",
        unit: "mmHg",
        description: "Low systolic blood pressure alert",
      },
      {
        type: "bp_diastolic_low",
        name: "BP Diastolic Low",
        unit: "mmHg",
        description: "Low diastolic blood pressure alert",
      },
      {
        type: "heart_rate_high",
        name: "Heart Rate High",
        unit: "bpm",
        description: "High heart rate alert",
      },
      {
        type: "heart_rate_low",
        name: "Heart Rate Low",
        unit: "bpm",
        description: "Low heart rate alert",
      },
      {
        type: "temperature_high",
        name: "Temperature High",
        unit: "°F",
        description: "High body temperature alert",
      },
      {
        type: "temperature_low",
        name: "Temperature Low",
        unit: "°F",
        description: "Low body temperature alert",
      },
      {
        type: "oxygen_saturation_low",
        name: "Oxygen Saturation Low",
        unit: "%",
        description: "Low oxygen saturation alert",
      },
      {
        type: "systolic_pressure_critical",
        name: "BP Systolic Critical",
        unit: "mmHg",
        description: "Critical systolic blood pressure",
      },
      {
        type: "diastolic_pressure_critical",
        name: "BP Diastolic Critical",
        unit: "mmHg",
        description: "Critical diastolic blood pressure",
      },
    ];
  }
}

export const thresholdService = new ThresholdService();
