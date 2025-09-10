import { RequestHandler } from "express";
import { db } from "../utils/databaseAdapter";
import { ApiResponse, HealthInsight } from "@shared/types";

// Get health insights for a user
export const getHealthInsights: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || "user-1";
    const insights = db.getHealthInsights(userId);

    const response: ApiResponse<HealthInsight[]> = {
      success: true,
      data: insights,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching health insights:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch health insights",
    });
  }
};

// Dismiss a health insight
export const dismissInsight: RequestHandler = async (req, res) => {
  try {
    const insightId = req.params.id;
    const success = db.dismissHealthInsight(insightId);

    if (success) {
      res.json({
        success: true,
        message: "Insight dismissed successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Insight not found",
      });
    }
  } catch (error) {
    console.error("Error dismissing insight:", error);
    res.status(500).json({
      success: false,
      error: "Failed to dismiss insight",
    });
  }
};

// Generate new insights based on current data
export const generateInsights: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || "user-1";

    // Get user's current data
    const labResults = db.getLabResults(userId);
    const medications = db.getMedications(userId);
    const vitals = db.getVitalSigns(userId);

    const newInsights = [];

    // Generate insights based on lab results
    if (labResults.length > 0) {
      const highResults = labResults.filter((r) => r.status === "high");
      const criticalResults = labResults.filter((r) => r.status === "critical");

      if (criticalResults.length > 0) {
        newInsights.push({
          type: "alert" as const,
          title: "Critical Lab Values Detected",
          description: `${criticalResults.length} lab value(s) are in critical range. Immediate medical attention may be required.`,
          priority: "critical" as const,
          category: "Lab Results",
          confidence: 95,
          actionRequired: true,
          dismissed: false,
        });
      }

      if (highResults.length > 0) {
        newInsights.push({
          type: "recommendation" as const,
          title: "Elevated Lab Values",
          description: `${highResults.length} lab value(s) are elevated. Consider lifestyle modifications and follow-up testing.`,
          priority: "medium" as const,
          category: "Lab Results",
          confidence: 88,
          actionRequired: true,
          dismissed: false,
        });
      }
    }

    // Generate insights based on medications
    if (medications.length > 3) {
      newInsights.push({
        type: "insight" as const,
        title: "Medication Review Recommended",
        description: `You're taking ${medications.length} medications. A comprehensive medication review with your pharmacist could optimize your therapy.`,
        priority: "low" as const,
        category: "Medications",
        confidence: 75,
        actionRequired: false,
        dismissed: false,
      });
    }

    // Generate insights based on vitals
    if (vitals.length > 0) {
      const latestVital = vitals[vitals.length - 1];
      if (
        latestVital.bloodPressureSystolic &&
        latestVital.bloodPressureSystolic > 140
      ) {
        newInsights.push({
          type: "alert" as const,
          title: "Elevated Blood Pressure",
          description: `Your recent blood pressure reading of ${latestVital.bloodPressureSystolic}/${latestVital.bloodPressureDiastolic} mmHg is elevated. Monitor closely and consult your healthcare provider.`,
          priority: "high" as const,
          category: "Vital Signs",
          confidence: 92,
          actionRequired: true,
          dismissed: false,
        });
      }
    }

    // Save new insights
    const savedInsights = [];
    for (const insight of newInsights) {
      const saved = db.createHealthInsight({
        ...insight,
        userId,
      });
      savedInsights.push(saved);
    }

    const response: ApiResponse<HealthInsight[]> = {
      success: true,
      data: savedInsights,
      message: `Generated ${savedInsights.length} new insights`,
    };

    res.json(response);
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate insights",
    });
  }
};
