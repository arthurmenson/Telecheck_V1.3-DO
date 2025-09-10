import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initializeDatabase, healthCheck } from "./config/database";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import patientRoutes from "./routes/patients";
import labRoutes from "./routes/labs";
import medicationRoutes from "./routes/medications";
import { handleDemo } from "./routes/demo";
import { handleChat, getChatHistory } from "./routes/chat";
import { getVitalSigns, addVitalSigns, getVitalTrends } from "./routes/vitals";
import {
  getHealthInsights,
  dismissInsight,
  generateInsights,
} from "./routes/insights";
import multer from "multer";
import {
  assessCardiovascularRisk,
  analyzeAdvancedInteractions,
  generatePredictiveAnalytics,
  analyzeMedicalImage,
  analyzeMiddleware,
  assessSymptoms,
  calculateAdvancedHealthScore,
  getClinicalRecommendations,
} from "./routes/advanced-ai";
import {
  syncAppleHealth,
  syncFitbit,
  syncCGM,
  getAggregatedWearableData,
  registerWearableDevice,
  getConnectedDevices,
} from "./routes/wearables";
import {
  getAvailableProviders,
  scheduleAppointment,
  getUserAppointments,
  createConsultationRoom,
  generateConsultationSummary,
  triageEmergency,
} from "./routes/telemedicine";
import {
  exportFHIRData,
  importFHIRData,
  getFHIRPatient,
  getFHIRObservations,
} from "./routes/fhir";
import {
  sendMessage,
  sendCriticalAlert,
  sendDailyReminders,
  sendAppointmentReminders,
  getMessageStatus,
  sendMedicationReminder,
  sendDeviceAlert,
  sendCarePlanUpdate,
  testMessagingService,
  getMessagingStatus,
} from "./routes/messaging";
import {
  handleTelnyxSMSWebhook,
  handleTelnyxCallWebhook,
  handleTwilioSMSWebhook,
  handleTwilioCallWebhook,
  generateTwiMLVoice,
  verifyTelnyxSignature,
  verifyTwilioSignature,
} from "./routes/webhooks";
import {
  getMessagingConfig,
  updateMessagingConfig,
  testMessagingService as testMessagingAdmin,
  getMessagingAnalytics,
  getPatientSchedules,
  updatePatientSchedule,
  getMessageTemplates,
  updateMessageTemplate,
  getCareTeamConfig,
  updateCareTeamMember,
  getMessagingAuditLogs,
  sendWellnessCheck,
} from "./routes/messaging-admin";
import {
  getThresholdTypes,
  getPatientThresholds,
  setPatientThreshold,
  removePatientThreshold,
  getPatientsWithCustomThresholds,
  bulkUpdatePatientThresholds,
  testThresholdCheck,
  searchPatients,
  getThresholdReport,
} from "./routes/patient-thresholds";
import {
  submitVitalReading,
  getPatientVitals,
  simulateVitalReading,
  comparePatientThresholds,
  getThresholdAlertsHistory,
} from "./routes/vital-monitoring";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export async function createServer() {
  // Initialize database connections
  await initializeDatabase();

  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    }),
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: "Too many requests from this IP",
      code: "RATE_LIMIT_EXCEEDED",
    },
  });
  app.use("/api/", limiter);

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check routes
  app.use("/api", healthRoutes);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // User management routes
  app.use("/api/users", userRoutes);

  // Patient routes
  app.use("/api/patients", patientRoutes);

  // Lab routes
  app.use("/api/labs", labRoutes);

  // Medication routes
  app.use("/api/medications", medicationRoutes);

  app.post("/api/chat", handleChat);
  app.get("/api/chat/history/:userId?", getChatHistory);

  // Vital signs routes
  app.get("/api/vitals/:userId?", getVitalSigns);
  app.post("/api/vitals", addVitalSigns);
  app.get("/api/vitals/trends/:userId?", getVitalTrends);

  // Health insights routes
  app.get("/api/insights/:userId?", getHealthInsights);
  app.post("/api/insights/:id/dismiss", dismissInsight);
  app.post("/api/insights/generate/:userId?", generateInsights);

  // Advanced AI routes
  app.get("/api/ai/cardiovascular-risk/:userId?", assessCardiovascularRisk);
  app.get("/api/ai/drug-interactions/:userId?", analyzeAdvancedInteractions);
  app.get("/api/ai/predictive-analytics/:userId?", generatePredictiveAnalytics);
  app.post("/api/ai/analyze-image", analyzeMiddleware, analyzeMedicalImage);
  app.post("/api/ai/assess-symptoms", assessSymptoms);
  app.get("/api/ai/health-score/:userId?", calculateAdvancedHealthScore);
  app.get(
    "/api/ai/clinical-recommendations/:userId?",
    getClinicalRecommendations,
  );

  // Wearable integration routes
  app.get("/api/wearables/apple-health/:userId?", syncAppleHealth);
  app.get("/api/wearables/fitbit/:userId?", syncFitbit);
  app.get("/api/wearables/cgm/:userId?", syncCGM);
  app.get("/api/wearables/aggregate/:userId?", getAggregatedWearableData);
  app.post("/api/wearables/register", registerWearableDevice);
  app.get("/api/wearables/devices/:userId?", getConnectedDevices);

  // Telemedicine routes
  app.get("/api/telemedicine/providers", getAvailableProviders);
  app.post("/api/telemedicine/schedule", scheduleAppointment);
  app.get("/api/telemedicine/appointments/:userId?", getUserAppointments);
  app.post("/api/telemedicine/room", createConsultationRoom);
  app.get("/api/telemedicine/summary/:roomId", generateConsultationSummary);
  app.post("/api/telemedicine/triage", triageEmergency);

  // FHIR integration routes
  app.post("/api/fhir/export/:userId?", exportFHIRData);
  app.post("/api/fhir/import", importFHIRData);
  app.get("/api/fhir/patient/:userId?", getFHIRPatient);
  app.get("/api/fhir/observations/:userId?", getFHIRObservations);

  // Messaging routes
  app.post("/api/messaging/send", sendMessage);
  app.post("/api/messaging/critical-alert", sendCriticalAlert);
  app.post("/api/messaging/daily-reminders", sendDailyReminders);
  app.post("/api/messaging/appointment-reminders", sendAppointmentReminders);
  app.get("/api/messaging/status/:messageId/:provider", getMessageStatus);
  app.post("/api/messaging/medication-reminder", sendMedicationReminder);
  app.post("/api/messaging/device-alert", sendDeviceAlert);
  app.post("/api/messaging/care-plan-update", sendCarePlanUpdate);
  app.post("/api/messaging/test", testMessagingService);
  app.get("/api/messaging/status", getMessagingStatus);

  // Webhook routes for Telnyx
  app.post(
    "/api/webhooks/telnyx/sms",
    verifyTelnyxSignature,
    handleTelnyxSMSWebhook,
  );
  app.post(
    "/api/webhooks/telnyx/call",
    verifyTelnyxSignature,
    handleTelnyxCallWebhook,
  );

  // Webhook routes for Twilio
  app.post(
    "/api/webhooks/twilio/sms",
    verifyTwilioSignature,
    handleTwilioSMSWebhook,
  );
  app.post(
    "/api/webhooks/twilio/call",
    verifyTwilioSignature,
    handleTwilioCallWebhook,
  );

  // TwiML generation for Twilio voice
  app.get("/api/twiml/voice", generateTwiMLVoice);

  // Messaging administration routes
  app.get("/api/admin/messaging/config", getMessagingConfig);
  app.post("/api/admin/messaging/config", updateMessagingConfig);
  app.post("/api/admin/messaging/test", testMessagingAdmin);
  app.get("/api/admin/messaging/analytics", getMessagingAnalytics);
  app.get("/api/admin/messaging/schedules", getPatientSchedules);
  app.post("/api/admin/messaging/schedules/:patientId", updatePatientSchedule);
  app.get("/api/admin/messaging/templates", getMessageTemplates);
  app.post("/api/admin/messaging/templates/:templateId", updateMessageTemplate);
  app.get("/api/admin/messaging/care-team", getCareTeamConfig);
  app.post("/api/admin/messaging/care-team/:memberId", updateCareTeamMember);
  app.get("/api/admin/messaging/audit-logs", getMessagingAuditLogs);
  app.post("/api/admin/messaging/wellness-check", sendWellnessCheck);

  // Patient thresholds routes
  app.get("/api/admin/thresholds/types", getThresholdTypes);
  app.get("/api/admin/thresholds/patients", getPatientsWithCustomThresholds);
  app.get("/api/admin/thresholds/patients/search", searchPatients);
  app.get("/api/admin/thresholds/patients/:patientId", getPatientThresholds);
  app.post("/api/admin/thresholds/patients/:patientId", setPatientThreshold);
  app.delete(
    "/api/admin/thresholds/patients/:patientId/:thresholdType",
    removePatientThreshold,
  );
  app.post(
    "/api/admin/thresholds/patients/:patientId/bulk",
    bulkUpdatePatientThresholds,
  );
  app.post(
    "/api/admin/thresholds/patients/:patientId/test",
    testThresholdCheck,
  );
  app.get(
    "/api/admin/thresholds/patients/:patientId/report",
    getThresholdReport,
  );

  // Vital monitoring routes with threshold checking
  app.post("/api/vitals/submit", submitVitalReading);
  app.get("/api/vitals/patients/:patientId", getPatientVitals);
  app.post("/api/vitals/simulate", simulateVitalReading);
  app.post("/api/vitals/compare-thresholds", comparePatientThresholds);
  app.get("/api/vitals/alerts-history", getThresholdAlertsHistory);

  return app;
}
