import { Router } from "express";
import type { ReceiptReader } from "../receipt/reader.js";

export function createReceiptRouter(reader: ReceiptReader): Router {
  const router = Router();

  router.get("/:paymentId", async (req, res) => {
    const paymentId = req.params.paymentId?.trim();

    if (!paymentId) {
      res.status(400).json({ error: "paymentId is required" });
      return;
    }

    const receipt = await reader.get(paymentId);

    if (!receipt) {
      res.status(404).json({ error: "Receipt not found", paymentId });
      return;
    }

    res.json(receipt);
  });

  return router;
}
