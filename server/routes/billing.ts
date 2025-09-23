import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import {
  validateGenerate837P,
  validateClaimId,
  validateIngest835,
} from "../middleware/validation";
import { ClearinghouseAdapter } from "../utils/clearinghouseAdapter";

const router = Router();

// Generate 837P claim (stub)
router.post(
  "/claims/837p",
  authenticateToken,
  validateGenerate837P,
  async (req: AuthenticatedRequest, res: Response) => {
    const id = `clm_${Date.now()}`;
    const x12 = `ISA*00*          *00*          *ZZ*SENDERID      *ZZ*RECEIVERID    *${new Date().toISOString().slice(2, 10).replace(/-/g, "")}*1234*^*00501*000000905*0*T*:~\rGS*HC*SENDERID*RECEIVERID*${new Date().toISOString().slice(0, 10).replace(/-/g, "")}*1234*1*X*005010X222A1~\rST*837*0001*005010X222A1~`;
    // Submit to clearinghouse
    const submission = await ClearinghouseAdapter.submitClaimX12(id, x12);
    res.status(201).json({
      success: true,
      data: {
        claimId: id,
        type: "837P",
        status: submission.status,
        trackingId: submission.trackingId,
        x12Preview: x12.slice(0, 120) + "...",
      },
    });
  },
);

// Claim status (stub)
router.get(
  "/claims/:id/status",
  authenticateToken,
  validateClaimId,
  async (req: AuthenticatedRequest, res: Response) => {
    const status = await ClearinghouseAdapter.getClaimStatus(req.params.id);
    res.json({
      success: true,
      data: status || { claimId: req.params.id, status: "unknown" },
    });
  },
);

// Ingest 835 ERA (stub)
router.post(
  "/era/835",
  authenticateToken,
  validateIngest835,
  async (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      data: { payments: 3, posted: 3, adjustments: 1 },
    });
  },
);

export default router;
