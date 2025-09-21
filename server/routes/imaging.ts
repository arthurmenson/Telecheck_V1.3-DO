import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// DICOM viewer launch (stub)
router.get("/viewer/:studyId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: { studyId: req.params.studyId, viewerUrl: `https://viewer.example/study/${req.params.studyId}` } });
});

// PACS connector config (stub)
router.post("/pacs/config", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { pacsUrl, auth } = req.body || {};
  if (!pacsUrl) return res.status(400).json({ success: false, error: "pacsUrl required" });
  res.json({ success: true, data: { status: "saved" } });
});

export default router;


