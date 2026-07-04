"use client";

import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
} from "wagmi";
import { formatEther } from "viem";
import {
  HARDHAT_CHAIN_ID,
  hardhatLocal,
  isHardhatChain,
} from "@/lib/chains/hardhat";
import {
  ensureHardhatNetwork,
  getWalletProvider,
} from "@/lib/wallet/ensureHardhatNetwork";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  const isLocal = isHardhatChain(chainId);
  const targetChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337");

  const rabbyConnector = connectors.find((c) => c.id === "injected-rabby");
  const fallbackConnector =
    connectors.find((c) => c.id === "injected") ?? connectors[0];

  if (isConnected && address) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
            {truncateAddress(address)}
          </span>
          <button
            type="button"
            onClick={() => disconnect()}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-400 hover:text-white"
          >
            Disconnect
          </button>
        </div>
        {balance !== undefined ? (
          <p className="text-xs text-slate-400">
            Balance: {formatEther(balance.value)} ETH
            {isLocal ? " on Hardhat Local" : null}
          </p>
        ) : null}
      </div>
    );
  }

  const connectWallet = async () => {
    const connector = rabbyConnector ?? fallbackConnector;
    if (!connector) {
      return;
    }

    if (targetChainId === hardhatLocal.id) {
      const provider = getWalletProvider();
      if (provider) {
        await ensureHardhatNetwork(provider);
      }
    }

    connect({
      connector,
      chainId: targetChainId,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending || connectors.length === 0}
        onClick={() => {
          void connectWallet().catch((err: unknown) => {
            console.error(err);
          });
        }}
        className="rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Connecting…" : "Connect Rabby"}
      </button>
      {targetChainId === hardhatLocal.id ? (
        <p className="text-xs text-slate-500">
          Uses Rabby on Hardhat Local (chain {HARDHAT_CHAIN_ID}).
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-400">{error.message}</p>
      ) : null}
    </div>
  );
}
