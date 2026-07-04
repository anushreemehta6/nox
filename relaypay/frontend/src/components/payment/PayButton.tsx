"use client";

type PayButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onPay?: () => void | Promise<void>;
};

export function PayButton({
  disabled = false,
  isLoading = false,
  onPay,
}: PayButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={() => {
        void onPay?.();
      }}
      className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
    >
      {isLoading ? "Processing…" : "Pay"}
    </button>
  );
}
