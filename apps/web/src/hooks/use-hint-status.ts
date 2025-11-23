'use client'

import useSWR from 'swr'
import { hasPlayerBoughtHint } from '@/lib/contract-helpers'

export function useHintStatus(playerAddress?: string) {
  const { data: hasBought, error, isLoading, mutate } = useSWR(
    playerAddress ? ['hint-status', playerAddress] : null,
    async () => {
      if (!playerAddress) return null
      const result = await hasPlayerBoughtHint(playerAddress)
      return result
    },
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  return {
    hasBoughtHint: hasBought || false,
    isLoading,
    error,
    refetch: mutate,
  }
}

