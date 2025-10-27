import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initializeDatabase, healthCheck, dbPool } from "./config/database";
import { connectDatabase as connectPrisma } from "./config/prisma";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import oauthRoutes from "./routes/oauth";
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
import { createPlaywrightMockRouter } from "./routes/playwright-mocks";
import {
  getAvailableProviders,
  scheduleAppointment,
  getUserAppointments,
  createConsultationRoom,
  generateConsultationSummary,
  triageEmergency,
} from "./routes/telemedicine";
import { getTelemedicineProviders } from "./routes/telemedicine-providers";
import { authenticateToken, requireDoctor } from "./middleware/auth";
import {
  authenticateKeycloak,
  optionalKeycloakAuth,
  requireRole,
  requireMFA,
  requireTokenIntrospection,
  requireAdmin,
  requireDoctor as requireDoctorKeycloak,
  requireHealthcareProvider,
  requirePatient,
  requirePharmacist,
  requireNurse,
} from "./middleware/keycloak-auth";
import {
  exportFHIRData,
  importFHIRData,
  getFHIRPatient,
  getFHIRObservations,
  fhirRouter,
} from "./routes/fhir";
import smartRoutes from "./routes/smart";
import hl7Routes from "./routes/hl7";
import billingRoutes from "./routes/billing";
import eligibilityRoutes from "./routes/eligibility";
import advancedSchedulingRoutes from "./routes/scheduling-advanced";
import telehealthAdvancedRoutes from "./routes/telehealth-advanced";
import cdsRoutes from "./routes/cds";
import portalRoutes from "./routes/portal";
import securityRoutes from "./routes/security";
import reportingRoutes from "./routes/reporting";
import labsHl7Routes from "./routes/labs-hl7";
import imagingRoutes from "./routes/imaging";
import erxRoutes from "./routes/erx";
import conditionsRoutes from "./routes/conditions";
import allergiesRoutes from "./routes/allergies";
import immunizationsRoutes from "./routes/immunizations";
import encountersRoutes from "./routes/encounters";
import ordersRoutes from "./routes/orders";
import appointmentsRoutes from "./routes/appointments";
import consultationsRoutes from "./routes/consultations";
import consultationNotesRoutes from "./routes/consultation-notes";
import patientProfileRoutes from "./routes/patient-profile";
import patientSettingsRoutes from "./routes/patient-settings";
import hcwRoutes from "./routes/hcw";
import testAccountsRoutes from "./routes/test-accounts";
import debugRoutes from "./routes/debug";
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

  // Initialize Prisma connection
  try {
    await connectPrisma();
  } catch (error) {
    console.error("Failed to connect Prisma, but continuing:", error);
  }

  const app = express();
  const isPlaywright =
    process.env.NODE_ENV === "playwright" || process.env.PLAYWRIGHT === "1";

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

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check routes (available at both /health and /api/health)
  app.use(healthRoutes);
  app.use("/api", healthRoutes);

  if (isPlaywright) {
    app.use("/api", createPlaywrightMockRouter());
  }

  app.get("/api/ehr/scheduling/slots", (_req, res) => {
    res.json({
      success: true,
      data: {
        slots: [
          { id: "slot-1", time: "09:00", provider: "Dr. Smith" },
          { id: "slot-2", time: "10:30", provider: "Dr. Johnson" },
          { id: "slot-3", time: "14:00", provider: "Dr. Smith" },
        ],
        date: new Date().toISOString().slice(0, 10),
        source: isDbConfigured ? "database" : "mock",
      },
    });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes (public - no auth required)
  app.use("/api/auth", authRoutes);
  app.use("/api/auth", oauthRoutes);

  // Determine authentication strategy
  const useKeycloakAuth = process.env.ENABLE_KEYCLOAK_NATIVE_AUTH === "true";
  const authMiddleware = useKeycloakAuth
    ? authenticateKeycloak
    : authenticateToken;
  const doctorMiddleware = useKeycloakAuth
    ? requireDoctorKeycloak
    : requireDoctor;
  const adminMiddleware = useKeycloakAuth ? requireAdmin : authenticateToken;

  console.log(
    `🔐 Authentication Strategy: ${useKeycloakAuth ? "Keycloak Native" : "Legacy JWT"}`,
  );

  // User management routes (Admin only)
  app.use(
    "/api/users",
    authMiddleware as any,
    adminMiddleware as any,
    userRoutes,
  );

  // Patient routes (Healthcare providers only)
  app.use("/api/patients", authMiddleware as any, patientRoutes);

  // Lab routes (Authenticated users)
  app.use("/api/labs", authMiddleware as any, labRoutes);

  // Medication routes (Authenticated users)
  app.use("/api/medications", authMiddleware as any, medicationRoutes);

  // e-Prescribing routes (stub)
  app.use("/api/erx", erxRoutes);

  // Clinical: Conditions (stub)
  app.use("/api/ehr/conditions", conditionsRoutes);
  app.use("/api/ehr/allergies", allergiesRoutes);
  app.use("/api/ehr/immunizations", immunizationsRoutes);
  app.use("/api/ehr/encounters", encountersRoutes);
  app.use("/api/ehr/orders", ordersRoutes);

  // Appointments and HCW@Home Consultations (Televisit integration)
  app.use("/api/appointments", appointmentsRoutes);
  app.use("/api/consultations", consultationsRoutes);
  app.use("/api/consultation-notes", consultationNotesRoutes);

  // Patient Portal routes
  app.use("/api/patient/profile", patientProfileRoutes);
  app.use("/api/patient/settings", patientSettingsRoutes);

  // HCW@Home Care Team routes
  app.use("/api/hcw", authMiddleware as any, hcwRoutes);

  // Test accounts (development/staging only)
  app.use("/api/test-accounts", testAccountsRoutes);

  // Debug routes (TEMPORARY - for troubleshooting)
  app.use("/api/debug", debugRoutes);

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
  app.get(
    "/api/telemedicine/providers",
    authMiddleware as any,
    getTelemedicineProviders,
  );
  app.post(
    "/api/telemedicine/schedule",
    authMiddleware as any,
    scheduleAppointment,
  );
  app.get(
    "/api/telemedicine/appointments/:userId?",
    authMiddleware as any,
    getUserAppointments,
  );
  app.post(
    "/api/telemedicine/room",
    authMiddleware as any,
    doctorMiddleware as any,
    createConsultationRoom,
  );
  app.get(
    "/api/telemedicine/summary/:roomId",
    authMiddleware as any,
    doctorMiddleware as any,
    generateConsultationSummary,
  );
  app.post("/api/telemedicine/triage", authMiddleware as any, triageEmergency);

  // EHR Telehealth alias routes (for client API_ENDPOINTS.EHR.TELEHEALTH)
  app.get(
    "/api/ehr/telehealth/sessions",
    authMiddleware as any,
    (_req, res) => {
      const rooms = (
        require("./utils/telemedicine") as any
      ).TelemedicineService.listActiveConsultationRooms();
      res.json({ success: true, data: rooms });
    },
  );
  app.post(
    "/api/ehr/telehealth/create-room",
    authMiddleware as any,
    doctorMiddleware as any,
    async (req, res) => {
      const { appointmentId } = req.body || {};
      try {
        const svc = (require("./utils/telemedicine") as any)
          .TelemedicineService;
        const room = await svc.createConsultationRoom(
          appointmentId || `appt_${Date.now()}`,
        );
        res.json({ success: true, data: room });
      } catch (e) {
        res
          .status(500)
          .json({ success: false, error: "Failed to create room" });
      }
    },
  );
  app.post(
    "/api/ehr/telehealth/:id/join",
    authMiddleware as any,
    async (req, res) => {
      const { id } = req.params as any;
      const svc = (require("./utils/telemedicine") as any).TelemedicineService;
      const room = svc.getConsultationRoom(id);
      if (!room)
        return res
          .status(404)
          .json({ success: false, error: "Room not found" });
      res.json({
        success: true,
        data: { roomId: id, joinUrl: `https://telecheck.com/room/${id}` },
      });
    },
  );
  app.post(
    "/api/ehr/telehealth/:id/end",
    authMiddleware as any,
    doctorMiddleware as any,
    (req, res) => {
      const { id } = req.params as any;
      const svc = (require("./utils/telemedicine") as any).TelemedicineService;
      const result = svc.endConsultationRoom(id);
      if (result.status === "not_found")
        return res
          .status(404)
          .json({ success: false, error: "Room not found" });
      res.json({ success: true, data: result });
    },
  );

  // FHIR integration routes
  app.use("/api/fhir", fhirRouter);

  // SMART on FHIR routes (stubs)
  app.use("/api/smart", smartRoutes);

  // HL7 v2 interface (stubs)
  app.use("/api/hl7", hl7Routes);

  // Billing & Eligibility (stubs)
  app.use("/api/billing", billingRoutes);
  app.use("/api/eligibility", eligibilityRoutes);
  app.use("/api/scheduling-advanced", advancedSchedulingRoutes);
  app.use("/api/telehealth-advanced", telehealthAdvancedRoutes);
  app.use("/api/cds", cdsRoutes);
  app.use("/api/portal", portalRoutes);
  app.use("/api/security", securityRoutes);
  app.use("/api/reporting", reportingRoutes);
  app.use("/api/labs-hl7", labsHl7Routes);
  app.use("/api/imaging", imagingRoutes);

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
    (express as any).raw({ type: "*/*" }),
    (req: any, _res, next) => {
      req.rawBody = req.body;
      next();
    },
    verifyTelnyxSignature,
    handleTelnyxSMSWebhook,
  );
  app.post(
    "/api/webhooks/telnyx/call",
    (express as any).raw({ type: "*/*" }),
    (req: any, _res, next) => {
      req.rawBody = req.body;
      next();
    },
    verifyTelnyxSignature,
    handleTelnyxCallWebhook,
  );

  // Webhook routes for Twilio
  app.post(
    "/api/webhooks/twilio/sms",
    (express as any).raw({ type: "*/*" }),
    (req: any, _res, next) => {
      req.rawBody = req.body;
      next();
    },
    verifyTwilioSignature,
    handleTwilioSMSWebhook,
  );
  app.post(
    "/api/webhooks/twilio/call",
    (express as any).raw({ type: "*/*" }),
    (req: any, _res, next) => {
      req.rawBody = req.body;
      next();
    },
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
const isDbConfigured = !!dbPool;
