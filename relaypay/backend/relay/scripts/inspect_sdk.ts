import { HttpHandler, RpcClient } from "casper-js-sdk";

const nodeUrl = "https://node.testnet.casper.network/rpc";
const client = new RpcClient(new HttpHandler(nodeUrl));

async function main() {
  const txHash = "3a51561ebfc147bab2746832a6c9e51931d225a0b42f6a46b065c4ed97848dd9";
  console.log("Querying getTransactionByDeployHash...");
  try {
    const res = await client.getTransactionByDeployHash(txHash);
    console.log("Success! Execution info block hash:", res.executionInfo?.blockHash);
  } catch (err: any) {
    console.error("Failed:", err.message);
  }
}

main().catch(console.error);
