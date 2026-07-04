import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Args,
  CLValue,
  HttpHandler,
  KeyAlgorithm,
  PrivateKey,
  RpcClient,
  SessionBuilder,
} from "casper-js-sdk";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const PACKAGE_KEY_NAME = "relaypay_settlement_registry";
const DEPLOY_PAYMENT_MOTES = 50_000_000_000;;

const relayRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

type DeployConfig = {
  nodeUrl: string;
  chainName: string;
  secretKeyPath: string;
  secretKeyPem: string;
  wasmPath: string;
};

function loadConfig(): DeployConfig {
  const secretKeyPath = process.env.CSPR_SECRET_KEY_PATH ?? "";
  const secretKeyPem = process.env.CSPR_SECRET_KEY_PEM ?? "";

  if (!secretKeyPath && !secretKeyPem) {
    throw new Error(
      "Set CSPR_SECRET_KEY_PATH or CSPR_SECRET_KEY_PEM before deploying.",
    );
  }

  return {
    nodeUrl:
      process.env.CSPR_NODE_URL ?? "https://node.testnet.casper.network/rpc",
    chainName: process.env.CSPR_CHAIN_NAME ?? "casper-test",
    secretKeyPath,
    secretKeyPem,
    wasmPath:
      process.env.CASPER_WASM_PATH ??
      path.join(
        relayRoot,
        "..",
        "..",
        "casper-contracts",
        "wasm",
        "SettlementRegistry.wasm",
      ),
  };
}

async function loadPrivateKey(config: DeployConfig): Promise<PrivateKey> {
  const pem = config.secretKeyPem
    ? config.secretKeyPem.replace(/\\n/g, "\n")
    : undefined;

  if (pem) {
    return PrivateKey.fromPem(pem, KeyAlgorithm.ED25519);
  }

  const contents = await readFile(config.secretKeyPath, "utf8");
  return PrivateKey.fromPem(contents, KeyAlgorithm.ED25519);
}

function normalizePackageHash(value: string): string {
  return value.startsWith("hash-") ? value : `hash-${value}`;
}

function casperLiveTxUrl(txHash: string): string {
  const base =
    process.env.CASPER_EXPLORER_BASE_URL ?? "https://testnet.cspr.live";
  const hash = txHash.startsWith("hash-") ? txHash : `hash-${txHash}`;
  return `${base}/deploy/${hash}`;
}

async function readPackageHashFromAccount(
  client: RpcClient,
  publicKeyHex: string,
): Promise<string | null> {
  const result = await client.queryLatestGlobalState(
    accountKey,
    [],
    PACKAGE_KEY_NAME,
  );

  const stored = result.storedValue?.contractPackage;
  if (stored?.hash) {
    return normalizePackageHash(stored.hash.toHex());
  }

  const clValue = result.storedValue?.clValue;
  if (clValue) {
    const parsed = clValue.toJSON() as { bytes?: string };
    if (parsed.bytes) {
      return normalizePackageHash(parsed.bytes);
    }
  }

  return null;
}

async function updateRelayEnv(packageHash: string): Promise<void> {
  const relayEnvPath = path.join(relayRoot, ".env");
  let contents = "";

  try {
    contents = await readFile(relayEnvPath, "utf8");
  } catch {
    contents = [
      "RPC_URL=http://127.0.0.1:8545",
      "PAYMENT_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "",
    ].join("\n");
  }

  const lines = contents.split(/\r?\n/).filter((line) => {
    const key = line.split("=")[0]?.trim();
    return (
      key !== "CASPER_DRY_RUN" &&
      key !== "CASPER_CONTRACT_PACKAGE_HASH" &&
      key !== "CSPR_SECRET_KEY_PATH" &&
      key !== "CSPR_NODE_URL" &&
      key !== "CSPR_CHAIN_NAME"
    );
  });

  const secretKeyPath =
    process.env.CSPR_SECRET_KEY_PATH ?? "./keys/relay_secret_key.pem";

  lines.push(
    "CASPER_DRY_RUN=false",
    `CSPR_NODE_URL=${process.env.CSPR_NODE_URL ?? "https://node.testnet.casper.network/rpc"}`,
    `CSPR_CHAIN_NAME=${process.env.CSPR_CHAIN_NAME ?? "casper-test"}`,
    `CASPER_CONTRACT_PACKAGE_HASH=${packageHash}`,
    `CSPR_SECRET_KEY_PATH=${secretKeyPath}`,
  );

  await writeFile(relayEnvPath, `${lines.join("\n")}\n`, "utf8");
}

async function main(): Promise<void> {
  const config = loadConfig();
  const privateKey = await loadPrivateKey(config);
  const wasmBytes = await readFile(config.wasmPath);
  const client = new RpcClient(new HttpHandler(config.nodeUrl));

  const args = Args.fromMap({
    odra_cfg_package_hash_key_name: CLValue.newCLString(PACKAGE_KEY_NAME),
    odra_cfg_allow_key_override: CLValue.newCLValueBool(true),
    odra_cfg_is_upgradable: CLValue.newCLValueBool(true),
    odra_cfg_is_upgrade: CLValue.newCLValueBool(false),
  });

  const transaction = new SessionBuilder()
    .from(privateKey.publicKey)
    .wasm(wasmBytes)
    .runtimeArgs(args)
    .chainName(config.chainName)
    .payment(DEPLOY_PAYMENT_MOTES)
    .buildFor1_5();

  transaction.sign(privateKey);

  console.log("Deploying SettlementRegistry to Casper testnet…");
  console.log("Deployer:", privateKey.publicKey.toHex());
const submitted = await client.putTransaction(transaction);
console.log(submitted);

// Get the transaction hash returned by Casper
const deployTxHash = submitted.rawJSON.transaction_hash.Deploy;

console.log("Deploy tx:", deployTxHash);

// Wait for THIS transaction hash, not the transaction object
await client.waitForTransaction(deployTxHash, 300000);console.log("Deploy tx:", deployTxHash);

console.log(
  "Explorer:",
  `https://testnet.cspr.live/transaction/${deployTxHash}`
);

console.log("Waiting 20 seconds...");

await new Promise((r) => setTimeout(r, 20000));

console.log("Transaction executed.");
  console.log("Deploy tx:", deployTxHash);
  console.log("Casper Live:", casperLiveTxUrl(deployTxHash));

  const packageHash = await readPackageHashFromAccount(
    client,
    privateKey.publicKey.toHex(),
  );

  if (!packageHash) {
    throw new Error(
      `Deploy succeeded but package hash "${PACKAGE_KEY_NAME}" was not found on the account.`,
    );
  }

  console.log("Package hash:", packageHash);
  await updateRelayEnv(packageHash);
  console.log("Updated backend/relay/.env — restart the relay with CASPER_DRY_RUN=false.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
