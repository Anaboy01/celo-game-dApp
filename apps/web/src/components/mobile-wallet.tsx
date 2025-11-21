"use client";

import React, { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { celo, celoAlfajores, celoSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/connect-button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";

const supportedChains = [celo, celoAlfajores, celoSepolia];

export default function WalletDropdown() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [switchingTo, setSwitchingTo] = useState<number | null>(null);

  const handleSwitch = async (id: number) => {
    if (!switchChain) {
      // Wallet/connector does not expose programmatic switching
      alert("This wallet does not support programmatic chain switching.");
      return;
    }
    try {
      setSwitchingTo(id);
      await switchChain({ chainId: id }); // wagmi v2 correct call
    } catch (err) {
      console.error("Switch failed:", err);
      alert("Failed to switch network. See console for details.");
    } finally {
      setSwitchingTo(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-2">
          Wallet <ChevronDown className="w-4 h-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Wallet</DropdownMenuLabel>

        {/* Connect / Account button (use compact prop so it fits nicely) */}
        <div className="px-3 py-2">
          {/* ConnectButton already renders a Button; using a wrapper div avoids nested buttons */}
          <ConnectButton compact className="w-full justify-center" />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Switch Network</DropdownMenuLabel>

        {supportedChains.map((c) => {
          const isCurrent = c.id === chainId;
          const isSwitching = switchingTo === c.id;

          return (
            <DropdownMenuItem
              key={c.id}
              onSelect={(e) => {
                e.preventDefault(); // prevent default closing behavior until we handle it
                if (!isConnected) {
                  alert("Please connect your wallet first.");
                  return;
                }
                if (!isCurrent && !isSwitching) {
                  handleSwitch(c.id);
                }
              }}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col text-sm">
                <span className="truncate">{c.name}</span>
                <span className="text-xs opacity-60">ID: {c.id}</span>
              </div>

              <div className="ml-2">
                {isSwitching ? (
                  <span className="text-xs opacity-70">Switching...</span>
                ) : isCurrent ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : null}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
