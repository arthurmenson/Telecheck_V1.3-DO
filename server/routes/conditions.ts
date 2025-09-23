import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import {
  validateCreateCondition,
  validateEntityId,
} from "../middleware/validation";

const router = Router();

// In-memory store (stub)
const conditions: any[] = [];

// List conditions (optionally by patient)
router.get(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { patientId } = req.query as any;
    const data = patientId
      ? conditions.filter(
          (c) => c.subject?.reference === `Patient/${patientId}`,
        )
      : conditions;
    res.json({ success: true, data });
  },
);

// Create condition
router.post(
  "/",
  authenticateToken,
  validateCreateCondition,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      patientId,
      code,
      clinicalStatus,
      verificationStatus,
      onsetDateTime,
    } = req.body || {};
    const id = `cond_${Date.now()}`;
    const condition = {
      id,
      subject: { reference: `Patient/${patientId}` },
      code,
      clinicalStatus,
      verificationStatus,
      onsetDateTime,
    };
    conditions.push(condition);
    res.status(201).json({ success: true, data: condition });
  },
);

// Update condition
router.put(
  "/:id",
  authenticateToken,
  validateEntityId,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as any;
    const idx = conditions.findIndex((c) => c.id === id);
    if (idx === -1)
      return res
        .status(404)
        .json({ success: false, error: "Condition not found" });
    conditions[idx] = { ...conditions[idx], ...req.body };
    res.json({ success: true, data: conditions[idx] });
  },
);

// Delete condition
router.delete(
  "/:id",
  authenticateToken,
  validateEntityId,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as any;
    const idx = conditions.findIndex((c) => c.id === id);
    if (idx === -1)
      return res
        .status(404)
        .json({ success: false, error: "Condition not found" });
    const removed = conditions.splice(idx, 1)[0];
    res.json({ success: true, data: removed });
  },
);

export default router;
