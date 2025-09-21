import { RequestHandler } from "express";
import { Request, Response } from "express";
import { db } from "../utils/databaseAdapter";
import { thresholdService, PatientThreshold } from "../utils/thresholdService";
import { AuditLogger } from "../utils/auditLogger";

// Get all threshold types available
export async function getThresholdTypes(req: Request, res: Response) {
  try {
    const thresholdTypes = thresholdService.getAvailableThresholdTypes();

    res.json({
      success: true,
      thresholdTypes,
    });
  } catch (error) {
    console.error("Error fetching threshold types:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch threshold types",
    });
  }
}

// Get patient-specific thresholds for a patient
export async function getPatientThresholds(req: Request, res: Response) {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: "Patient ID is required",
      });
    }

    const patientThresholds =
      await thresholdService.getPatientThresholds(patientId);

    // Also get the effective thresholds (patient-specific + global fallbacks)
    const thresholdTypes = thresholdService.getAvailableThresholdTypes();
    const effectiveThresholds = [];

    for (const thresholdType of thresholdTypes) {
      const effectiveThreshold = await thresholdService.getEffectiveThreshold(
        patientId,
        thresholdType.type,
      );
      if (effectiveThreshold) {
        effectiveThresholds.push({
          ...thresholdType,
          currentValue: effectiveThreshold.value,
          isPatientSpecific: effectiveThreshold.isPatientSpecific,
          notes: effectiveThreshold.notes,
        });
      }
    }

    res.json({
      success: true,
      patientThresholds,
      effectiveThresholds,
    });
  } catch (error) {
    console.error("Error fetching patient thresholds:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch patient thresholds",
    });
  }
}

// Set or update a patient-specific threshold
export async function setPatientThreshold(req: Request, res: Response) {
  try {
    const { patientId } = req.params;
    const { thresholdType, thresholdValue, unit, notes } = req.body;
    const userId = req.user?.id || "admin";

    if (!patientId || !thresholdType || thresholdValue === undefined) {
      return res.status(400).json({
        success: false,
        error: "Patient ID, threshold type, and threshold value are required",
      });
    }

    // Validate threshold type
    const availableTypes = thresholdService.getAvailableThresholdTypes();
    const isValidType = availableTypes.some((t) => t.type === thresholdType);

    if (!isValidType) {
      return res.status(400).json({
        success: false,
        error: "Invalid threshold type",
      });
    }

    // Validate threshold value is a positive number
    if (typeof thresholdValue !== "number" || thresholdValue <= 0) {
      return res.status(400).json({
        success: false,
        error: "Threshold value must be a positive number",
      });
    }

    const threshold: Omit<PatientThreshold, "id" | "createdAt" | "updatedAt"> =
      {
        patientId,
        thresholdType,
        thresholdValue,
        unit:
          unit ||
          availableTypes.find((t) => t.type === thresholdType)?.unit ||
          "",
        notes: notes || null,
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      };

    const success = await thresholdService.setPatientThreshold(threshold);

    if (success) {
      res.json({
        success: true,
        message: "Patient threshold updated successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to update patient threshold",
      });
    }
  } catch (error) {
    console.error("Error setting patient threshold:", error);
    res.status(500).json({
      success: false,
      error: "Failed to set patient threshold",
    });
  }
}

// Remove a patient-specific threshold (revert to global)
export async function removePatientThreshold(req: Request, res: Response) {
  try {
    const { patientId, thresholdType } = req.params;
    const userId = req.user?.id || "admin";

    if (!patientId || !thresholdType) {
      return res.status(400).json({
        success: false,
        error: "Patient ID and threshold type are required",
      });
    }

    const success = await thresholdService.removePatientThreshold(
      patientId,
      thresholdType,
      userId,
    );

    if (success) {
      res.json({
        success: true,
        message:
          "Patient threshold removed successfully, reverted to global threshold",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to remove patient threshold",
      });
    }
  } catch (error) {
    console.error("Error removing patient threshold:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove patient threshold",
    });
  }
}

// Get list of patients with custom thresholds
export async function getPatientsWithCustomThresholds(
  req: Request,
  res: Response,
) {
  try {
    const patients = await thresholdService.getPatientsWithCustomThresholds();

    res.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error("Error fetching patients with custom thresholds:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch patients with custom thresholds",
    });
  }
}

