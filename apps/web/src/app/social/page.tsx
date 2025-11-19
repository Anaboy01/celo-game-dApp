'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, X } from 'lucide-react'

export default function SocialPage() {
  const friends = [
    { id: 1, address: '0x9876...5432', score: 14820, status: 'online' },
    { id: 2, address: '0x5555...6666', score: 13500, status: 'offline' },
    { id: 3, address: '0x7777...8888', score: 12100, status: 'online' },
  ]

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
              placeholder="Enter friend's wallet address..."
              className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </Card>

        {/* Friends List */}
        <Card className="p-6 border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends ({friends.length}/10)
          </h2>
          <div className="space-y-3">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border hover:bg-card/70 transition">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-foreground">{friend.address}</p>
                    <Badge variant={friend.status === 'online' ? 'default' : 'secondary'} className="text-xs mt-1">
                      {friend.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{friend.score.toLocaleString()}</p>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive mt-2">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Invitations */}
        <Card className="p-6 border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
              <p className="font-mono text-sm text-foreground">0x1111...2222</p>
              <div className="flex gap-2">
                <Button size="sm" variant="default">Accept</Button>
                <Button size="sm" variant="outline">Decline</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
