'use client'

import { useState } from 'react'
import { submitGuess as submitGuessToContract } from '@/lib/contract-helpers'
import { useAccount } from 'wagmi'

export function useSubmitGuess() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const { address } = useAccount()

  const submitGuess = async (guess: string) => {
    if (!address) {
      setError('Wallet not connected')
      return
    }

    setIsLoading(true)
    setError(null)
    setIsSuccess(false)
    setTxHash(null)

    try {
      const hash = await submitGuessToContract(address, guess)
      if (hash) {
        setTxHash(hash)
        setIsSuccess(true)
      }
    } catch (err) {
      console.error('[v0] Error submitting guess:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit guess')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    submitGuess,
    isLoading,
    error,
    isSuccess,
    txHash,
  }
}
