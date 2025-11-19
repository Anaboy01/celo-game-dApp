'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Trophy } from 'lucide-react'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('global')

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">Compete globally and with friends</p>
        </div>

        {/* Tabs */}
        <Card className="border-border bg-card p-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border bg-card/50">
              <TabsTrigger value="global" className="rounded-none">Global Rankings</TabsTrigger>
              <TabsTrigger value="friends" className="rounded-none">Friends</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="global" className="space-y-4">
                <LeaderboardTable />
              </TabsContent>

              <TabsContent value="friends" className="space-y-4">
                <LeaderboardTable />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
