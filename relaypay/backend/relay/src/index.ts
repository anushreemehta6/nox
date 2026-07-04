import { createSettler } from "./casper/settler.js";
import { assertConfig, config } from "./config.js";
import { startListener } from "./listener.js";
import { createReceiptStore } from "./receipt/store.js";

async function main(): Promise<void> {
  assertConfig();

  const settler = createSettler(config.casper);
  const receiptStore = createReceiptStore(config.receiptsDir);
  await receiptStore.init();

  console.log(`Receipts directory: ${config.receiptsDir}`);

  await startListener(
    config.rpcUrl,
    config.registryAddress,
    settler,
    receiptStore,
  );
  console.log("Waiting for PaymentCreated events…");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
