export type TransactionStatus = "idle" | "pending" | "confirmed" | "failed";

export type TransactionState = {
  status: TransactionStatus;
  paymentId: string | null;
  txHash: string | null;
  message: string | null;
};

export const initialTransactionState: TransactionState = {
  status: "idle",
  paymentId: null,
  txHash: null,
  message: null,
};
