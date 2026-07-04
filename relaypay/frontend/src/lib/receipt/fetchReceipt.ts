export type Receipt = {
  paymentId: string;
  evmTxHash: string;
  casperTxHash: string;
  status: "settled" | "failed";
  casperDryRun?: boolean;
};

export function getReceiptApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_RECEIPT_API_URL ?? "http://localhost:3001";
}

export function casperLiveUrl(txHash: string): string {
  const base =
    process.env.NEXT_PUBLIC_CASPER_EXPLORER_URL ??
    "https://testnet.cspr.live";
  const hash = txHash.startsWith("hash-") ? txHash : `hash-${txHash}`;
  return `${base}/deploy/${hash}`;
}

export async function fetchReceipt(paymentId: string): Promise<Receipt | null> {
  const response = await fetch(
    `${getReceiptApiBaseUrl()}/receipt/${encodeURIComponent(paymentId)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Receipt API error (${response.status})`);
  }

  return (await response.json()) as Receipt;
}