// Bulk update multiple thresholds for a patient
export async function bulkUpdatePatientThresholds(req: Request, res: Response) {
  try {
    const { patientId } = req.params;
    const { thresholds } = req.body;
    const userId = req.user?.id || "admin";

    if (!patientId || !Array.isArray(thresholds)) {
      return res.status(400).json({
        success: false,
        error: "Patient ID and thresholds array are required",
      });
    }

    const results = [];
    let successCount = 0;

    for (const threshold of thresholds) {
      try {
        const patientThreshold: Omit<
          PatientThreshold,
          "id" | "createdAt" | "updatedAt"
        > = {
          patientId,
          thresholdType: threshold.thresholdType,
          thresholdValue: threshold.thresholdValue,
          unit: threshold.unit || "",
          notes: threshold.notes || null,
          isActive: true,
          createdBy: userId,
          updatedBy: userId,
        };

        const success =
          await thresholdService.setPatientThreshold(patientThreshold);

        results.push({
          thresholdType: threshold.thresholdType,
          success,
          error: success ? null : "Failed to update",
        });

        if (success) successCount++;
      } catch (error) {
        results.push({
          thresholdType: threshold.thresholdType,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.json({
      success: successCount > 0,
      message: `Updated ${successCount} of ${thresholds.length} thresholds`,
      results,
    });
  } catch (error) {
    console.error("Error bulk updating patient thresholds:", error);
    res.status(500).json({
      success: false,
      error: "Failed to bulk update patient thresholds",
    });
  }
}

// Test threshold check for a patient with a given vital reading
export async function testThresholdCheck(req: Request, res: Response) {
  try {
    const { patientId } = req.params;
    const { vitalType, value } = req.body;

    if (!patientId || !vitalType || value === undefined) {
      return res.status(400).json({
        success: false,
        error: "Patient ID, vital type, and value are required",
      });
    }

    const alert = await thresholdService.checkThreshold(
      patientId,
      vitalType,
      value,
    );

    res.json({
      success: true,
      alert,
      message: alert ? "Threshold exceeded" : "Value within normal range",
    });
  } catch (error) {
    console.error("Error testing threshold check:", error);
    res.status(500).json({
      success: false,
      error: "Failed to test threshold check",
    });
  }
}

// Search for patients by ID or name
export async function searchPatients(req: Request, res: Response) {
  try {
    const { query, limit = 20 } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    // This is a simplified search - in a real system, you'd search a patients table
    // For now, we'll search based on existing data in our system
    const searchResults = await db.query(
      `
      SELECT DISTINCT patient_id as id, patient_id as name
      FROM patient_schedules 
      WHERE patient_id LIKE ? 
      LIMIT ?
    `,
      [`%${query}%`, parseInt(limit as string)],
    );

    // Also search from communication logs
    const communicationResults = await db.query(
      `
      SELECT DISTINCT patient_id as id, patient_id as name
      FROM communication_logs 
      WHERE patient_id LIKE ? 
      LIMIT ?
    `,
      [`%${query}%`, parseInt(limit as string)],
    );

    // Combine and deduplicate results
    const allResults = [
      ...(searchResults || []),
      ...(communicationResults || []),
    ];
    const uniqueResults = allResults
      .filter(
        (result, index, self) =>
          index === self.findIndex((r) => r.id === result.id),
      )
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      patients: uniqueResults.map((result) => ({
        id: result.id,
        name: result.name || result.id,
        displayName: `${result.name || result.id} (ID: ${result.id})`,
      })),
    });
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search patients",
    });
  }
}

// Get threshold comparison report
export async function getThresholdReport(req: Request, res: Response) {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: "Patient ID is required",
      });
    }

    const thresholdTypes = thresholdService.getAvailableThresholdTypes();
    const report = [];

    for (const thresholdType of thresholdTypes) {
      const effectiveThreshold = await thresholdService.getEffectiveThreshold(
        patientId,
        thresholdType.type,
      );

      if (effectiveThreshold) {
        report.push({
          thresholdType: thresholdType.type,
          name: thresholdType.name,
          unit: thresholdType.unit,
          description: thresholdType.description,
          currentValue: effectiveThreshold.value,
          isPatientSpecific: effectiveThreshold.isPatientSpecific,
          notes: effectiveThreshold.notes,
          source: effectiveThreshold.isPatientSpecific
            ? "Patient-Specific"
            : "Global Default",
        });
      }
    }

    res.json({
      success: true,
      patientId,
      report,
      summary: {
        totalThresholds: report.length,
        patientSpecific: report.filter((r) => r.isPatientSpecific).length,
        globalDefaults: report.filter((r) => !r.isPatientSpecific).length,
      },
    });
  } catch (error) {
    console.error("Error generating threshold report:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate threshold report",
    });
  }
}
