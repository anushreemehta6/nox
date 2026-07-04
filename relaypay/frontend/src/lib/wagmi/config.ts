import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { hardhatLocal } from "@/lib/chains/hardhat";

const defaultChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337");
const targetChain =
  defaultChainId === baseSepolia.id ? baseSepolia : hardhatLocal;

export const wagmiConfig = createConfig({
  chains: [hardhatLocal, baseSepolia],
  connectors: [
    injected({ target: "rabby" }),
    injected({ target: "metaMask" }),
    injected(),
  ],
  transports: {
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

export const defaultChain = targetChain;
