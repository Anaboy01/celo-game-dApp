'use client'

import useSWR from 'swr'
import { LeaderboardEntry, FriendLeaderboardEntry } from '@/lib/types/game'
import { getTopPlayers, getFriendLeaderboard } from '@/lib/contract-helpers'

export function useLeaderboard(limit: number = 100) {
  const { data: entries, error, isLoading, mutate } = useSWR(
    ['leaderboard', limit],
    async () => {
      const result = await getTopPlayers(limit)
      return result || []
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  return {
    entries: entries || [],
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useFriendLeaderboard(playerAddress?: string, limit: number = 50) {
  const { data: entries, error, isLoading, mutate } = useSWR(
    playerAddress ? ['friend-leaderboard', playerAddress, limit] : null,
    async () => {
      if (!playerAddress) return null
      const result = await getFriendLeaderboard(playerAddress, limit)
      return result || []
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  return {
    entries: entries || [],
    isLoading,
    error,
    refetch: mutate,
  }
}
