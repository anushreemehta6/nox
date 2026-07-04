import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Receipt } from "../types/receipt.js";

function sanitizePaymentId(paymentId: string): string {
  return paymentId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export class ReceiptStore {
  constructor(private readonly directory: string) {}

  async init(): Promise<void> {
    await mkdir(this.directory, { recursive: true });
  }

  private filePath(paymentId: string): string {
    return path.join(this.directory, `${sanitizePaymentId(paymentId)}.json`);
  }

  async save(receipt: Receipt): Promise<string> {
    const filePath = this.filePath(receipt.paymentId);
    await writeFile(filePath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    return filePath;
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

export function createReceiptStore(directory: string): ReceiptStore {
  return new ReceiptStore(directory);
}
