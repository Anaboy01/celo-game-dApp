'use client'

import { useState } from 'react'
import { buyHint as buyHintFromContract } from '@/lib/contract-helpers'
import { useAccount } from 'wagmi'

export function useBuyHint() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const { address } = useAccount()

  const buyHint = async (hintCost: bigint) => {
    if (!address) {
      setError('Wallet not connected')
      return
    }

    setIsLoading(true)
    setError(null)
    setIsSuccess(false)
    setTxHash(null)

    try {
      const hash = await buyHintFromContract(address, hintCost)
      if (hash) {
        setTxHash(hash)
        setIsSuccess(true)
      }
    } catch (err) {
      console.error('[v0] Error buying hint:', err)
      setError(err instanceof Error ? err.message : 'Failed to buy hint')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    buyHint,
    isLoading,
    error,
    isSuccess,
    txHash,
  }
}
