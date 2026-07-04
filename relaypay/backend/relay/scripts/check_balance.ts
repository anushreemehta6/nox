import { readFileSync } from "node:fs";
import path from "node:path";
import { HttpHandler, KeyAlgorithm, PrivateKey, RpcClient } from "casper-js-sdk";

const nodeUrl = "https://node.testnet.casper.network/rpc";
const client = new RpcClient(new HttpHandler(nodeUrl));

async function getBalance(publicKeyHex: string) {
  try {
    const stateRootHash = await client.getStateRootHash();
    // Query balance
    const balance = await client.getAccountBalance(stateRootHash, publicKeyHex);
    return balance.toString();
  } catch (err: any) {
    return "0 (or not found: " + err.message + ")";
  }
}

async function checkKey(name: string, filePath: string) {
  try {
    const pem = readFileSync(filePath, "utf8");
    const privateKey = PrivateKey.fromPem(pem, KeyAlgorithm.ED25519);
    const publicKeyHex = privateKey.publicKey.toHex();
    console.log(`Key ${name}:`);
    console.log(`  Path: ${filePath}`);
    console.log(`  Public Key Hex: ${publicKeyHex}`);
    const balance = await getBalance(publicKeyHex);
    console.log(`  Balance: ${balance} motes`);
  } catch (err: any) {
    console.error(`Error reading key ${name}:`, err.message);
  }
}

async function main() {
  console.log("Checking Casper keys...");
  await checkKey("relay_secret_key.pem", path.join(process.cwd(), "keys", "relay_secret_key.pem"));
  await checkKey("secret_key.pem", path.join(process.cwd(), "keys", "secret_key.pem"));
  await checkKey("casper-contracts/secret_key.pem", path.join(process.cwd(), "..", "casper-contracts", "secret_key.pem"));
}

main().catch(console.error);
