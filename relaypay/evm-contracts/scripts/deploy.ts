import { ethers } from "hardhat";

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying PaymentRegistry with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const paymentRegistry = await ethers.deployContract("PaymentRegistry");
  await paymentRegistry.waitForDeployment();

  const address = await paymentRegistry.getAddress();
  console.log("PaymentRegistry deployed to:", address);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
