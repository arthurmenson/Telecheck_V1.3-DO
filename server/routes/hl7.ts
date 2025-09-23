import { Router, Response } from "express";

const router = Router();

// Simple HL7 v2 message ingest (stub)
router.post("/ingest", (req, res: Response) => {
  // In real implementation, parse HL7 v2, enqueue, ACK
  res.send("MSA|AA|mock\r");
});

// Health check / queue status (stub)
router.get("/status", (_req, res: Response) => {
  res.json({ queues: { adt: 0, orm: 0, oru: 0, vxu: 0 }, status: "ok" });
});

export default router;
