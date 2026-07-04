"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  getPaymentAmountWei,
  getPaymentRegistryAddress,
  paymentRegistryAbi,
} from "@/lib/contracts/paymentRegistry";
import { generatePaymentId } from "@/lib/payment/generatePaymentId";
import {
  HARDHAT_CHAIN_ID,
  isHardhatChain,
} from "@/lib/chains/hardhat";
import {
  ensureHardhatNetwork,
  getWalletProvider,
} from "@/lib/wallet/ensureHardhatNetwork";
import {
  initialTransactionState,
  type TransactionState,
} from "@/types/transaction";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    if (
      message.includes("Simulation Not Supported") ||
      message.includes("Unknown Signature Type")
    ) {
      return "Rabby cannot simulate txs on Hardhat Local. Import Hardhat account #0, switch to it in Rabby, then confirm via Advanced → View Raw. This is expected on local chains.";
    }

    if (message.includes("User rejected")) {
      return "Transaction rejected in wallet.";
    }

    return message;
  }

  return "Payment failed. Please try again.";
}

export function usePayment() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: balance } = useBalance({ address });
  const { switchChainAsync } = useSwitchChain();
  const [transaction, setTransaction] =
    useState<TransactionState>(initialTransactionState);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);

  const {
    writeContractAsync,
    isPending: isSubmitting,
    data: txHash,
    error: submitError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSubmitting && activePaymentId) {
      setTransaction({
        status: "pending",
        paymentId: activePaymentId,
        txHash: null,
        message: "Waiting for wallet approval…",
      });
    }
  }, [isSubmitting, activePaymentId]);

  useEffect(() => {
    if (txHash && activePaymentId) {
      setTransaction({
        status: "pending",
        paymentId: activePaymentId,
        txHash,
        message: "Transaction submitted. Waiting for confirmation…",
      });
    }
  }, [txHash, activePaymentId]);

  useEffect(() => {
    if (isConfirmed && txHash && activePaymentId) {
      setTransaction({
        status: "confirmed",
        paymentId: activePaymentId,
        txHash,
        message: "PaymentCreated event emitted successfully.",
      });
    }
  }, [isConfirmed, txHash, activePaymentId]);

  useEffect(() => {
    const error = submitError ?? confirmError;

    if (error && activePaymentId) {
      setTransaction({
        status: "failed",
        paymentId: activePaymentId,
        txHash: txHash ?? null,
        message: getErrorMessage(error),
      });
    }
  }, [submitError, confirmError, activePaymentId, txHash]);

  const pay = useCallback(async () => {
    if (!isConnected || !address) {
      return;
    }

    const targetChainId = Number(
      process.env.NEXT_PUBLIC_CHAIN_ID ?? String(HARDHAT_CHAIN_ID),
    );

    if (isHardhatChain(targetChainId) && balance?.value === 0n) {
      setTransaction({
        status: "failed",
        paymentId: null,
        txHash: null,
        message:
          "Account has 0 ETH on Hardhat. Import Hardhat account #0 in MetaMask (see setup steps above).",
      });
      return;
    }

    const registryAddress = getPaymentRegistryAddress();

    if (publicClient) {
      const bytecode = await publicClient.getCode({ address: registryAddress });
      if (!bytecode || bytecode === "0x") {
        setTransaction({
          status: "failed",
          paymentId: null,
          txHash: null,
          message:
            "PaymentRegistry not deployed at configured address. Run npm run deploy:localhost while hardhat node is running.",
        });
        return;
      }
    }

    const paymentId = generatePaymentId();
    setActivePaymentId(paymentId);
    resetWrite();

    setTransaction({
      status: "pending",
      paymentId,
      txHash: null,
      message: "Submitting payment…",
    });

    try {
      if (isHardhatChain(targetChainId)) {
        const provider = getWalletProvider();
        if (provider) {
          await ensureHardhatNetwork(provider);
        }
      }

      if (chainId !== targetChainId) {
        await switchChainAsync({ chainId: targetChainId });
      }

      const useLegacyTx = isHardhatChain(targetChainId);

      await writeContractAsync({
        address: registryAddress,
        abi: paymentRegistryAbi,
        functionName: "pay",
        args: [paymentId],
        value: getPaymentAmountWei(),
        chainId: targetChainId,
        gas: 100_000n,
        ...(useLegacyTx
          ? {
              type: "legacy" as const,
              gasPrice: 8_000_000_000n,
            }
          : {}),
      });
    } catch (error) {
      setTransaction({
        status: "failed",
        paymentId,
        txHash: null,
        message: getErrorMessage(error),
      });
    }
  }, [
    address,
    balance?.value,
    chainId,
    isConnected,
    publicClient,
    resetWrite,
    switchChainAsync,
    writeContractAsync,
  ]);

  const isProcessing = isSubmitting || isConfirming;
  const canPay =
    isConnected &&
    !(isHardhatChain(chainId) && balance !== undefined && balance.value === 0n);

  return {
    pay,
    transaction,
    isProcessing,
    isConnected,
    canPay,
  };
}
