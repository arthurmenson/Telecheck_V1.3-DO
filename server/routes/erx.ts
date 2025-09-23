import { Router, Request, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import {
  validateCreatePrescription,
  validatePrescriptionId,
  validateEpcsVerify,
} from "../middleware/validation";
import { ErxVendorAdapter } from "../utils/erxVendorAdapter";

const router = Router();

// Create prescription (stub)
router.post(
  "/prescriptions",
  authenticateToken,
  validateCreatePrescription,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { patientId, medication, dosageInstruction } = req.body || {};
      if (!patientId || !medication) {
        return res.status(400).json({
          success: false,
          error: "patientId and medication are required",
        });
      }
      const id = `rx_${Date.now()}`;
      const vendor = await ErxVendorAdapter.submitPrescription({
        patientId,
        medication,
        dosageInstruction,
        requestedByUserId: req.user?.id,
      });
      return res.status(201).json({
        success: true,
        data: {
          id,
          status: vendor.status,
          intent: "order",
          subject: { reference: `Patient/${patientId}` },
          medicationCodeableConcept: medication,
          authoredOn: new Date().toISOString(),
          requester: { reference: `Practitioner/${req.user?.id || "current"}` },
          dosageInstruction: dosageInstruction ? [dosageInstruction] : [],
          externalId: vendor.externalId,
        },
      });
    } catch (e) {
      res.status(500).json({ success: false, error: "Failed to create Rx" });
    }
  },
);

// Get prescription by id (stub)
router.get(
  "/prescriptions/:id",
  authenticateToken,
  validatePrescriptionId,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const status = await ErxVendorAdapter.getPrescriptionStatus(id);
      return res.json({
        success: true,
        data: {
          id,
          status: status.status,
          intent: "order",
          subject: { reference: `Patient/${req.user?.id || "user-1"}` },
          authoredOn: new Date().toISOString(),
        },
      });
    } catch (e) {
      res.status(500).json({ success: false, error: "Failed to fetch Rx" });
    }
  },
);

// Cancel prescription (stub)
router.post(
  "/prescriptions/:id/cancel",
  authenticateToken,
  validatePrescriptionId,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await ErxVendorAdapter.cancelPrescription(id);
      return res.json({ success: true, data: { id, status: "stopped" } });
    } catch (e) {
      res.status(500).json({ success: false, error: "Failed to cancel Rx" });
    }
  },
);

// Refill prescription (stub)
router.post(
  "/prescriptions/:id/refill",
  authenticateToken,
  validatePrescriptionId,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await ErxVendorAdapter.requestRefill(id);
      return res.json({ success: true, data: { id, refillRequested: true } });
    } catch (e) {
      res.status(500).json({ success: false, error: "Failed to request refill" });
    }
  },
);

// EPCS verification (stub)
router.post(
  "/epcs/verify",
  authenticateToken,
  validateEpcsVerify,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { otp } = req.body || {};
      if (!otp) {
        return res.status(400).json({ success: false, error: "otp is required" });
      }
      return res.json({ success: true, data: { verified: true } });
    } catch (e) {
      res.status(500).json({ success: false, error: "EPCS verification failed" });
    }
  },
);

// Patient medication history (stub)
router.get(
  "/history/:patientId",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { patientId } = req.params;
      return res.json({
        success: true,
        data: [
          {
            id: `rx_${Date.now() - 10000}`,
            status: "completed",
            subject: { reference: `Patient/${patientId}` },
            authoredOn: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      });
    } catch (e) {
      res.status(500).json({ success: false, error: "Failed to fetch history" });
    }
  },
);

export default router;


