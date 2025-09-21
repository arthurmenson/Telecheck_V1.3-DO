import { RequestHandler } from "express";
import { db } from "../utils/databaseAdapter";
import { ApiResponse, VitalSigns } from "@shared/types";

// Get vital signs for a user
export const getVitalSigns: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || "user-1";
    const vitals = db.getVitalSigns(userId);

    const response: ApiResponse<VitalSigns[]> = {
      success: true,
      data: vitals,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching vital signs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch vital signs",
    });
  }
};

// Add new vital signs
export const addVitalSigns: RequestHandler = async (req, res) => {
  try {
    const userId = req.body.userId || "user-1";
    const vitalData = req.body;

    const vital = db.createVitalSigns({
      ...vitalData,
      userId,
      recordedAt: new Date().toISOString(),
      source: vitalData.source || "manual",
    });

    const response: ApiResponse<VitalSigns> = {
      success: true,
      data: vital,
      message: "Vital signs recorded successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error adding vital signs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record vital signs",
    });
  }
};

// Get vital signs trends
export const getVitalTrends: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || "user-1";
    const days = parseInt(req.query.days as string) || 30;

    const vitals = db.getVitalSigns(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentVitals = vitals.filter(
      (v) => new Date(v.recordedAt) >= cutoffDate,
    );

    const trends = calculateVitalTrends(recentVitals);

    const response: ApiResponse = {
      success: true,
      data: {
        vitals: recentVitals,
        trends,
        period: `${days} days`,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching vital trends:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch vital trends",
    });
  }
};

function calculateVitalTrends(vitals: VitalSigns[]) {
  if (vitals.length < 2) {
    return {
      heartRate: "insufficient_data",
      bloodPressure: "insufficient_data",
      weight: "insufficient_data",
    };
  }

  const latest = vitals[vitals.length - 1];
  const previous = vitals[vitals.length - 2];

  return {
    heartRate:
      latest.heartRate && previous.heartRate
        ? latest.heartRate > previous.heartRate
          ? "increasing"
          : latest.heartRate < previous.heartRate
            ? "decreasing"
            : "stable"
        : "no_data",
    bloodPressure:
      latest.bloodPressureSystolic && previous.bloodPressureSystolic
        ? latest.bloodPressureSystolic > previous.bloodPressureSystolic
          ? "increasing"
          : latest.bloodPressureSystolic < previous.bloodPressureSystolic
            ? "decreasing"
            : "stable"
        : "no_data",
    weight:
      latest.weight && previous.weight
        ? latest.weight > previous.weight
          ? "increasing"
          : latest.weight < previous.weight
            ? "decreasing"
            : "stable"
        : "no_data",
  };
}
