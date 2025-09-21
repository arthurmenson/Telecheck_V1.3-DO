import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { validateEligibility270 } from "../middleware/validation";

const router = Router();

// 270 Eligibility (stub)
router.post("/check", authenticateToken, validateEligibility270, async (req: AuthenticatedRequest, res: Response) => {
  const { member, payer, serviceType } = req.body || {};
  // Simulated 271 response
  res.json({
    success: true,
    data: {
      eligible: true,
      coverageLevel: "individual",
      plan: "PPO",
      serviceType: serviceType || "health_benefit_plan_coverage",
      copay: 20,
      coinsurance: 0.2,
      deductibleRemaining: 500,
      payer: payer?.name || "Demo Payer",
    },
  });
});

export default router;


