'use client'

import useSWR from 'swr'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getFriends, getAddFriendConfig, getRemoveFriendConfig } from '@/lib/contract-helpers'

export function useFriends(playerAddress?: string) {
  const { data: friends, error, isLoading, mutate } = useSWR(
    playerAddress ? ['friends', playerAddress] : null,
    async () => {
      if (!playerAddress) return null
      const result = await getFriends(playerAddress)
      return result || []
    },
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )

  const { 
    writeContract: addFriendWrite, 
    data: addHash,
    isPending: isAddPending 
  } = useWriteContract()

  const { isLoading: isAddConfirming } = useWaitForTransactionReceipt({
    hash: addHash,
  })

  const { 
    writeContract: removeFriendWrite,
    data: removeHash,
    isPending: isRemovePending 
  } = useWriteContract()

  const { isLoading: isRemoveConfirming } = useWaitForTransactionReceipt({
    hash: removeHash,
  })

  const addFriend = async (friendAddress: string) => {
    try {
      addFriendWrite(getAddFriendConfig(friendAddress))
      // Refetch after transaction
      setTimeout(() => mutate(), 2000)
    } catch (err) {
      console.error('[Hook] Error adding friend:', err)
      throw err
    }
  }

  const removeFriend = async (friendAddress: string) => {
    try {
      removeFriendWrite(getRemoveFriendConfig(friendAddress))
      // Refetch after transaction
      setTimeout(() => mutate(), 2000)
    } catch (err) {
      console.error('[Hook] Error removing friend:', err)
      throw err
    }
  }

  return {
    friends: friends || [],
    isLoading,
    error,
    addFriend,
    removeFriend,
    isAdding: isAddPending || isAddConfirming,
    isRemoving: isRemovePending || isRemoveConfirming,
  }
}