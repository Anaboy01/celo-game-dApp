'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { Trophy, Flame } from 'lucide-react'
import { truncateAddress } from '@/lib/validation'

export interface LeaderboardEntry {
  rank: number
  address: string
  score: number
  games: number
  streak: number
  isCurrentUser?: boolean
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  isLoading?: boolean
}

export function LeaderboardTable({ entries, isLoading = false }: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available.</p>
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <Card
          key={entry.rank}
          className={`p-4 border-border flex items-center justify-between transition ${
            entry.isCurrentUser
              ? 'bg-primary/10 border-primary/30'
              : 'bg-card/50 hover:bg-card/70'
          }`}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center justify-center w-10 h-10 font-bold text-foreground min-w-10">
              {entry.rank <= 3 ? (
                <Trophy className="w-5 h-5 text-primary" />
              ) : (
                entry.rank
              )}
            </div>
            <div>
              <p className="font-mono text-sm text-foreground">
                {truncateAddress(entry.address)}
              </p>
              <p className="text-xs text-muted-foreground">{entry.games} games played</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="font-bold text-foreground">{entry.score.toLocaleString()}</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Flame className="w-3 h-3" />
              {entry.streak}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}


