'use client'

import { useState } from 'react'
import { startPlayerGame } from '@/lib/contract-helpers'
import { useAccount } from 'wagmi'

export function useStartGame() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const { address } = useAccount()

  const startGame = async () => {
    if (!address) {
      setError('Wallet not connected')
      return
    }

    setIsLoading(true)
    setError(null)
    setTxHash(null)

    try {
      const hash = await startPlayerGame(address)
      if (hash) {
        setTxHash(hash)
      }
    } catch (err) {
      console.error('[v0] Error starting game:', err)
      setError(err instanceof Error ? err.message : 'Failed to start game')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    startGame,
    isLoading,
    error,
    txHash,
  }
}
