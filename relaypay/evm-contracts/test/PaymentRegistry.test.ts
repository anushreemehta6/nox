import { expect } from "chai";
import { ethers } from "hardhat";
import { PaymentRegistry } from "../typechain-types";

describe("PaymentRegistry", function () {
  let paymentRegistry: PaymentRegistry;

  beforeEach(async function () {
    paymentRegistry = await ethers.deployContract("PaymentRegistry");
  });

  it("emits PaymentCreated when pay is called", async function () {
    const [payer] = await ethers.getSigners();
    const paymentId = "demo-payment-001";
    const amount = ethers.parseEther("0.001");

    await expect(
      paymentRegistry.connect(payer).pay(paymentId, { value: amount }),
    )
      .to.emit(paymentRegistry, "PaymentCreated")
      .withArgs(paymentId, payer.address, amount);
  });

  it("reverts when paymentId is empty", async function () {
    const [payer] = await ethers.getSigners();

    await expect(
      paymentRegistry.connect(payer).pay("", {
        value: ethers.parseEther("0.001"),
      }),
    ).to.be.revertedWith("PaymentRegistry: empty paymentId");
  });

  it("reverts when amount is zero", async function () {
    const [payer] = await ethers.getSigners();

    await expect(
      paymentRegistry.connect(payer).pay("demo-payment-002", { value: 0 }),
    ).to.be.revertedWith("PaymentRegistry: zero amount");
  });
});
