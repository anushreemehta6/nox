export type ReceiptStatus = "settled" | "failed";

export type Receipt = {
  paymentId: string;
  evmTxHash: string;
  casperTxHash: string;
  status: ReceiptStatus;
};

export function createSettledReceipt(input: {
  paymentId: string;
  evmTxHash: string;
  casperTxHash: string;
}): Receipt {
  return {
    paymentId: input.paymentId,
    evmTxHash: input.evmTxHash,
    casperTxHash: input.casperTxHash,
    status: "settled",
  };
}
