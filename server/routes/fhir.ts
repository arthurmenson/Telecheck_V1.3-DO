import { RequestHandler } from "express";
import { FHIRIntegrationService } from "../utils/fhirIntegration";
import { db } from "../utils/databaseAdapter";
import { ApiResponse } from "@shared/types";

// Export health data in FHIR format
export const exportFHIRData: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const { dataTypes = ['patient', 'observations', 'medications'] } = req.body;
    
    const fhirExport = await FHIRIntegrationService.exportHealthDataAsFHIR(userId, dataTypes);
    
    res.json({
      success: true,
      data: fhirExport
    });
  } catch (error) {
    console.error('FHIR export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export FHIR data'
    });
  }
};

// Import FHIR bundle
export const importFHIRData: RequestHandler = async (req, res) => {
  try {
    const { bundle } = req.body;
    
    if (!bundle || bundle.resourceType !== 'Bundle') {
      return res.status(400).json({
        success: false,
        error: 'Valid FHIR Bundle is required'
      });
    }
    
    const importResult = await FHIRIntegrationService.importFHIRBundle(bundle);
    
    res.json({
      success: true,
      data: importResult
    });
  } catch (error) {
    console.error('FHIR import error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import FHIR data'
    });
  }
};

// Get FHIR patient resource
export const getFHIRPatient: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const user = db.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    const fhirPatient = FHIRIntegrationService.convertToFHIRPatient(user);
    
    res.json({
      success: true,
      data: fhirPatient
    });
  } catch (error) {
    console.error('FHIR patient error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get FHIR patient data'
    });
  }
};

// Get FHIR observations (lab results)
export const getFHIRObservations: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const labResults = db.getLabResults(userId);
    
    const fhirObservations = labResults.map(result => 
      FHIRIntegrationService.convertToFHIRObservation(result)
    );
    
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: fhirObservations.length,
      entry: fhirObservations.map(obs => ({ resource: obs }))
    };
    
    res.json({
      success: true,
      data: bundle
    });
  } catch (error) {
    console.error('FHIR observations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get FHIR observations'
    });
  }
};