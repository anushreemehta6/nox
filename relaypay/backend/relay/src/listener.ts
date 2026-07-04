import { Contract, JsonRpcProvider, formatEther } from "ethers";
import { createSettledReceipt } from "./types/receipt.js";
import { paymentRegistryAbi, type PaymentCreatedEvent } from "./abi.js";
import type { Settler } from "./casper/settler.js";
import type { ReceiptStore } from "./receipt/store.js";
import {
  hasProcessed,
  markProcessed,
  unmarkProcessed,
} from "./processed.js";

const POLL_MS = 2_000;

export function logPayment(event: PaymentCreatedEvent): void {
  console.log("--- Payment Detected ---");
  console.log("Payment ID:", event.paymentId);
  console.log("Payer:", event.payer);
  console.log("Amount (wei):", event.amount.toString());
  console.log("Amount (ETH):", formatEther(event.amount));
  console.log("EVM Tx Hash:", event.txHash);
  console.log("Block:", event.blockNumber);
  console.log("------------------------");
}

async function handlePayment(
  event: PaymentCreatedEvent,
  settler: Settler,
  receiptStore: ReceiptStore,
): Promise<void> {
  if (hasProcessed(event.paymentId)) {
    return;
  }

  markProcessed(event.paymentId);

  try {
    const settlement = await settler.recordSettlement(event);
    const receipt = createSettledReceipt({
      paymentId: event.paymentId,
      evmTxHash: event.txHash,
      casperTxHash: settlement.casperTxHash,
      casperDryRun: settlement.dryRun,
    });
    const filePath = await receiptStore.save(receipt);

    console.log("--- Receipt Generated ---");
    console.log(JSON.stringify(receipt, null, 2));
    console.log("Saved to:", filePath);
    console.log("-------------------------");
  } catch (error) {
    unmarkProcessed(event.paymentId);
    console.error("Settlement or receipt failed:", error);
  }
}

export async function startListener(
  rpcUrl: string,
  registryAddress: string,
  settler: Settler,
  receiptStore: ReceiptStore,
): Promise<void> {
  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(registryAddress, paymentRegistryAbi, provider);

  const network = await provider.getNetwork();
  let lastBlock = await provider.getBlockNumber();

  console.log(`Relay listening on chain ${network.chainId}`);
  console.log(`Registry: ${registryAddress}`);
  console.log(`From block: ${lastBlock}`);

  const poll = async (): Promise<void> => {
    const head = await provider.getBlockNumber();
    if (head <= lastBlock) {
      return;
    }

    const events = await contract.queryFilter(
      "PaymentCreated",
      lastBlock + 1,
      head,
    );
    lastBlock = head;

    for (const rawEvent of events) {
      if (!("args" in rawEvent) || rawEvent.args === undefined) {
        continue;
      }

      const [paymentId, payer, amount] = rawEvent.args as unknown as [
        string,
        string,
        bigint,
      ];

      const payment: PaymentCreatedEvent = {
        paymentId,
        payer,
        amount,
        txHash: rawEvent.transactionHash,
        blockNumber: rawEvent.blockNumber,
      };

      logPayment(payment);
      await handlePayment(payment, settler, receiptStore);
    }
  };

  setInterval(() => {
    void poll().catch((err: unknown) => {
      console.error("Poll error:", err);
    });
  }, POLL_MS);

  await poll();
}
