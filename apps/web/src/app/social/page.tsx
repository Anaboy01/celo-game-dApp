'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, UserPlus, X, Loader2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useFriends } from '@/hooks/use-friends'
import { useFriendLeaderboard } from '@/hooks/use-leaderboard'
import { formatAddress } from '@/lib/contract-helpers'
import { isValidAddress } from '@/lib/validation'

export default function SocialPage() {
  const { address } = useAccount()
  const [friendAddress, setFriendAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const { friends, isLoading: isFriendsLoading, addFriend, removeFriend, isAdding, isRemoving } = useFriends(address)
  const { entries: friendLeaderboard, isLoading: isLeaderboardLoading } = useFriendLeaderboard(address, 100)

  // Create a map of friend scores from leaderboard
  const friendScores = new Map(
    friendLeaderboard
      .filter(entry => entry.isFriend)
      .map(entry => [entry.player.toLowerCase(), Number(entry.score)])
  )

  const handleAddFriend = async () => {
    setError(null)
    
    if (!friendAddress.trim()) {
      setError('Please enter a wallet address')
      return
    }

    if (!isValidAddress(friendAddress)) {
      setError('Invalid wallet address')
      return
    }

    if (friendAddress.toLowerCase() === address?.toLowerCase()) {
      setError('Cannot add yourself as a friend')
      return
    }

    try {
      await addFriend(friendAddress)
      setFriendAddress('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add friend')
    }
  }

  const handleRemoveFriend = async (friendAddr: string) => {
    try {
      await removeFriend(friendAddr)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove friend')
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Social</h1>
          </div>
          <p className="text-muted-foreground">Manage friends and challenges</p>
        </div>

        {/* Add Friend */}
        <Card className="p-6 border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Add Friend</h2>
          <div className="flex gap-2">
            <Input 
              value={friendAddress}
              onChange={(e) => {
                setFriendAddress(e.target.value)
                setError(null)
              }}
              placeholder="Enter friend's wallet address (0x...)"
              className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              disabled={isAdding || !address}
            />
            <Button 
              onClick={handleAddFriend}
              disabled={isAdding || !address || !friendAddress.trim()}
              className="gap-2"
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add
                </>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
          {!address && (
            <p className="text-sm text-muted-foreground mt-2">Connect your wallet to add friends</p>
          )}
        </Card>

        {/* Friends List */}
        <Card className="p-6 border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends ({friends.length}/100)
          </h2>
          {isFriendsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No friends yet. Add some friends to compete!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => {
                const friendScore = friendScores.get(friend.toLowerCase()) || 0
                return (
                  <div key={friend} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border hover:bg-card/70 transition">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-foreground">{formatAddress(friend)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Score: {friendScore.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveFriend(friend)}
                      disabled={isRemoving}
                    >
                      {isRemoving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
