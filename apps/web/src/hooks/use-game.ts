'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { Game } from '@/lib/types/game'
import { getCurrentGame, formatTime } from '@/lib/contract-helpers'

export function useGame(playerAddress?: string) {
  const { data: game, error, isLoading, mutate } = useSWR(
    playerAddress ? ['game', playerAddress] : null,
    async () => {
      if (!playerAddress) return null
      const result = await getCurrentGame(playerAddress)
      return result
    },
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  return {
    game,
    isLoading,
    error,
    refetch: mutate,
  }
}

export function useGameTimer(endTime?: number) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!endTime) return

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = Math.max(0, endTime - now)
      setTimeLeft(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  return {
    timeLeft,
    isExpired: timeLeft === 0,
    formattedTime: formatTime(timeLeft),
  }
}
