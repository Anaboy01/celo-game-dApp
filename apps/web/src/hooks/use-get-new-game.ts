'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getNewGameConfig } from '@/lib/contract-helpers'

export function useGetNewGame() {
  const {
    writeContract,
    data: hash,
    error,
    isPending
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const getNew = async () => {
    try {
      writeContract(getNewGameConfig())
    } catch (err) {
      console.error('[Hook] Error getting new game:', err)
      throw err
    }
  }

  return {
    getNew,
    isLoading: isPending || isConfirming,
    error: error?.message || null,
    txHash: hash,
    isSuccess,
  }
}
