"use client";

import { useAccount } from "wagmi";
import { celo, celoAlfajores, celoSepolia } from "wagmi/chains";
import { useConnectModal, useAccountModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";

const supportedChains = [celo, celoAlfajores, celoSepolia];

export function ConnectButton() {
  const { address, isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  // Custom names
  const customChainNames: Record<number, string> = {
    [celo.id]: "Celo",
    [celoAlfajores.id]: "Alfajores",
    [celoSepolia.id]: "Sepolia",
  };

  const chainName = customChainNames[chainId ?? 0] ?? "Unknown Network";

  if (!isConnected) {
    return (
      <Button
        onClick={() => openConnectModal?.()}
        className="bg-transparent border-2 hover:bg-slate-800"
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button
      onClick={() => openAccountModal?.()}
      className="bg-transparent border-2 hover:bg-slate-800 flex items-center gap-2"
    >
      {address.slice(0, 6)}...{address.slice(-4)}

      <span className="text-xs opacity-70">
        ({chainName} • {chainId})
      </span>
    </Button>
  );
}
