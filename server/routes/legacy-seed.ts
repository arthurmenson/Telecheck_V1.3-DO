import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  ensureLegacyClinicalData,
  ensureAllLegacyClinicalData,
} from "../services/legacy-data.service";

const router = Router();

router.post(
  "/seed-legacy",
  authenticateToken as any,
  requireAdmin as any,
  async (req, res) => {
    const { userId, all } = req.body || {};

    try {
      if (all) {
        const count = await ensureAllLegacyClinicalData();
        return res.json({
          success: true,
          message: `${count} legacy users seeded`,
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "userId is required when seeding a single user",
        });
      }

      await ensureLegacyClinicalData(userId);
      res.json({
        success: true,
        message: "Legacy clinical data seed completed",
      });
    } catch (error) {
      console.error("Legacy seed failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to seed legacy data",
      });
    }
  },
);

export default router;
