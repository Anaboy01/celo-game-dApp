'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getStartGameConfig } from '@/lib/contract-helpers'

export function useStartGame() {
  const { 
    writeContract, 
    data: hash, 
    error,
    isPending 
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const startGame = async () => {
    try {
      writeContract(getStartGameConfig())
    } catch (err) {
      console.error('[Hook] Error starting game:', err)
      throw err
    }
  }

  return {
    startGame,
    isLoading: isPending || isConfirming,
    error: error?.message || null,
    txHash: hash,
    isSuccess,
  }
}
