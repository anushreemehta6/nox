type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const HARDHAT_CHAIN_HEX = "0x7a69";

export async function ensureHardhatNetwork(
  provider: EthereumProvider,
): Promise<void> {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HARDHAT_CHAIN_HEX }],
    });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902) {
      throw error;
    }

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: HARDHAT_CHAIN_HEX,
          chainName: "Hardhat Local",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["http://127.0.0.1:8545"],
        },
      ],
    });
  }
}

export function getWalletProvider(): EthereumProvider | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rabby = (window as Window & { rabby?: EthereumProvider }).rabby;
  if (rabby) {
    return rabby;
  }

  const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  return ethereum ?? null;
}
