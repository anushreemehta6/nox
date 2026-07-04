export function generatePaymentId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `pay-${crypto.randomUUID()}`;
  }

  return `pay-${Date.now()}`;
}
