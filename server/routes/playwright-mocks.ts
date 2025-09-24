import { Router } from "express";
import type { Request, Response } from "express";

type PlaywrightRole = "doctor" | "patient" | "nurse" | "admin";

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: PlaywrightRole;
  permissions: string[];
  isActive: boolean;
}

const PLAYWRIGHT_USERS: Record<PlaywrightRole, MockUser> = {
  doctor: {
    id: "2",
    email: "doctor@telecheck.com",
    name: "Dr. Sarah Wilson",
    role: "doctor",
    permissions: [
      "view_all_patients",
      "prescribe_medications",
      "review_labs",
      "telehealth_consults",
      "approve_treatments",
    ],
    isActive: true,
  },
  patient: {
    id: "1",
    email: "patient@telecheck.com",
    name: "John Patient",
    role: "patient",
    permissions: [
      "view_own_records",
      "book_appointments",
      "order_medications",
      "view_lab_results",
    ],
    isActive: true,
  },
  nurse: {
    id: "4",
    email: "nurse@telecheck.com",
    name: "Nurse Jennifer Smith",
    role: "nurse",
    permissions: [
      "view_all_patients",
      "patient_assessment",
      "vital_monitoring",
      "care_coordination",
    ],
    isActive: true,
  },
  admin: {
    id: "5",
    email: "admin@telecheck.com",
    name: "Avery Admin",
    role: "admin",
    permissions: ["full_access"],
    isActive: true,
  },
};

const emailLookup = new Map<string, MockUser>(
  Object.values(PLAYWRIGHT_USERS).map((user) => [user.email, user]),
);

const defaultPreferences = {
  theme: "light",
  notifications: { email: true, push: true, sms: false },
  language: "en",
  timezone: "America/New_York",
  privacy: { shareData: false, allowAnalytics: false },
};

const mockSchedulingSlots = [
  { id: "slot-1", time: "2025-01-02T09:00:00Z", provider: "Dr. Sarah Wilson" },
  { id: "slot-2", time: "2025-01-02T10:30:00Z", provider: "Dr. Sarah Wilson" },
];

const mockLabResults = [
  {
    id: "lab-1",
    test: "Glucose",
    value: 95,
    unit: "mg/dL",
    status: "normal",
    interpretation: "Within expected range",
    date: new Date().toISOString(),
  },
];

const mockMedications = [
  {
    id: "lipitor",
    name: "Lipitor",
    generic: "atorvastatin",
    dosage: "20mg",
    frequency: "once daily",
  },
];

