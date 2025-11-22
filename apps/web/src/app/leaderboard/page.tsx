'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy } from 'lucide-react'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { useLeaderboard, useFriendLeaderboard } from '@/hooks/use-leaderboard' 

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('global')
  const [playerAddress, setPlayerAddress] = useState<string | undefined>(undefined)

  const {
    entries: globalEntries,
    isLoading: globalLoading,
    error: globalError,
    refetch: refetchGlobal,
  } = useLeaderboard(100)

  const {
    entries: friendEntries,
    isLoading: friendLoading,
    error: friendError,
    refetch: refetchFriends,
  } = useFriendLeaderboard(playerAddress, 50)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ethereum = (window as any).ethereum
    if (!ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) setPlayerAddress(accounts[0])
      else setPlayerAddress(undefined)
    }

    ethereum
      .request?.({ method: 'eth_accounts' })
      .then((accounts: string[]) => handleAccountsChanged(accounts))
      .catch(() => {})

    ethereum.on?.('accountsChanged', handleAccountsChanged)

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged)
    }
  }, [])

  const connectWallet = async () => {
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) {
        alert('No Ethereum provider found. Install MetaMask or another wallet.')
        return
      }
      const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts && accounts.length > 0) setPlayerAddress(accounts[0])
    } catch (err) {
      console.error('Wallet connect error', err)
    }
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
              {/* Global Tab */}
              <TabsContent value="global" className="space-y-4">
                <LeaderboardTable entries={globalEntries} isLoading={globalLoading} />
                {globalError && (
                  <div className="text-sm text-destructive">Failed to load global leaderboard.</div>
                )}
                <div className="mt-2 flex gap-2">
                  <Button onClick={() => refetchGlobal?.()} size="sm">Refresh</Button>
                </div>
              </TabsContent>

              {/* Friends Tab */}
              <TabsContent value="friends" className="space-y-4">
                {!playerAddress ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                      Connect your wallet to view your friends leaderboard.
                    </p>
                    <Button onClick={connectWallet}>Connect Wallet</Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Showing friends leaderboard for <span className="font-mono">{playerAddress}</span>
                    </p>
                    <LeaderboardTable entries={friendEntries} isLoading={friendLoading} />
                    {friendError && (
                      <div className="text-sm text-destructive">Failed to load friends leaderboard.</div>
                    )}
                    <div className="mt-2 flex gap-2">
                      <Button onClick={() => refetchFriends?.()} size="sm">Refresh Friends</Button>
                      <Button onClick={() => setPlayerAddress(undefined)} size="sm" variant="ghost">
                        Disconnect
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}



