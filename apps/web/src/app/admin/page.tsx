'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Plus, Settings, Wallet } from 'lucide-react'

export default function AdminPage() {
  const [depositAmount, setDepositAmount] = useState('')

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage game templates and contract settings</p>
        </div>

        {/* Admin Alert */}
        <Card className="p-4 border-destructive/50 bg-destructive/10 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Owner Only</p>
            <p className="text-sm text-muted-foreground">This page is restricted to contract owners</p>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Contract Balance</p>
            <p className="text-3xl font-bold text-foreground">125.5 CELO</p>
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Active Templates</p>
            <p className="text-3xl font-bold text-foreground">45</p>
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Total Players</p>
            <p className="text-3xl font-bold text-foreground">1,234</p>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="border-border bg-card p-0 overflow-hidden">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border bg-card/50">
              <TabsTrigger value="templates" className="rounded-none">Templates</TabsTrigger>
              <TabsTrigger value="funds" className="rounded-none">Funds</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-none">Settings</TabsTrigger>
              <TabsTrigger value="players" className="rounded-none">Players</TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Template
                  </Button>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground">Template #{i}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">Medium</Badge>
                          <Badge variant="outline">50 CELO</Badge>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Deactivate</Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Funds Tab */}
              <TabsContent value="funds" className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-card/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
                    <p className="text-2xl font-bold text-foreground mb-4">125.5 CELO</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Deposit Funds</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Amount in CELO..."
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="flex-1 bg-card border-border text-foreground"
                        type="number"
                      />
                      <Button className="gap-2">
                        <Wallet className="w-4 h-4" />
                        Deposit
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Withdraw Funds</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Amount in CELO..."
                        className="flex-1 bg-card border-border text-foreground"
                        type="number"
                      />
                      <Button variant="outline" className="gap-2">
                        <Wallet className="w-4 h-4" />
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  {[
                    { label: 'Game Duration (seconds)', value: '300' },
                    { label: 'Min Reward (CELO)', value: '10' },
                    { label: 'Max Reward (CELO)', value: '500' },
                    { label: 'Easy Multiplier', value: '1x' },
                    { label: 'Medium Multiplier', value: '2x' },
                    { label: 'Hard Multiplier', value: '3x' },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-foreground block mb-2">{setting.label}</label>
                        <Input 
                          defaultValue={setting.value}
                          className="bg-card border-border text-foreground"
                        />
                      </div>
                      <Button variant="outline" size="sm">Save</Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Players Tab */}
              <TabsContent value="players" className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
                    <div>
                      <p className="font-mono text-sm text-foreground">0x{i}234...567{i}</p>
                      <p className="text-xs text-muted-foreground">Rank: #{100 + i}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{(15000 - i * 500).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{50 + i * 10} games</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
