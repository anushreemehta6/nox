import { defineChain } from "viem";

export const HARDHAT_CHAIN_ID = 31337;

/** Pre-funded Hardhat account #0 — import this key in MetaMask for local demo. */
export const HARDHAT_ACCOUNT_0 = {
  address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const,
  privateKey:
    "0xac0974bec39a17e36ba4a6a689426635ffe4b8db4bb7155" as const,
};

export const hardhatLocal = defineChain({
  id: HARDHAT_CHAIN_ID,
  name: "Hardhat Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545", "http://localhost:8545"],
    },
  },
});

export function isHardhatChain(chainId: number | undefined): boolean {
  return chainId === HARDHAT_CHAIN_ID;
}
