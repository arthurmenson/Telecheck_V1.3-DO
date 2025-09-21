import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { validateCreateOrder, validateEntityId } from "../middleware/validation";

const router = Router();
const orders: any[] = [];

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { patientId } = req.query as any;
  const data = patientId ? orders.filter((o) => o.subject?.reference === `Patient/${patientId}`) : orders;
  res.json({ success: true, data });
});

router.post("/", authenticateToken, validateCreateOrder, async (req: AuthenticatedRequest, res: Response) => {
  const { patientId, code, intent = "order", reasonCode, performer } = req.body || {};
  const id = `ord_${Date.now()}`;
  const order = {
    id,
    intent,
    code,
    subject: { reference: `Patient/${patientId}` },
    reasonCode,
    performer,
  };
  orders.push(order);
  res.status(201).json({ success: true, data: order });
});

router.put("/:id", authenticateToken, validateEntityId, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Order not found" });
  orders[idx] = { ...orders[idx], ...req.body };
  res.json({ success: true, data: orders[idx] });
});

router.delete("/:id", authenticateToken, validateEntityId, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Order not found" });
  const removed = orders.splice(idx, 1)[0];
  res.json({ success: true, data: removed });
});

export default router;


