'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Zap, Trophy, Flame, Star, Award } from 'lucide-react'

export default function ProfilePage() {
  const achievements = [
    { id: 1, name: 'First Win', icon: Trophy, unlocked: true },
    { id: 2, name: 'Ten Wins', icon: Award, unlocked: true },
    { id: 3, name: '50 Wins', icon: Star, unlocked: true },
    { id: 4, name: '100 Wins', icon: Trophy, unlocked: false },
    { id: 5, name: 'Perfect Streak', icon: Flame, unlocked: false },
    { id: 6, name: 'Hint Master', icon: Zap, unlocked: true },
  ]

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
                <h1 className="text-3xl font-bold text-foreground">0x1234...5678</h1>
                <p className="text-muted-foreground">Master Player</p>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Games Played</p>
            <p className="text-3xl font-bold text-foreground">152</p>
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Win Rate</p>
            <p className="text-3xl font-bold text-foreground">87%</p>
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-foreground">2,450 CELO</p>
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Current Streak</p>
            <p className="text-3xl font-bold text-foreground">42</p>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="p-8 border-border bg-card">
          <h2 className="text-2xl font-bold text-foreground mb-6">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <div 
                  key={achievement.id} 
                  className={`p-4 rounded-lg border flex flex-col items-center text-center transition ${
                    achievement.unlocked
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-muted/20 border-muted/30 opacity-50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-xs font-medium text-foreground">{achievement.name}</p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Recent Games */}
        <Card className="p-8 border-border bg-card">
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Games</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Game #{i}</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
                <Badge variant="default">+50 CELO</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
