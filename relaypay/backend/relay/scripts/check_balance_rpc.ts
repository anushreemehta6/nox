import { readFileSync } from "node:fs";
import path from "node:path";
import { KeyAlgorithm, PrivateKey } from "casper-js-sdk";

const nodeUrl = "https://node.testnet.casper.network/rpc";

async function jsonRpc(method: string, params: any = {}) {
  const response = await fetch(nodeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });
  const data = await response.json() as any;
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.result;
}

async function getBalance(publicKeyHex: string) {
  try {
    const { state_root_hash } = await jsonRpc("chain_get_state_root_hash");
    
    // We can use state_get_account_info to find the main purse
    const accountInfo = await jsonRpc("state_get_account_info", {
      public_key: publicKeyHex,
      block_identifier: null,
    });
    
    const mainPurse = accountInfo.account.main_purse;
    
    // Query balance of the purse
    const balanceResult = await jsonRpc("state_get_balance", {
      purse_uref: mainPurse,
      state_root_hash,
    });
    
    return (BigInt(balanceResult.balance_value) / 1000000000n).toString() + " CSPR";
  } catch (err: any) {
    return "0 CSPR (or not found: " + err.message + ")";
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
    console.log(`  Balance: ${balance}`);
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
