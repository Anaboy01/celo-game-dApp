'use client'

import { GameBoard } from '@/components/game/game-board'
import { Card } from '@/components/ui/card'
import { Zap, Trophy, Flame } from 'lucide-react'

export default function GamePage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-border bg-card">
              <GameBoard />
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            <Card className="p-6 border-border bg-card/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="text-lg font-bold text-foreground">125.5 CELO</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-card/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-lg font-bold text-foreground">7 games</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-card/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rank</p>
                  <p className="text-lg font-bold text-foreground">#1,234</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-primary/10 border-primary/30">
              <h3 className="font-semibold text-foreground mb-2">Daily Bonus</h3>
              <p className="text-sm text-muted-foreground mb-4">Come back tomorrow for +25 XP</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
