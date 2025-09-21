import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { validateCreateImmunization, validateEntityId } from "../middleware/validation";

const router = Router();
const immunizations: any[] = [];

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { patientId } = req.query as any;
  const data = patientId ? immunizations.filter((i) => i.patient?.reference === `Patient/${patientId}`) : immunizations;
  res.json({ success: true, data });
});

router.post("/", authenticateToken, validateCreateImmunization, async (req: AuthenticatedRequest, res: Response) => {
  const { patientId, vaccineCode, occurrenceDateTime, lotNumber } = req.body || {};
  const id = `imm_${Date.now()}`;
  const immunization = {
    id,
    patient: { reference: `Patient/${patientId}` },
    vaccineCode,
    status: "completed",
    occurrenceDateTime,
    lotNumber,
  };
  immunizations.push(immunization);
  res.status(201).json({ success: true, data: immunization });
});

router.put("/:id", authenticateToken, validateEntityId, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const idx = immunizations.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Immunization not found" });
  immunizations[idx] = { ...immunizations[idx], ...req.body };
  res.json({ success: true, data: immunizations[idx] });
});

router.delete("/:id", authenticateToken, validateEntityId, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const idx = immunizations.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Immunization not found" });
  const removed = immunizations.splice(idx, 1)[0];
  res.json({ success: true, data: removed });
});

export default router;


