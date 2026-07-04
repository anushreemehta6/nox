import type { Abi } from "viem";

/** Hardhat default address when PaymentRegistry is the first deployment on localhost. */
export const DEFAULT_LOCAL_PAYMENT_REGISTRY_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

export const paymentRegistryAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "paymentId", type: "string" },
      { indexed: false, internalType: "address", name: "payer", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "PaymentCreated",
    type: "event",
  },
  {
    inputs: [{ internalType: "string", name: "paymentId", type: "string" }],
    name: "pay",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const satisfies Abi;

export function getPaymentRegistryAddress(): `0x${string}` {
  const fromEnv = process.env.NEXT_PUBLIC_PAYMENT_REGISTRY_ADDRESS;

  if (fromEnv && fromEnv.startsWith("0x")) {
    return fromEnv as `0x${string}`;
  }

  return DEFAULT_LOCAL_PAYMENT_REGISTRY_ADDRESS;
}

/** Default: 1 wei — smallest valid payment the contract accepts. */
export function getPaymentAmountWei(): bigint {
  const fromEnv = process.env.NEXT_PUBLIC_PAYMENT_AMOUNT_WEI;

  if (fromEnv && /^\d+$/.test(fromEnv)) {
    return BigInt(fromEnv);
  }

  return BigInt(1);
}
