import { createPublicClient, createWalletClient, http } from 'viem'
import { celo } from 'viem/chains'

// Public client for reading contract data
export const publicClient = createPublicClient({
  chain: celo,
  transport: http(),
})

// Wallet client for writing to contract (requires account to be set per transaction)
export const walletClient = createWalletClient({
  chain: celo,
  transport: http(),
})