const mockErxHistory = [
  {
    id: "rx-001",
    patientId: "Patient/123",
    medication: "Lipitor 20mg",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "rx-002",
    patientId: "Patient/123",
    medication: "Metformin 500mg",
    status: "refill_requested",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

function createToken(user: MockUser) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    exp: Date.now() + 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function sendSuccess<T>(
  res: Response,
  data: T,
  options: { message?: string; status?: number } = {},
) {
  const payload: { success: true; data: T; message?: string } = {
    success: true,
    data,
  };
  if (options.message) {
    payload.message = options.message;
  }
  if (options.status) {
    return res.status(options.status).json(payload);
  }
  return res.json(payload);
}

function sendChaosIfRequested(req: Request, res: Response) {
  if (req.query.chaos === "1") {
    const status = Math.random() < 0.5 ? 500 : 401;
    res.status(status).json({ success: false, error: "chaos" });
    return true;
  }
  return false;
}

export function createPlaywrightMockRouter() {
  const router = Router();

  router.post("/auth/login", (req, res) => {
    const { email } = req.body || {};
    const normalized = typeof email === "string" ? email.toLowerCase() : "";
    const user = emailLookup.get(normalized);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    return sendSuccess(
      res,
      {
        user,
        token: createToken(user),
        refreshToken: createToken(user),
        expiresIn: 60 * 60,
      },
      { message: "Authenticated (mock)" },
    );
  });

  router.post("/auth/logout", (_req, res) => {
    return sendSuccess(res, { loggedOut: true }, { message: "Logged out" });
  });

  router.get("/users/profile", (req, res) => {
    const role = (req.query.role as PlaywrightRole) || "doctor";
    const user = PLAYWRIGHT_USERS[role] ?? PLAYWRIGHT_USERS.doctor;
    return sendSuccess(res, user);
  });

  router.get("/users/preferences", (_req, res) => {
    return sendSuccess(res, defaultPreferences);
  });

  router.post("/patients", (req, res) => {
    const patient = {
      id: `patient-${Date.now()}`,
      firstName: "Demo",
      lastName: "Patient",
      email: "patient@example.com",
      ...req.body,
    };
    return sendSuccess(res, patient, {
      status: 201,
      message: "Patient created",
    });
  });

  router.get("/medications/search", (req, res) => {
    const q = (req.query.q as string)?.toLowerCase() || "";
    const items = mockMedications.filter((med) =>
      med.name.toLowerCase().includes(q),
    );
    return sendSuccess(res, { items, query: q, total: items.length });
  });

  router.get("/medications/interactions", (req, res) => {
    const interactions = [
      {
        drugs: [req.query.drugA || "Lipitor", req.query.drugB || "Warfarin"],
        severity: "major",
        description: "Increased risk of adverse effects",
        recommendation: "Monitor closely and consult physician",
      },
    ];
    return sendSuccess(res, {
      medications: mockMedications,
      interactions,
      riskLevel: "high",
      generatedAt: new Date().toISOString(),
    });
  });

  router.get("/labs/results", (req, res) => {
    if (sendChaosIfRequested(req, res)) return;
    return sendSuccess(res, { results: mockLabResults });
  });

  router.post("/labs/analyze", (req, res) => {
    if (sendChaosIfRequested(req, res)) return;
    return sendSuccess(res, {
      analysisId: `analysis-${Date.now()}`,
      status: "completed",
      summary: "Comprehensive lab analysis completed",
      confidence: 0.94,
      findings: [
        {
          id: `finding-${Date.now()}`,
          title: "All values within expected ranges",
          severity: "normal",
        },
      ],
    });
  });

  router.post("/labs/upload", (req, res) => {
    if (sendChaosIfRequested(req, res)) return;
    return sendSuccess(
      res,
      {
        report: {
          id: `mock-report-${Date.now()}`,
          fileName: req.body?.fileName || "report.pdf",
          analysisStatus: "completed",
          uploadedAt: new Date().toISOString(),
        },
      },
      { message: "Lab report uploaded successfully. Analysis in progress." },
    );
  });

  router.post("/analyze-lab", (req, res) => {
    if (sendChaosIfRequested(req, res)) return;
    return sendSuccess(res, {
      analysisId: `analysis-${Date.now()}`,
      status: "completed",
      summary: "All values within expected ranges",
    });
  });

  router.get("/ehr/scheduling/slots", (req, res) => {
    if (sendChaosIfRequested(req, res)) return;
    return sendSuccess(res, {
      slots: mockSchedulingSlots,
      date: new Date().toISOString().slice(0, 10),
      source: "mock",
    });
  });

  router.post("/ehr/scheduling/book", (req, res) => {
    if (sendChaosIfRequested(req, res)) return;
    return sendSuccess(res, { id: `apt-${Date.now()}`, status: "booked" });
  });

  router.post(/\/ehr\/scheduling\/([^/]+)\/(cancel|reschedule)/, (req, res) => {
    if (sendChaosIfRequested(req, res)) return;
    const [appointmentId, action] = [req.params[0], req.params[1]];
    return sendSuccess(res, {
      id: appointmentId,
      status: action === "cancel" ? "canceled" : "rescheduled",
    });
  });

  router.post("/erx/prescriptions", (req, res) => {
    if (sendChaosIfRequested(req, res)) return;
    const id = `rx-${Date.now()}`;
    return sendSuccess(res, {
      id,
      status: "created",
      patientId: req.body?.patientId || "Patient/123",
      medication: req.body?.medication?.text || "Prescription",
    });
  });

  router.get("/erx/prescriptions/:id", (req, res) => {
    return sendSuccess(res, {
      id: req.params.id,
      status: "created",
      lastCheckedAt: new Date().toISOString(),
    });
  });

  router.post("/erx/prescriptions/:id/cancel", (req, res) => {
    return sendSuccess(res, { id: req.params.id, status: "canceled" });
  });

  router.post("/erx/prescriptions/:id/refill", (req, res) => {
    return sendSuccess(res, { id: req.params.id, status: "refill_requested" });
  });

  router.post("/erx/epcs/verify", (req, res) => {
    if (sendChaosIfRequested(req, res)) return;
    return sendSuccess(res, { verified: true });
  });

  router.get("/erx/history/:patientId", (req, res) => {
    const { patientId } = req.params;
    const history = mockErxHistory.filter(
      (entry) => entry.patientId === patientId,
    );
    return sendSuccess(res, history);
  });

  return router;
}
