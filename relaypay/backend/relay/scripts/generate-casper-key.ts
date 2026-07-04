import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { KeyAlgorithm, PrivateKey } from "casper-js-sdk";

const keysDir = path.join(process.cwd(), "keys");
const secretKeyPath = path.join(keysDir, "relay_secret_key.pem");
const publicKeyPath = path.join(keysDir, "relay_public_key.pem");

async function main(): Promise<void> {
  await mkdir(keysDir, { recursive: true });

  const privateKey = PrivateKey.generate(KeyAlgorithm.ED25519);
  const publicKey = privateKey.publicKey;

  await writeFile(secretKeyPath, privateKey.toPem(), "utf8");
  await writeFile(publicKeyPath, publicKey.toPem(), "utf8");

  console.log("Generated relay Casper keys:");
  console.log("Secret:", secretKeyPath);
  console.log("Public:", publicKeyPath);
  console.log("Public key hex:", publicKey.toHex());
  console.log("");
  console.log("Next steps:");
  console.log("1. Fund this account on Casper testnet (free faucet):");
  console.log("   https://testnet.cspr.live/tools/faucet");
  console.log("2. Build WASM: cd ../../casper-contracts && cargo odra build");
  console.log("3. Deploy: CSPR_SECRET_KEY_PATH=./keys/relay_secret_key.pem npm run deploy:casper");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
