"use client";

import { formatEther } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";
import {
  HARDHAT_ACCOUNT_0,
  HARDHAT_CHAIN_ID,
  isHardhatChain,
} from "@/lib/chains/hardhat";

export function HardhatSetupPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });

  if (!isHardhatChain(chainId)) {
    return null;
  }

  const hasZeroBalance =
    isConnected && balance !== undefined && balance.value === 0n;
  const isHardhatAccount =
    address?.toLowerCase() === HARDHAT_ACCOUNT_0.address.toLowerCase();

  return (
    <div className="mb-8 space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <p className="font-medium">Rabby + Hardhat Local setup</p>
      <ol className="list-inside list-decimal space-y-1 text-amber-100/90">
        <li>
          Run{" "}
          <code className="rounded bg-black/20 px-1 font-mono text-xs">
            npm run node:local
          </code>{" "}
          then{" "}
          <code className="rounded bg-black/20 px-1 font-mono text-xs">
            npm run deploy:localhost
          </code>
        </li>
        <li>
          Rabby → Add custom network: RPC{" "}
          <code className="font-mono text-xs">http://127.0.0.1:8545</code>,
          chain ID{" "}
          <code className="font-mono text-xs">{HARDHAT_CHAIN_ID}</code>
        </li>
        <li>
          Rabby → Import private key for Hardhat account #0 (
          <code className="font-mono text-xs">
            {HARDHAT_ACCOUNT_0.address.slice(0, 10)}…
          </code>
          ) — use the public Hardhat dev key from Hardhat docs
        </li>
        <li>
          Switch Rabby to that imported account — not your main seed phrase
          wallet (it has 0 ETH on Hardhat)
        </li>
        <li>
          If Rabby shows &quot;Simulation Not Supported&quot;: open Advanced →
          View Raw → Confirm anyway (normal on local chains)
        </li>
      </ol>

      {isConnected && balance !== undefined ? (
        <p className="rounded-lg bg-black/20 px-3 py-2 font-mono text-xs">
          Balance: {formatEther(balance.value)} ETH
          {!isHardhatAccount ? " — switch to imported Hardhat account #0" : null}
        </p>
      ) : null}

      {hasZeroBalance ? (
        <p className="text-red-300">
          This Rabby account has 0 ETH on Hardhat. Import account #0 (
          {HARDHAT_ACCOUNT_0.address.slice(0, 10)}…) and select it in Rabby.
        </p>
      ) : null}
    </div>
  );
}
