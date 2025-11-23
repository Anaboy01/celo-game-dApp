'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getDepositFundsConfig, getWithdrawFundsConfig } from '@/lib/contract-helpers'
import { useAccount } from 'wagmi'
import { getOwner } from '@/lib/contract-helpers'
import useSWR from 'swr'

export function useAdmin() {
  const { address } = useAccount()
  
  const { data: owner, isLoading: isCheckingOwner } = useSWR(
    address ? ['owner', address] : null,
    async () => {
      if (!address) return null
      const ownerAddress = await getOwner()
      return ownerAddress?.toLowerCase() === address.toLowerCase()
    },
    { revalidateOnFocus: false }
  )

  const { 
    writeContract: depositWrite, 
    data: depositHash,
    isPending: isDepositPending 
  } = useWriteContract()

  const { isLoading: isDepositConfirming } = useWaitForTransactionReceipt({
    hash: depositHash,
  })

  const { 
    writeContract: withdrawWrite,
    data: withdrawHash,
    isPending: isWithdrawPending 
  } = useWriteContract()

  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  })

  const depositFunds = async (amount: bigint) => {
    try {
      depositWrite(getDepositFundsConfig(amount))
    } catch (err) {
      console.error('[Hook] Error depositing funds:', err)
      throw err
    }
  }

  const withdrawFunds = async (amount: bigint) => {
    try {
      withdrawWrite(getWithdrawFundsConfig(amount))
    } catch (err) {
      console.error('[Hook] Error withdrawing funds:', err)
      throw err
    }
  }

  return {
    isOwner: owner || false,
    isCheckingOwner,
    depositFunds,
    withdrawFunds,
    isDepositing: isDepositPending || isDepositConfirming,
    isWithdrawing: isWithdrawPending || isWithdrawConfirming,
    depositHash,
    withdrawHash,
  }
}

