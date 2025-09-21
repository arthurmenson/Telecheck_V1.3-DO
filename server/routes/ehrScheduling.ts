import express from "express";
import { body, param, query, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import {
  schedulingService,
  BookSlotInput,
  RescheduleInput,
  CancelInput,
} from "../services/scheduling.service";

const router = express.Router();

const chaosCheck = (req: express.Request, res: express.Response): boolean => {
  if (req.query.chaos === "1") {
    const status = Math.random() < 0.5 ? 401 : 500;
    res.status(status).json({ message: "chaos" });
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
  "/slots",
  authenticateToken,
  query("providerId").optional().isString(),
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  handleValidation,
  async (req, res) => {
    if (chaosCheck(req, res)) {
      return;
    }
    try {
      const slots = await schedulingService.getSlots();
      res.json({ slots });
    } catch (error: any) {
      const status = error?.statusCode ?? 500;
      res.status(status).json({
        error: error?.message ?? "Unable to load slots",
        code: error?.code ?? "SCHEDULING_ERROR",
        details: error?.details,
      });
    }
  },
);

router.post(
  "/book",
  authenticateToken,
  body("slotId").isString().trim(),
  body("patientId").isString().trim(),
  body("reason").optional().isString(),
  body("metadata").optional().isObject(),
  handleValidation,
  async (req, res) => {
    if (chaosCheck(req, res)) {
      return;
    }
    try {
      const payload: BookSlotInput = {
        slotId: req.body.slotId,
        patientId: req.body.patientId,
        reason: req.body.reason,
        metadata: req.body.metadata,
      };
      const result = await schedulingService.bookSlot(payload);
      res.json({ id: result.id, status: result.status, slot: result.slot });
    } catch (error: any) {
      const status = error?.statusCode ?? 500;
      res.status(status).json({
        error: error?.message ?? "Unable to book slot",
        code: error?.code ?? "SCHEDULING_BOOK_ERROR",
        details: error?.details,
      });
    }
  },
);

router.post(
  "/:appointmentId/reschedule",
  authenticateToken,
  param("appointmentId").isString(),
  body("to").isISO8601(),
  handleValidation,
  async (req, res) => {
    if (chaosCheck(req, res)) {
      return;
    }
    try {
      const payload: RescheduleInput = {
        appointmentId: req.params.appointmentId,
        to: req.body.to,
      };
      const result = await schedulingService.rescheduleAppointment(payload);
      res.json({ id: result.id, status: result.status, slot: result.slot });
    } catch (error: any) {
      const status = error?.statusCode ?? 500;
      res.status(status).json({
        error: error?.message ?? "Unable to reschedule appointment",
        code: error?.code ?? "SCHEDULING_RESCHEDULE_ERROR",
        details: error?.details,
      });
    }
  },
);

router.post(
  "/:appointmentId/cancel",
  authenticateToken,
  param("appointmentId").isString(),
  body("reason").optional().isString(),
  handleValidation,
  async (req, res) => {
    if (chaosCheck(req, res)) {
      return;
    }
    try {
      const payload: CancelInput = {
        appointmentId: req.params.appointmentId,
        reason: req.body?.reason,
      };
      const result = await schedulingService.cancelAppointment(payload);
      res.json({ id: result.id, status: result.status });
    } catch (error: any) {
      const status = error?.statusCode ?? 500;
      res.status(status).json({
        error: error?.message ?? "Unable to cancel appointment",
        code: error?.code ?? "SCHEDULING_CANCEL_ERROR",
        details: error?.details,
      });
    }
  },
);

export default router;
