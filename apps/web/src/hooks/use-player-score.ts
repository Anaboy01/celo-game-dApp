'use client'

import useSWR from 'swr'
import { getPlayerScore } from '@/lib/contract-helpers'

export function usePlayerScore(playerAddress?: string) {
  const { data: score, error, isLoading, mutate } = useSWR(
    playerAddress ? ['player-score', playerAddress] : null,
    async () => {
      if (!playerAddress) return null
      const result = await getPlayerScore(playerAddress)
      return result
    },
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )

  return {
    score: score || BigInt(0),
    isLoading,
    error,
    refetch: mutate,
  }
}

