import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Receipt } from "../types/receipt.js";

function sanitizePaymentId(paymentId: string): string {
  return paymentId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export class ReceiptReader {
  constructor(private readonly directory: string) {}

  private filePath(paymentId: string): string {
    return path.join(this.directory, `${sanitizePaymentId(paymentId)}.json`);
  }

  async get(paymentId: string): Promise<Receipt | null> {
    try {
      const contents = await readFile(this.filePath(paymentId), "utf8");
      return JSON.parse(contents) as Receipt;
    } catch {
      return null;
    }
  }
}
