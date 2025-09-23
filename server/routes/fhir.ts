import { RequestHandler } from "express";
import { FHIRIntegrationService } from "../utils/fhirIntegration";
import { db } from "../utils/databaseAdapter";
import { ApiResponse } from "@shared/types";
import { Router } from "express";
import { AuditLogger } from "../utils/auditLogger";
import { authenticateToken } from "../middleware/auth";

// Export health data in FHIR format
export const exportFHIRData: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || "user-1";
    const { dataTypes = ["patient", "observations", "medications"] } = req.body;

    const fhirExport = await FHIRIntegrationService.exportHealthDataAsFHIR(
      userId,
      dataTypes,
    );

    // Audit log
    try {
      const auditUser = (req as any).user?.id || userId;
      await AuditLogger.logDataAccess(
        auditUser,
        "fhir_export",
        "export",
        { dataTypes },
      );
    } catch {}

    res.json({
      success: true,
      data: fhirExport,
    });
  } catch (error) {
    console.error("FHIR export error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export FHIR data",
    });
  }
};

// Import FHIR bundle
export const importFHIRData: RequestHandler = async (req, res) => {
  try {
    const { bundle } = req.body;

    if (!bundle || bundle.resourceType !== "Bundle") {
      return res.status(400).json({
        success: false,
        error: "Valid FHIR Bundle is required",
      });
    }

    const importResult = await FHIRIntegrationService.importFHIRBundle(bundle);

    // Audit log
    try {
      const userId = (req as any).user?.id || "unknown";
      await AuditLogger.logDataAccess(
        userId,
        "fhir_import",
        "import",
        { resourceCount: bundle?.entry?.length || 0 },
      );
    } catch {}

    res.json({
      success: true,
      data: importResult,
    });
  } catch (error) {
    console.error("FHIR import error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to import FHIR data",
    });
  }
};

// Get FHIR patient resource
export const getFHIRPatient: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || "user-1";
    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Patient not found",
      });
    }

    const fhirPatient = FHIRIntegrationService.convertToFHIRPatient(user);

    // Audit
    try {
      const userIdAuth = (req as any).user?.id || userId;
      await AuditLogger.logDataAccess(
        userIdAuth,
        "fhir_patient",
        "read",
        { targetUserId: userId },
      );
    } catch {}

    res.json({
      success: true,
      data: fhirPatient,
    });
  } catch (error) {
    console.error("FHIR patient error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get FHIR patient data",
    });
  }
};

// Get FHIR observations (lab results)
export const getFHIRObservations: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || "user-1";
    const labResults = await db.getLabResults(userId);

    const fhirObservations = labResults.map((result: any) =>
      FHIRIntegrationService.convertToFHIRObservation(result),
    );

    const bundle = {
      resourceType: "Bundle",
      type: "searchset",
      total: fhirObservations.length,
      entry: fhirObservations.map((obs) => ({ resource: obs })),
    };

    // Audit
    try {
      const userIdAuth = (req as any).user?.id || userId;
      await AuditLogger.logDataAccess(
        userIdAuth,
        "fhir_observations",
        "read",
        { count: fhirObservations.length },
      );
    } catch {}

    res.json({
      success: true,
      data: bundle,
    });
  } catch (error) {
    console.error("FHIR observations error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get FHIR observations",
    });
  }
};

// Router exposing FHIR R4 resources (minimal)
export const fhirRouter = Router();
fhirRouter.use(authenticateToken);
fhirRouter.post("/export/:userId?", exportFHIRData);
fhirRouter.post("/import", importFHIRData);
fhirRouter.get("/patient/:userId?", getFHIRPatient);
fhirRouter.get("/observations/:userId?", getFHIRObservations);

// Stubs for additional resources
fhirRouter.get("/Encounter/:id", (req, res) => res.json({ success: true, data: { resourceType: "Encounter", id: req.params.id } }));
fhirRouter.get("/Condition/:id", (req, res) => res.json({ success: true, data: { resourceType: "Condition", id: req.params.id } }));
fhirRouter.get("/AllergyIntolerance/:id", (req, res) => res.json({ success: true, data: { resourceType: "AllergyIntolerance", id: req.params.id } }));
fhirRouter.get("/Immunization/:id", (req, res) => res.json({ success: true, data: { resourceType: "Immunization", id: req.params.id } }));
fhirRouter.get("/MedicationRequest/:id", (req, res) => res.json({ success: true, data: { resourceType: "MedicationRequest", id: req.params.id } }));
