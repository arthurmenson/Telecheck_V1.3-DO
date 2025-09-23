import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Create HL7 OML^O21 order (stub)
router.post(
  "/orders",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { patientId, tests } = req.body || {};
    if (!patientId || !Array.isArray(tests) || tests.length === 0)
      return res
        .status(400)
        .json({ success: false, error: "patientId and tests[] required" });
    res.status(201).json({
      success: true,
      data: { orderId: `oml_${Date.now()}`, status: "queued" },
    });
  },
);

// Receive ORU^R01 result (stub)
router.post(
  "/results",
  authenticateToken,
  async (_req: AuthenticatedRequest, res: Response) => {
    res.status(201).json({
      success: true,
      data: { resultId: `oru_${Date.now()}`, status: "received" },
    });
  },
);

export default router;
