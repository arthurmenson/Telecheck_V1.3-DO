import { RequestHandler } from "express";
import { Request, Response } from "express";
import { MedicalAI } from "../utils/medicalAI";
import { ImageAnalysisService } from "../utils/imageAnalysis";
import { db } from "../utils/databaseAdapter";
import { ApiResponse } from "@shared/types";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

// Advanced cardiovascular risk assessment
export const assessCardiovascularRisk: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const labResults = db.getLabResults(userId);
    const vitals = db.getVitalSigns(userId);
    const demographics = { age: 39, gender: 'male' }; // Mock demographics
    
    const riskAssessment = MedicalAI.calculateCardiovascularRisk(labResults, vitals, demographics);
    
    res.json({
      success: true,
      data: riskAssessment
    });
  } catch (error) {
    console.error('Cardiovascular risk assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assess cardiovascular risk'
    });
  }
};

// Advanced drug interaction analysis
export const analyzeAdvancedInteractions: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const medications = db.getMedications(userId);
    
    // Mock PGx profile
    const pgxProfile = {
      CYP2D6: '*1/*4', // Poor metabolizer
      SLCO1B1: '*1A/*15', // Decreased function
      CYP2C19: '*1/*2' // Intermediate metabolizer
    };
    
    const analysis = MedicalAI.analyzeDrugInteractions(medications, pgxProfile);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Drug interaction analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze drug interactions'
    });
  }
};

// Predictive health analytics
export const generatePredictiveAnalytics: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const labResults = db.getLabResults(userId);
    const vitals = db.getVitalSigns(userId);
    const medications = db.getMedications(userId);
    
    const analytics = MedicalAI.generatePredictiveAnalytics(labResults, vitals, medications);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Predictive analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate predictive analytics'
    });
  }
};

// Medical image analysis
export const analyzeMiddleware = upload.single('medicalImage');

export const analyzeMedicalImage: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image uploaded'
      });
    }

    const { imageType = 'general' } = req.body;
    const file = req.file;
    
    let analysisResult;
    
    if (imageType === 'lab_report') {
      // OCR for lab reports
      const ocrResult = await ImageAnalysisService.extractTextFromImage(file.buffer, file.mimetype);
      const parsedData = ImageAnalysisService.parseLabResults(ocrResult.text);
      
      analysisResult = {
        type: 'lab_report',
        ocr: ocrResult,
        parsed: parsedData,
        aiInsights: await MedicalAI.analyzeLabReport(file.buffer, file.originalname)
      };
    } else if (imageType === 'skin_lesion') {
      // Dermatology AI analysis
      analysisResult = await ImageAnalysisService.analyzeSkinLesion(file.buffer);
    } else {
      // General medical image classification
      analysisResult = await ImageAnalysisService.classifyMedicalImage(file.buffer, imageType);
    }
    
    res.json({
      success: true,
      data: analysisResult
    });
  } catch (error) {
    console.error('Medical image analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze medical image'
    });
  }
};

// Symptom assessment with differential diagnosis
export const assessSymptoms: RequestHandler = async (req, res) => {
  try {
    const { symptoms, demographics } = req.body;
    const userId = req.body.userId || 'user-1';
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms array is required'
      });
    }
    
    const vitals = db.getVitalSigns(userId);
    const latestVital = vitals[vitals.length - 1];
    
    const assessment = MedicalAI.assessSymptoms(symptoms, demographics, latestVital ? [latestVital] : []);
    
    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Symptom assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assess symptoms'
    });
  }
};

// Advanced health scoring
export const calculateAdvancedHealthScore: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const labResults = db.getLabResults(userId);
    const vitals = db.getVitalSigns(userId);
    const medications = db.getMedications(userId);
    
    const healthScore = MedicalAI.calculateHealthScore(labResults, vitals, medications);
    
    res.json({
      success: true,
      data: healthScore
    });
  } catch (error) {
    console.error('Health score calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate health score'
    });
  }
};

// Clinical decision support
export const getClinicalRecommendations: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const labResults = db.getLabResults(userId);
    const medications = db.getMedications(userId);
    const vitals = db.getVitalSigns(userId);
    const demographics = { age: 39, gender: 'male' };
    
    const clinicalSupport = MedicalAI.generateClinicalRecommendations(
      labResults, 
      medications, 
      vitals, 
      demographics
    );
    
    res.json({
      success: true,
      data: clinicalSupport
    });
  } catch (error) {
    console.error('Clinical recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate clinical recommendations'
    });
  }
};