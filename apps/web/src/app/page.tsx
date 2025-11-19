'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Zap, Trophy, Users, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm text-primary font-medium">
              Web3 Gaming Platform
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Guess the word from <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">4 pictures</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Play the ultimate puzzle game on Celo. Earn crypto rewards, climb the leaderboard, and challenge your friends in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/game">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <Zap className="w-5 h-5" />
                Play Now
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Trophy className="w-5 h-5" />
                View Leaderboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-12">
            <Card className="p-4 border-border bg-card/50">
              <p className="text-2xl font-bold text-foreground">1.2K+</p>
              <p className="text-xs text-muted-foreground">Active Players</p>
            </Card>
            <Card className="p-4 border-border bg-card/50">
              <p className="text-2xl font-bold text-foreground">45K+</p>
              <p className="text-xs text-muted-foreground">Games Played</p>
            </Card>
            <Card className="p-4 border-border bg-card/50">
              <p className="text-2xl font-bold text-foreground">50K+</p>
              <p className="text-xs text-muted-foreground">CELO Distributed</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-foreground text-center mb-12">Why Play?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Earn CELO',
                description: 'Win crypto rewards for correct answers. Higher difficulty = bigger rewards.',
              },
              {
                icon: Trophy,
                title: 'Compete Globally',
                description: 'Rise through the global leaderboard and prove your puzzle-solving skills.',
              },
              {
                icon: Users,
                title: 'Social Features',
                description: 'Add friends, challenge them directly, and climb the friend leaderboard together.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card
                  key={i}
                  className="p-6 border-border bg-card/50 hover:bg-card/80 transition hover:border-primary/50"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-border bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h3 className="text-3xl font-bold text-foreground">Ready to Play?</h3>
          <p className="text-muted-foreground">Connect your wallet and start earning CELO today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/game">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/social">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Users className="w-5 h-5" />
                Add Friends
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
