'use client'

import { Card } from '@/components/ui/card'
import { User, Zap, Trophy, Flame, Star, Award, Users, Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { usePlayerStats } from '@/hooks/use-player-stats'
import { usePlayerScore } from '@/hooks/use-player-score'
import { useAchievements, getAchievementName } from '@/hooks/use-achievements'
import { formatCELO, formatAddress } from '@/lib/contract-helpers'
import { Achievement } from '@/lib/types/game'

const ACHIEVEMENT_ICONS = {
  [Achievement.FirstWin]: Trophy,
  [Achievement.TenWins]: Award,
  [Achievement.FiftyWins]: Star,
  [Achievement.HundredWins]: Trophy,
  [Achievement.PerfectStreak]: Flame,
  [Achievement.HintMaster]: Zap,
  [Achievement.SocialButterfly]: Users,
}

export default function ProfilePage() {
  const { address } = useAccount()
  const { stats, isLoading: isStatsLoading } = usePlayerStats(address)
  const { score, isLoading: isScoreLoading } = usePlayerScore(address)
  const { achievements, isLoading: isAchievementsLoading } = useAchievements(address)

  const winRate = stats && Number(stats.totalGamesPlayed) > 0
    ? Math.round((Number(stats.correctAnswers) / Number(stats.totalGamesPlayed)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Profile Header */}
        <Card className="p-8 border-border bg-gradient-to-br from-card to-card/50">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {address ? formatAddress(address) : 'Not Connected'}
                </h1>
                <p className="text-muted-foreground">
                  {score ? `Score: ${Number(score).toLocaleString()}` : 'Connect wallet to view profile'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Games Played</p>
            {isStatsLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-3xl font-bold text-foreground">
                {stats ? Number(stats.totalGamesPlayed) : 0}
              </p>
            )}
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Win Rate</p>
            {isStatsLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{winRate}%</p>
            )}
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
            {isStatsLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-3xl font-bold text-foreground">
                {stats ? formatCELO(stats.totalRewardsEarned) : '0'} CELO
              </p>
            )}
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Current Streak</p>
            {isStatsLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-3xl font-bold text-foreground">
                {stats ? Number(stats.currentStreak) : 0}
              </p>
            )}
          </Card>
        </div>

        {/* Achievements */}
        <Card className="p-8 border-border bg-card">
          <h2 className="text-2xl font-bold text-foreground mb-6">Achievements</h2>
          {isAchievementsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {achievements.map((achievement) => {
                const Icon = ACHIEVEMENT_ICONS[achievement.achievement] || Trophy
                return (
                  <div 
                    key={achievement.achievement} 
                    className={`p-4 rounded-lg border flex flex-col items-center text-center transition ${
                      achievement.unlocked
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted/20 border-muted/30 opacity-50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-xs font-medium text-foreground">
                      {getAchievementName(achievement.achievement)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Best Streak</p>
            {isStatsLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-3xl font-bold text-foreground">
                {stats ? Number(stats.bestStreak) : 0}
              </p>
            )}
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Hints Purchased</p>
            {isStatsLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-3xl font-bold text-foreground">
                {stats ? Number(stats.hintsPurchased) : 0}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
