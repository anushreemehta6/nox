export type ReceiptStatus = "settled" | "failed";

export type Receipt = {
  paymentId: string;
  evmTxHash: string;
  casperTxHash: string;
  status: ReceiptStatus;
  /** True when relay simulated Casper — tx is not on Casper Live */
  casperDryRun?: boolean;
};

export function createSettledReceipt(input: {
  paymentId: string;
  evmTxHash: string;
  casperTxHash: string;
  casperDryRun?: boolean;
}): Receipt {
  return {
    paymentId: input.paymentId,
    evmTxHash: input.evmTxHash,
    casperTxHash: input.casperTxHash,
    status: "settled",
    ...(input.casperDryRun ? { casperDryRun: true } : {}),
  };
}
