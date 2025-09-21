import express from "express";
import { param, query, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import { rpmService } from "../services/rpm.service";

const router = express.Router();

const chaosCheck = (req: express.Request, res: express.Response): boolean => {
  if (req.query.chaos === "1") {
    const status = Math.random() < 0.5 ? 503 : 500;
    res.status(status).json({ error: "chaos", code: "CHAOS_MODE" });
    return true;
  }
  return false;
};

const handleValidation = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: errors.array(),
    });
  }
  return next();
};

router.get(
  "/patients/:id/vitals",
  authenticateToken,
  param("id").isString().trim().notEmpty(),
  query("days").optional().isInt({ min: 1, max: 90 }),
  handleValidation,
  async (req, res) => {
    if (chaosCheck(req, res)) {
      return;
    }
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const result = await rpmService.getPatientVitals(req.params.id, days);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: error?.message ?? "Unable to fetch vitals",
        code: error?.code ?? "RPM_VITALS_ERROR",
      });
    }
  },
);

router.get(
  "/patients/:id/alerts",
  authenticateToken,
  param("id").isString().trim().notEmpty(),
  handleValidation,
  async (req, res) => {
    if (chaosCheck(req, res)) {
      return;
    }
    try {
      const result = await rpmService.getPatientAlerts(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: error?.message ?? "Unable to fetch alerts",
        code: error?.code ?? "RPM_ALERTS_ERROR",
      });
    }
  },
);

router.get(
  "/patients/:id/thresholds",
  authenticateToken,
  param("id").isString().trim().notEmpty(),
  handleValidation,
  async (req, res) => {
    if (chaosCheck(req, res)) {
      return;
    }
    try {
      const result = await rpmService.getPatientThresholds(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: error?.message ?? "Unable to fetch thresholds",
        code: error?.code ?? "RPM_THRESHOLDS_ERROR",
      });
    }
  },
);

export default router;
