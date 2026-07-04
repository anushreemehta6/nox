import "dotenv/config";
import path from "node:path";

export const config = {
  port: Number(process.env.PORT ?? "3001"),
  receiptsDir:
    process.env.RECEIPTS_DIR ??
    path.join(process.cwd(), "..", "relay", "data", "receipts"),
};
