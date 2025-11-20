'use client'

import useSWR from 'swr'
import { Achievement } from '@/lib/types/game'
import { getPlayerAchievements } from '@/lib/contract-helpers'

export interface AchievementStatus {
  achievement: Achievement
  unlocked: boolean
}

const ACHIEVEMENT_NAMES = {
  [Achievement.FirstWin]: 'First Win',
  [Achievement.TenWins]: '10 Wins',
  [Achievement.FiftyWins]: '50 Wins',
  [Achievement.HundredWins]: '100 Wins',
  [Achievement.PerfectStreak]: 'Perfect Streak',
  [Achievement.HintMaster]: 'Hint Master',
  [Achievement.SocialButterfly]: 'Social Butterfly',
}

const ACHIEVEMENT_DESCRIPTIONS = {
  [Achievement.FirstWin]: 'Win your first game',
  [Achievement.TenWins]: 'Achieve 10 wins',
  [Achievement.FiftyWins]: 'Achieve 50 wins',
  [Achievement.HundredWins]: 'Achieve 100 wins',
  [Achievement.PerfectStreak]: 'Maintain a 10-game winning streak',
  [Achievement.HintMaster]: 'Purchase 10 hints',
  [Achievement.SocialButterfly]: 'Add 10 friends',
}

export function useAchievements(playerAddress?: string) {
  const { data: achievementArray, error, isLoading, mutate } = useSWR(
    playerAddress ? ['achievements', playerAddress] : null,
    async () => {
      if (!playerAddress) return null
      const result = await getPlayerAchievements(playerAddress)
      return result || []
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  // Convert array of booleans to AchievementStatus objects
  const achievements = (achievementArray || []).map((unlocked, index) => ({
    achievement: index as Achievement,
    unlocked,
  }))

  return {
    achievements,
    isLoading,
    error,
    refetch: mutate,
  }
}

export function hasAchievement(achievements: AchievementStatus[], achievement: Achievement): boolean {
  return achievements.some(a => a.achievement === achievement && a.unlocked)
}

export function getAchievementName(achievement: Achievement): string {
  return ACHIEVEMENT_NAMES[achievement] || 'Unknown Achievement'
}

export function getAchievementDescription(achievement: Achievement): string {
  return ACHIEVEMENT_DESCRIPTIONS[achievement] || 'No description'
}
