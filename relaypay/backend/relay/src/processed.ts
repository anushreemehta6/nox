const processed = new Set<string>();

export function hasProcessed(paymentId: string): boolean {
  return processed.has(paymentId);
}

export function markProcessed(paymentId: string): void {
  processed.add(paymentId);
}

export function unmarkProcessed(paymentId: string): void {
  processed.delete(paymentId);
}
