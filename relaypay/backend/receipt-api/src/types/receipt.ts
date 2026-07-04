export type ReceiptStatus = "settled" | "failed";

export type Receipt = {
  paymentId: string;
  evmTxHash: string;
  casperTxHash: string;
  status: ReceiptStatus;
};
