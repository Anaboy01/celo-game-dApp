'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getBuyHintConfig } from '@/lib/contract-helpers'

export function useBuyHint() {
  const { 
    writeContract, 
    data: hash, 
    error,
    isPending 
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const buyHint = async (hintCost: bigint) => {
    try {
      writeContract(getBuyHintConfig(hintCost))
    } catch (err) {
      console.error('[Hook] Error buying hint:', err)
      throw err
    }
  }

  return {
    buyHint,
    isLoading: isPending || isConfirming,
    error: error?.message || null,
    isSuccess,
    txHash: hash,
  }
}