export const paymentRegistryAbi = [
  "event PaymentCreated(string paymentId, address payer, uint256 amount)",
] as const;

export type PaymentCreatedEvent = {
  paymentId: string;
  payer: string;
  amount: bigint;
  txHash: string;
  blockNumber: number;
};
