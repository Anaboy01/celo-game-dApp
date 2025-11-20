'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { addFriend as addFriendToContract, removeFriend as removeFriendFromContract, getFriends } from '@/lib/contract-helpers'
import { useAccount } from 'wagmi'

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

  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const { address } = useAccount()

  const addFriend = async (friendAddress: string) => {
    if (!address) {
      setAddError('Wallet not connected')
      return
    }

    setIsAdding(true)
    setAddError(null)

    try {
      await addFriendToContract(address, friendAddress)
      await mutate()
    } catch (err) {
      console.error('[v0] Error adding friend:', err)
      setAddError(err instanceof Error ? err.message : 'Failed to add friend')
    } finally {
      setIsAdding(false)
    }
  }

  const removeFriend = async (friendAddress: string) => {
    if (!address) {
      setAddError('Wallet not connected')
      return
    }

    setIsRemoving(true)

    try {
      await removeFriendFromContract(address, friendAddress)
      await mutate()
    } catch (err) {
      console.error('[v0] Error removing friend:', err)
      setAddError(err instanceof Error ? err.message : 'Failed to remove friend')
    } finally {
      setIsRemoving(false)
    }
  }

  return {
    friends: friends || [],
    isLoading,
    error,
    addFriend,
    removeFriend,
    isAdding,
    isRemoving,
    addError,
  }
}
