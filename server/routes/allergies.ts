import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { validateCreateAllergy, validateEntityId } from "../middleware/validation";

const router = Router();
const allergies: any[] = [];

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { patientId } = req.query as any;
  const data = patientId ? allergies.filter((a) => a.patient?.reference === `Patient/${patientId}`) : allergies;
  res.json({ success: true, data });
});

router.post("/", authenticateToken, validateCreateAllergy, async (req: AuthenticatedRequest, res: Response) => {
  const { patientId, code, clinicalStatus, verificationStatus, reaction } = req.body || {};
  const id = `alg_${Date.now()}`;
  const allergy = {
    id,
    patient: { reference: `Patient/${patientId}` },
    code,
    clinicalStatus,
    verificationStatus,
    reaction,
  };
  allergies.push(allergy);
  res.status(201).json({ success: true, data: allergy });
});

router.put("/:id", authenticateToken, validateEntityId, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const idx = allergies.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Allergy not found" });
  allergies[idx] = { ...allergies[idx], ...req.body };
  res.json({ success: true, data: allergies[idx] });
});

router.delete("/:id", authenticateToken, validateEntityId, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const idx = allergies.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Allergy not found" });
  const removed = allergies.splice(idx, 1)[0];
  res.json({ success: true, data: removed });
});

export default router;


