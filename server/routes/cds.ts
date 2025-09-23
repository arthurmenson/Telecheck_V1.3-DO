import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { DrugDbAdapter } from "../utils/drugDbAdapter";
import { AuditLogger } from "../utils/auditLogger";

const router = Router();

// CDS Hooks discovery
router.get(
  "/cds-services",
  authenticateToken,
  async (_req: AuthenticatedRequest, res: Response) => {
    res.json({
      services: [
        {
          id: "drug-interactions",
          hook: "order-select",
          title: "Drug Interaction Checker",
          description: "Checks for interactions when selecting medications",
          prefetch: {},
        },
      ],
    });
  },
);

// Invoke CDS service for order-select
router.post(
  "/cds-services/drug-interactions",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { context } = req.body || {};
    const meds = Array.isArray(context?.selections) ? context.selections : [];
    const names = meds.map(
      (m: any) => m?.name || m?.code?.text || m?.display || "",
    );
    const interactions = await DrugDbAdapter.checkInteractions(names);
    const cards: any[] = interactions.map((i) => ({
      summary: `Interaction: ${i.drugs.join(" + ")}`,
      indicator:
        i.severity === "contraindicated"
          ? "critical"
          : i.severity === "major"
            ? "warning"
            : "info",
      detail: `${i.mechanism || "Interaction detected"}. Recommendation: ${i.recommendation || "Review alternatives."}`,
      source: { label: "Telecheck Drug DB" },
      suggestions: [{ label: "Review alternatives", actions: [] }],
      links: (i.references || []).map((r) => ({ label: r, url: "#" })),
    }));
    res.json({ cards });
  },
);

export default router;

// Override endpoint to capture clinician override with reason
router.post(
  "/override",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { cardId, reason, patientId } = req.body || {};
      if (!cardId || !reason) {
        return res
          .status(400)
          .json({ success: false, error: "cardId and reason are required" });
      }
      await AuditLogger.logDataAccess(
        req.user?.id || "unknown",
        "cds_override",
        "override",
        { cardId, reason, patientId },
      );
      res.json({ success: true, data: { status: "recorded" } });
    } catch (e) {
      res
        .status(500)
        .json({ success: false, error: "Failed to record override" });
    }
  },
);
