import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import {
  validateCreateEncounter,
  validateEntityId,
} from "../middleware/validation";

const router = Router();
const encounters: any[] = [];

router.get(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { patientId } = req.query as any;
    const data = patientId
      ? encounters.filter(
          (e) => e.subject?.reference === `Patient/${patientId}`,
        )
      : encounters;
    res.json({ success: true, data });
  },
);

router.post(
  "/",
  authenticateToken,
  validateCreateEncounter,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      patientId,
      status = "in-progress",
      type,
      period,
      diagnosis,
      reasonCode,
    } = req.body || {};
    const id = `enc_${Date.now()}`;
    const encounter = {
      id,
      status,
      subject: { reference: `Patient/${patientId}` },
      type,
      period,
      diagnosis,
      reasonCode,
    };
    encounters.push(encounter);
    res.status(201).json({ success: true, data: encounter });
  },
);

router.put(
  "/:id",
  authenticateToken,
  validateEntityId,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as any;
    const idx = encounters.findIndex((e) => e.id === id);
    if (idx === -1)
      return res
        .status(404)
        .json({ success: false, error: "Encounter not found" });
    encounters[idx] = { ...encounters[idx], ...req.body };
    res.json({ success: true, data: encounters[idx] });
  },
);

router.delete(
  "/:id",
  authenticateToken,
  validateEntityId,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as any;
    const idx = encounters.findIndex((e) => e.id === id);
    if (idx === -1)
      return res
        .status(404)
        .json({ success: false, error: "Encounter not found" });
    const removed = encounters.splice(idx, 1)[0];
    res.json({ success: true, data: removed });
  },
);

export default router;
