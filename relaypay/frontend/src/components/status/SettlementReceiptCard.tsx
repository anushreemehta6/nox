"use client";

import { useEffect, useState } from "react";
import {
  casperLiveUrl,
  fetchReceipt,
  type Receipt,
} from "@/lib/receipt/fetchReceipt";

type SettlementReceiptCardProps = {
  paymentId: string | null;
  evmConfirmed: boolean;
};

type ReceiptState =
  | { status: "idle" }
  | { status: "waiting" }
  | { status: "ready"; receipt: Receipt }
  | { status: "error"; message: string };

export function SettlementReceiptCard({
  paymentId,
  evmConfirmed,
}: SettlementReceiptCardProps) {
  const [state, setState] = useState<ReceiptState>({ status: "idle" });

  useEffect(() => {
    if (!paymentId || !evmConfirmed) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setState({ status: "waiting" });

    const poll = async (): Promise<void> => {
      try {
        const receipt = await fetchReceipt(paymentId);
        if (cancelled) {
          return;
        }

        if (receipt) {
          setState({ status: "ready", receipt });
          return;
        }

        setState({ status: "waiting" });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Could not load settlement receipt.",
        });
      }
    };

    void poll();
    const interval = setInterval(() => {
      void poll();
    }, 2_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [paymentId, evmConfirmed]);

  if (state.status === "idle") {
    return null;
  }

  return (
    <section className="w-full rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 shadow-xl backdrop-blur">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Casper Settlement
      </h2>

      {state.status === "waiting" ? (
        <p className="text-sm text-slate-300">
          Relay is recording settlement on Casper…
        </p>
      ) : null}

      {state.status === "error" ? (
        <p className="text-sm text-red-400">{state.message}</p>
      ) : null}

      {state.status === "ready" ? (
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
            <dt className="text-slate-400">Status</dt>
            <dd className="font-medium text-emerald-400">
              {state.receipt.status}
            </dd>
          </div>

          <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
            <dt className="text-slate-400">Casper Tx</dt>
            <dd className="max-w-[60%] truncate font-mono text-xs">
              {state.receipt.casperDryRun ? (
                <span className="text-amber-400" title={state.receipt.casperTxHash}>
                  {state.receipt.casperTxHash} (simulated)
                </span>
              ) : (
                <a
                  href={casperLiveUrl(state.receipt.casperTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  {state.receipt.casperTxHash}
                </a>
              )}
            </dd>
          </div>

          {state.receipt.casperDryRun ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
              Casper dry-run is on — no on-chain tx yet. Deploy SettlementRegistry
              to testnet and set{" "}
              <code className="font-mono">CASPER_DRY_RUN=false</code> on the relay.
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              View on{" "}
              <a
                href={casperLiveUrl(state.receipt.casperTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Casper Live (testnet)
              </a>
            </p>
          )}
        </dl>
      ) : null}
    </section>
  );
}
