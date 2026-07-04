export function normalizeCasperTxHash(hash: string): string {
  return hash.startsWith("hash-") ? hash : `hash-${hash}`;
}

export function casperLiveDeployUrl(
  txHash: string,
  baseUrl = process.env.CASPER_EXPLORER_BASE_URL ??
    "https://testnet.cspr.live",
): string {
  return `${baseUrl}/deploy/${normalizeCasperTxHash(txHash)}`;
}

export function casperLiveAccountUrl(
  publicKeyHex: string,
  baseUrl = process.env.CASPER_EXPLORER_BASE_URL ??
    "https://testnet.cspr.live",
): string {
  return `${baseUrl}/account/${publicKeyHex}`;
}
