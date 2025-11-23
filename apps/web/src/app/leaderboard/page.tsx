'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useLeaderboard, useFriendLeaderboard } from '@/hooks/use-leaderboard'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('global')
  const { address } = useAccount()
  const { entries: globalEntries, isLoading: isGlobalLoading } = useLeaderboard(100)
  const { entries: friendEntries, isLoading: isFriendLoading } = useFriendLeaderboard(address, 100)

  // Transform contract data to table format
  const transformEntries = (entries: typeof globalEntries) => {
    return entries.map((entry, index) => ({
      rank: index + 1,
      address: entry.player,
      score: Number(entry.score),
      games: 0, // Not available from contract
      streak: 0, // Not available from contract
      isCurrentUser: address?.toLowerCase() === entry.player.toLowerCase(),
    }))
  }

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
                {isGlobalLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <LeaderboardTable entries={transformEntries(globalEntries)} />
                )}
              </TabsContent>

              <TabsContent value="friends" className="space-y-4">
                {isFriendLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : friendEntries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No friends on the leaderboard yet.</p>
                    <p className="text-sm mt-2">Add friends to see them here!</p>
                  </div>
                ) : (
                  <LeaderboardTable entries={transformEntries(friendEntries.filter(e => e.isFriend))} />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
