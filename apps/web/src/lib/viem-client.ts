// apps/web/src/lib/viem-client.ts
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { celo, celoAlfajores, celoSepolia } from 'viem/chains'

// Determine which chain to use based on environment or default
const getChain = () => {
  const chainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID
  
  switch(chainId) {
    case '42220':
      return celo
    case '44787':
      return celoAlfajores
    case '1731':
      return celoSepolia
    default:
      return celoSepolia
  }
}

const chain = getChain()

// Public client for reading contract data
export const publicClient = createPublicClient({
  chain,
  transport: http(),
})

// Wallet client for writing to contract
// This will use the injected provider (MetaMask, Valora, etc.)
export const walletClient = createWalletClient({
  chain,
  transport: typeof window !== 'undefined' && window.ethereum
    ? custom(window.ethereum)
    : http(), // Fallback to http for SSR
})

// Helper to get wallet client from window.ethereum
export function getWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No ethereum provider found')
  }
  
  return createWalletClient({
    chain,
    transport: custom(window.ethereum),
  })
}