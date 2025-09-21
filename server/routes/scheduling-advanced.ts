import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /resources - list providers/rooms/devices availability (stub)
router.get("/resources", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  res.json({
    success: true,
    data: {
      date,
      providers: [
        { id: "prov_1", name: "Dr. Smith", specialty: "IM", availableSlots: ["09:00", "10:00", "14:00"] },
        { id: "prov_2", name: "Dr. Johnson", specialty: "Cards", availableSlots: ["11:00", "15:30"] },
      ],
      rooms: [
        { id: "room_101", name: "Room 101", availableSlots: ["09:00-12:00", "14:00-17:00"] },
        { id: "room_102", name: "Room 102", availableSlots: ["10:00-16:00"] },
      ],
      devices: [
        { id: "echo_1", name: "Echo Device", availableSlots: ["13:00", "15:00"] },
      ],
    },
  });
});

// POST /recurrence - create recurring appointments (stub)
router.post("/recurrence", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { rule, startDate, occurrences } = req.body || {};
  if (!rule || !startDate) {
    return res.status(400).json({ success: false, error: "rule and startDate are required" });
  }
  const count = occurrences || 6;
  const seriesId = `rec_${Date.now()}`;
  const apptIds = Array.from({ length: count }, (_, i) => `${seriesId}_${i + 1}`);
  res.status(201).json({ success: true, data: { seriesId, created: apptIds.length, appointmentIds: apptIds } });
});

// GET /flowboard - patient flow board by day (stub)
router.get("/flowboard", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  const items = [
    { id: "apt_1", time: "09:00", patient: "Sarah Johnson", provider: "Dr. Smith", status: "arrived", room: "101" },
    { id: "apt_2", time: "10:00", patient: "Michael Chen", provider: "Dr. Smith", status: "with_provider", room: "Virtual" },
    { id: "apt_3", time: "11:30", patient: "Emma Wilson", provider: "Dr. Smith", status: "roomed", room: "102" },
  ];
  res.json({ success: true, data: { date, items } });
});

// POST /reminders/bulk - schedule/send bulk reminders (stub)
router.post("/reminders/bulk", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { appointmentIds, channels = ["sms", "email"], template } = req.body || {};
  if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
    return res.status(400).json({ success: false, error: "appointmentIds is required" });
  }
  res.json({ success: true, data: { requested: appointmentIds.length, channels, template: template || "default" } });
});

// POST /no-show - mark appointment as no-show (stub)
router.post("/no-show", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { appointmentId, reason } = req.body || {};
  if (!appointmentId) return res.status(400).json({ success: false, error: "appointmentId is required" });
  res.json({ success: true, data: { appointmentId, status: "no_show", reason: reason || "unavailable" } });
});

// POST /reconcile - reconcile no-shows (stub)
router.post("/reconcile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { date } = req.body || {};
  res.json({ success: true, data: { date: date || new Date().toISOString().slice(0,10), reconciled: 3 } });
});

export default router;


