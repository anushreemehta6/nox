"use client";

import { useAccount, useChainId } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { hardhatLocal } from "@/lib/chains/hardhat";
import { formatEther } from "viem";
import { getPaymentAmountWei } from "@/lib/contracts/paymentRegistry";
import type { TransactionState } from "@/types/transaction";

type TransactionStatusCardProps = {
  transaction: TransactionState;
};

const statusLabels: Record<TransactionState["status"], string> = {
  idle: "Ready",
  pending: "Pending",
  confirmed: "Confirmed",
  failed: "Failed",
};

const statusColors: Record<TransactionState["status"], string> = {
  idle: "text-slate-400",
  pending: "text-amber-400",
  confirmed: "text-emerald-400",
  failed: "text-red-400",
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 10)}…${address.slice(-8)}`;
}

function getChainName(chainId: number): string {
  if (chainId === hardhatLocal.id) {
    return hardhatLocal.name;
  }

  if (chainId === baseSepolia.id) {
    return baseSepolia.name;
  }

  return `Chain ${chainId}`;
}

function getExplorerUrl(chainId: number, txHash: string): string | null {
  if (chainId === baseSepolia.id) {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  }

  return null;
}

export function TransactionStatusCard({
  transaction,
}: TransactionStatusCardProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const paymentAmountWei = getPaymentAmountWei();
  const explorerUrl =
    transaction.txHash !== null
      ? getExplorerUrl(chainId, transaction.txHash)
      : null;

  return (
    <section className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Transaction Status
      </h2>

      <dl className="space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <dt className="text-sm text-slate-400">Wallet</dt>
          <dd
            className={`text-sm font-medium ${
              isConnected ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            {isConnected ? "Connected" : "Not connected"}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <dt className="text-sm text-slate-400">Address</dt>
          <dd className="font-mono text-sm text-slate-200">
            {address ? truncateAddress(address) : "—"}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <dt className="text-sm text-slate-400">Network</dt>
          <dd className="text-sm text-slate-200">
            {isConnected ? getChainName(chainId) : "—"}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <dt className="text-sm text-slate-400">Payment Amount</dt>
          <dd className="font-mono text-sm text-slate-200">
            {formatEther(paymentAmountWei)} ETH
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <dt className="text-sm text-slate-400">Payment ID</dt>
          <dd className="max-w-[60%] truncate font-mono text-xs text-slate-300">
            {transaction.paymentId ?? "—"}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <dt className="text-sm text-slate-400">Payment Status</dt>
          <dd
            className={`text-sm font-medium ${statusColors[transaction.status]}`}
          >
            {statusLabels[transaction.status]}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-slate-400">Tx Hash</dt>
          <dd className="max-w-[60%] truncate font-mono text-xs text-slate-300">
            {explorerUrl ? (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                {transaction.txHash}
              </a>
            ) : (
              (transaction.txHash ?? "—")
            )}
          </dd>
        </div>
      </dl>

      {transaction.message ? (
        <p className="mt-4 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-300">
          {transaction.message}
        </p>
      ) : null}
    </section>
  );
}
