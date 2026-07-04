import { readFileSync } from "node:fs";
import {
  Args,
  CLValue,
  ContractCallBuilder,
  HttpHandler,
  KeyAlgorithm,
  PrivateKey,
  RpcClient,
} from "casper-js-sdk";
import type { PaymentCreatedEvent } from "../abi.js";
import type { CasperConfig } from "../config.js";
import { casperLiveDeployUrl } from "./explorer.js";

export type SettlementResult = {
  paymentId: string;
  casperTxHash: string;
  dryRun: boolean;
};

function normalizeHash(hash: string): string {
  return hash.startsWith("hash-") ? hash.slice(5) : hash;
}

function loadPrivateKey(config: CasperConfig): PrivateKey {
  const pem = config.secretKeyPem
    ? config.secretKeyPem.replace(/\\n/g, "\n")
    : readFileSync(config.secretKeyPath, "utf8");

  return PrivateKey.fromPem(pem, KeyAlgorithm.ED25519);
}

export function createSettler(config: CasperConfig) {
  const canSubmit =
    !config.dryRun &&
    (config.contractPackageHash.length > 0 || config.contractHash.length > 0) &&
    (config.secretKeyPath.length > 0 || config.secretKeyPem.length > 0);

  const client = canSubmit
    ? new RpcClient(new HttpHandler(config.nodeUrl))
    : null;
  const privateKey = canSubmit ? loadPrivateKey(config) : null;

  if (config.dryRun) {
    console.log("Casper dry-run mode — settlements logged only (not on Casper Live).");
    console.log("Deploy contract + set CASPER_DRY_RUN=false for real testnet txs.");
  } else if (!canSubmit) {
    console.warn(
      "Casper not configured — set CASPER_CONTRACT_PACKAGE_HASH + CSPR_SECRET_KEY_PATH.",
    );
  } else {
    console.log(`Casper relay ready (${config.chainName})`);
  }

  return {
    async recordSettlement(
      payment: PaymentCreatedEvent,
    ): Promise<SettlementResult> {
      if (config.dryRun || !client || !privateKey) {
        const simulatedHash = `dry-run-${payment.paymentId}`;
        console.log("--- Casper Settlement (dry-run) ---");
        console.log("Payment ID:", payment.paymentId);
        console.log("Payer:", payment.payer);
        console.log("Amount (wei):", payment.amount.toString());
        console.log("Simulated Casper Tx:", simulatedHash);
        console.log("(Not on Casper Live — enable real mode after deploy)");
        console.log("-----------------------------------");
        return {
          paymentId: payment.paymentId,
          casperTxHash: simulatedHash,
          dryRun: true,
        };
      }

      const args = Args.fromMap({
        payment_id: CLValue.newCLString(payment.paymentId),
        payer: CLValue.newCLString(payment.payer),
        amount: CLValue.newCLUInt512(payment.amount.toString()),
      });

      let builder = new ContractCallBuilder()
        .from(privateKey.publicKey)
        .entryPoint("record_settlement")
        .runtimeArgs(args)
        .chainName(config.chainName)
        .payment(config.paymentMotes);

      if (config.contractPackageHash) {
        builder = builder.byPackageHash(
          normalizeHash(config.contractPackageHash),
        );
      } else {
        builder = builder.byHash(normalizeHash(config.contractHash));
      }

      const transaction = builder.buildFor1_5();
      transaction.sign(privateKey);

      const submitted = await client.putTransaction(transaction);
      await client.waitForTransaction(transaction, config.txTimeoutMs);

      const casperTxHash = submitted.transactionHash.toHex();

      console.log("--- Casper Settlement Recorded ---");
      console.log("Payment ID:", payment.paymentId);
      console.log("Casper Tx:", casperTxHash);
      console.log(
        "Casper Live:",
        casperLiveDeployUrl(casperTxHash, config.explorerBaseUrl),
      );
      console.log("----------------------------------");

      return {
        paymentId: payment.paymentId,
        casperTxHash,
        dryRun: false,
      };
    },
  };
}

export type Settler = ReturnType<typeof createSettler>;
