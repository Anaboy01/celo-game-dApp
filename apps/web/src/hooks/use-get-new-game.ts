'use client'

import { useState } from 'react'
import { getNewGame } from '@/lib/contract-helpers'
import { useAccount } from 'wagmi'

export function useGetNewGame() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const { address } = useAccount()

  const getNew = async () => {
    if (!address) {
      setError('Wallet not connected')
      return
    }

    setIsLoading(true)
    setError(null)
    setTxHash(null)

    try {
      const hash = await getNewGame(address)
      if (hash) {
        setTxHash(hash)
      }
    } catch (err) {
      console.error('[v0] Error getting new game:', err)
      setError(err instanceof Error ? err.message : 'Failed to get new game')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    getNew,
    isLoading,
    error,
    txHash,
  }
}
