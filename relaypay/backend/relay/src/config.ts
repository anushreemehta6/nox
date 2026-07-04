import "dotenv/config";
import path from "node:path";

export type CasperConfig = {
  dryRun: boolean;
  nodeUrl: string;
  chainName: string;
  contractPackageHash: string;
  contractHash: string;
  secretKeyPath: string;
  secretKeyPem: string;
  paymentMotes: number;
  txTimeoutMs: number;
  explorerBaseUrl: string;
};

const relayRoot = process.cwd();

export const config = {
  rpcUrl: process.env.RPC_URL ?? "http://127.0.0.1:8545",
  registryAddress: process.env.PAYMENT_REGISTRY_ADDRESS ?? "",
  receiptsDir:
    process.env.RECEIPTS_DIR ?? path.join(relayRoot, "data", "receipts"),
  casper: {
    dryRun: process.env.CASPER_DRY_RUN === "true",
    nodeUrl:
      process.env.CSPR_NODE_URL ?? "https://node.testnet.casper.network/rpc",
    chainName: process.env.CSPR_CHAIN_NAME ?? "casper-test",
    contractPackageHash: process.env.CASPER_CONTRACT_PACKAGE_HASH ?? "",
    contractHash: process.env.CASPER_CONTRACT_HASH ?? "",
    secretKeyPath: process.env.CSPR_SECRET_KEY_PATH ?? "",
    secretKeyPem: process.env.CSPR_SECRET_KEY_PEM ?? "",
    paymentMotes: Number(process.env.CASPER_PAYMENT_MOTES ?? "2500000000"),
    txTimeoutMs: Number(process.env.CASPER_TX_TIMEOUT_MS ?? "120000"),
    explorerBaseUrl:
      process.env.CASPER_EXPLORER_BASE_URL ?? "https://testnet.cspr.live",
  } satisfies CasperConfig,
};

export function assertConfig(): void {
  if (!config.registryAddress.startsWith("0x")) {
    throw new Error("PAYMENT_REGISTRY_ADDRESS is required");
  }
}
