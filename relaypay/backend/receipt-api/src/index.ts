import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { ReceiptReader } from "./receipt/reader.js";
import { createReceiptRouter } from "./routes/receipt.js";

const app = express();
const reader = new ReceiptReader(config.receiptsDir);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/receipt", createReceiptRouter(reader));

app.listen(config.port, () => {
  console.log(`Receipt API listening on http://localhost:${config.port}`);
  console.log(`Reading receipts from: ${config.receiptsDir}`);
});
