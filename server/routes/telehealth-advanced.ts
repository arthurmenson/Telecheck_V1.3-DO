import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// POST /video/token - issue a short-lived video room token (stub)
router.post("/video/token", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { roomId } = req.body || {};
  if (!roomId) return res.status(400).json({ success: false, error: "roomId is required" });
  const token = `vid_${roomId}_${Date.now()}`;
  res.json({ success: true, data: { token, expiresIn: 3600 } });
});

// POST /consent - capture eConsent signature for a visit (stub)
router.post("/consent", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { appointmentId, consentText, signature } = req.body || {};
  if (!appointmentId || !signature) return res.status(400).json({ success: false, error: "appointmentId and signature are required" });
  res.json({ success: true, data: { appointmentId, consentId: `cons_${Date.now()}`, consentText } });
});

// POST /check-in - virtual check-in (stub)
router.post("/check-in", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { appointmentId, answers } = req.body || {};
  if (!appointmentId) return res.status(400).json({ success: false, error: "appointmentId is required" });
  res.json({ success: true, data: { appointmentId, status: "checked_in", triage: { severity: "low" }, answers: answers || {} } });
});

// GET /billing/crosswalk - telehealth CPT crosswalk (stub)
router.get("/billing/crosswalk", authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: [
    { visitType: "audio_only", cpt: ["99441", "99442", "99443"] },
    { visitType: "video", cpt: ["99212", "99213", "99214"], modifiers: ["95"] },
    { visitType: "virtual_check_in", cpt: ["G2012"] },
  ] });
});

export default router;


