import { ethers } from "hardhat";

async function main(): Promise<void> {
  const [signer] = await ethers.getSigners();
  const address =
    process.env.PAYMENT_REGISTRY_ADDRESS ??
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const registry = await ethers.getContractAt(
    "PaymentRegistry",
    address,
    signer,
  );

  const tx = await registry.pay("relay-test-004", { value: 1n });
  await tx.wait();
  console.log("Payment sent:", tx.hash);
}

main().catch(console.error);
