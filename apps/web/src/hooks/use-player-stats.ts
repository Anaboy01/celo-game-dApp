'use client'

import useSWR from 'swr'
import { PlayerStatsView } from '@/lib/types/game'
import { getPlayerStats } from '@/lib/contract-helpers'

export function usePlayerStats(playerAddress?: string) {
  const { data: stats, error, isLoading, mutate } = useSWR(
    playerAddress ? ['stats', playerAddress] : null,
    async () => {
      if (!playerAddress) return null
      const result = await getPlayerStats(playerAddress)
      return result
    },
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )

  return {
    stats,
    isLoading,
    error,
    refetch: mutate,
  }
}
