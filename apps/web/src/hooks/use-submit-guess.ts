'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getSubmitGuessConfig } from '@/lib/contract-helpers'

export function useSubmitGuess() {
  const { 
    writeContract, 
    data: hash, 
    error,
    isPending 
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const submitGuess = async (guess: string) => {
    if (!guess.trim()) {
      throw new Error('Please enter a guess')
    }

    try {
      writeContract(getSubmitGuessConfig(guess))
    } catch (err) {
      console.error('[Hook] Error submitting guess:', err)
      throw err
    }
  }

  return {
    submitGuess,
    isLoading: isPending || isConfirming,
    error: error?.message || null,
    isSuccess,
    txHash: hash,
  }
}