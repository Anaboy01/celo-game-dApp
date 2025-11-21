"use client";

import React, { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { celo, celoAlfajores, celoSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";

const supportedChains = [celo, celoAlfajores, celoSepolia];

export default function ConnectChainDropdown() {
  const { chainId, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const [switchingTo, setSwitchingTo] = useState<number | null>(null);

  async function handleSwitch(id: number) {
    try {
      setSwitchingTo(id);
      await switchChain({ chainId: id }); // ✅ Correct wagmi v2 format
    } catch (err) {
      console.error("Switch failed:", err);
      // For wallets like MiniPay (no switching support)
      alert("This wallet does not support switching networks.");
    } finally {
      setSwitchingTo(null);
    }
  }

  const currentChain = supportedChains.find((c) => c.id === chainId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-2">
          <span>{currentChain?.name ?? "Select Chain"}</span>
          <ChevronDown className="w-4 h-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Network</DropdownMenuLabel>

        {supportedChains.map((c) => {
          const isCurrent = c.id === chainId;
          const isSwitchingNow = switchingTo === c.id;

          return (
            <DropdownMenuItem
              key={c.id}
              onSelect={(e) => {
                e.preventDefault();

                if (!isConnected) {
                  alert("Connect your wallet first.");
                  return;
                }

                if (!isCurrent) {
                  handleSwitch(c.id);
                }
              }}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span>{c.name}</span>
                <span className="text-xs opacity-50">Chain ID: {c.id}</span>
              </div>

              {isSwitchingNow ? (
                <span className="text-xs opacity-70">Switching...</span>
              ) : isCurrent ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
