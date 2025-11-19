import { useAccount } from "wagmi";
import { useConnectModal, useAccountModal } from "@rainbow-me/rainbowkit";
import { Button } from '@/components/ui/button'

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

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
      className="bg-transparent border-2 hover:bg-slate-800"
    >
      {address.slice(0, 6)}...{address.slice(-4)}
    </Button>
  );
}
