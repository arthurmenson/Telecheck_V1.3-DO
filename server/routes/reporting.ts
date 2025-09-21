import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Audit reports (stub)
router.get("/audit", authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: { entries: [], summary: { total: 0 } } });
});

// MIPS/QPP calculators (stub)
router.get("/mips", authenticateToken, async (_req, res: Response) => {
  res.json({ success: true, data: { measures: [{ id: "IA_EPA_1", score: 10 }], totalScore: 10 } });
});

export default router;


