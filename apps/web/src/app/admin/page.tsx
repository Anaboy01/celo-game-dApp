'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Plus, Settings, Wallet, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from 'wagmi'
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI } from '@/lib/contract-config'
import { formatCELO } from '@/lib/contract-helpers'
import { parseEther } from 'viem'

interface TemplateForm {
  answer: string
  reward: string
  difficulty: '0' | '1' | '2'
  hint: string
}

export default function AdminPage() {
  const { address, isConnected, chain } = useAccount()
  const { chains, switchChain } = useSwitchChain()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [templateForm, setTemplateForm] = useState<TemplateForm>({
    answer: '',
    reward: '10',
    difficulty: '0',
    hint: '',
  })
  const [answerHash, setAnswerHash] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null)

  // Check if contract exists on current network
  const { data: owner, isError: contractNotFound, refetch: refetchOwner } = useReadContract({
    address: GAME_CONTRACT_ADDRESS as `0x${string}`,
    abi: GAME_CONTRACT_ABI,
    functionName: 'owner',
  })

  const { data: contractBalance, refetch: refetchBalance } = useReadContract({
    address: GAME_CONTRACT_ADDRESS as `0x${string}`,
    abi: GAME_CONTRACT_ABI,
    functionName: 'getContractBalance',
  })

  const { data: templateCount, refetch: refetchCount } = useReadContract({
    address: GAME_CONTRACT_ADDRESS as `0x${string}`,
    abi: GAME_CONTRACT_ABI,
    functionName: 'getActiveGameTemplateCount',
  })

  const { data: calculatedHash } = useReadContract({
    address: GAME_CONTRACT_ADDRESS as `0x${string}`,
    abi: GAME_CONTRACT_ABI,
    functionName: 'calculateAnswerHash',
    args: templateForm.answer ? [templateForm.answer.toLowerCase().trim()] : undefined,
  })

  useEffect(() => {
    if (calculatedHash) {
      setAnswerHash(calculatedHash as string)
    }
  }, [calculatedHash])

  const { 
    writeContract: addTemplate, 
    data: addTemplateHash,
    isPending: isAddingTemplate,
    error: addTemplateError 
  } = useWriteContract()

  const { isLoading: isAddTemplateConfirming, isSuccess: isAddTemplateSuccess } = 
    useWaitForTransactionReceipt({ hash: addTemplateHash })

  const { 
    writeContract: depositFunds, 
    data: depositHash,
    isPending: isDepositing,
    error: depositError 
  } = useWriteContract()

  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = 
    useWaitForTransactionReceipt({ hash: depositHash })

  const { 
    writeContract: withdrawFunds, 
    data: withdrawHash,
    isPending: isWithdrawing,
  } = useWriteContract()

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = 
    useWaitForTransactionReceipt({ hash: withdrawHash })

  const isOwner = owner && address && (owner as string).toLowerCase() === address.toLowerCase()

  useEffect(() => {
    if (isAddTemplateSuccess) {
      setTxStatus({ message: '✅ Template added successfully!', type: 'success' })
      setTemplateForm({ answer: '', reward: '10', difficulty: '0', hint: '' })
      setTimeout(() => {
        refetchCount()
        setTxStatus(null)
      }, 3000)
    }
  }, [isAddTemplateSuccess])

  useEffect(() => {
    if (isDepositSuccess) {
      setTxStatus({ message: '✅ Funds deposited successfully!', type: 'success' })
      setDepositAmount('')
      setTimeout(() => {
        refetchBalance()
        setTxStatus(null)
      }, 3000)
    }
  }, [isDepositSuccess])

  useEffect(() => {
    if (isWithdrawSuccess) {
      setTxStatus({ message: '✅ Funds withdrawn successfully!', type: 'success' })
      setWithdrawAmount('')
      setTimeout(() => {
        refetchBalance()
        setTxStatus(null)
      }, 3000)
    }
  }, [isWithdrawSuccess])

  useEffect(() => {
    if (addTemplateError) {
      setTxStatus({ message: `❌ Error: ${addTemplateError.message?.slice(0, 100)}...`, type: 'error' })
      setTimeout(() => setTxStatus(null), 8000)
    }
  }, [addTemplateError])

  useEffect(() => {
    if (depositError) {
      setTxStatus({ message: `❌ Error: ${depositError.message?.slice(0, 100)}...`, type: 'error' })
      setTimeout(() => setTxStatus(null), 8000)
    }
  }, [depositError])

  const handleAddTemplate = () => {
    if (!templateForm.answer || !templateForm.reward || !answerHash) {
      setTxStatus({ message: '⚠️ Please fill in all fields', type: 'error' })
      return
    }

    if (contractNotFound) {
      setTxStatus({ message: '⚠️ Contract not found on this network. Please switch networks.', type: 'error' })
      return
    }

    try {
      addTemplate({
        address: GAME_CONTRACT_ADDRESS as `0x${string}`,
        abi: GAME_CONTRACT_ABI,
        functionName: 'addGameTemplate',
        args: [
          answerHash as `0x${string}`,
          parseEther(templateForm.reward),
          parseInt(templateForm.difficulty),
        ],
      })
    } catch (error: any) {
      setTxStatus({ message: `❌ ${error.message}`, type: 'error' })
    }
  }

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setTxStatus({ message: '⚠️ Please enter a valid amount', type: 'error' })
      return
    }

    try {
      depositFunds({
        address: GAME_CONTRACT_ADDRESS as `0x${string}`,
        abi: GAME_CONTRACT_ABI,
        functionName: 'depositFunds',
        value: parseEther(depositAmount),
      })
    } catch (error: any) {
      setTxStatus({ message: `❌ ${error.message}`, type: 'error' })
    }
  }

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setTxStatus({ message: '⚠️ Please enter a valid amount', type: 'error' })
      return
    }

    try {
      withdrawFunds({
        address: GAME_CONTRACT_ADDRESS as `0x${string}`,
        abi: GAME_CONTRACT_ABI,
        functionName: 'withdrawFunds',
        args: [parseEther(withdrawAmount)],
      })
    } catch (error: any) {
      setTxStatus({ message: `❌ ${error.message}`, type: 'error' })
    }
  }

  const SAMPLE_TEMPLATES = [
    { answer: 'beach', reward: '10', difficulty: '0', hint: 'Sandy place by the ocean' },
    { answer: 'mountain', reward: '20', difficulty: '1', hint: 'Very tall natural elevation' },
    { answer: 'restaurant', reward: '30', difficulty: '2', hint: 'Place to eat meals' },
  ]

  const addSampleTemplate = (sample: typeof SAMPLE_TEMPLATES[0]) => {
    setTemplateForm(sample as TemplateForm)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="p-8 text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-muted-foreground">Please connect your wallet to access the admin dashboard</p>
          </Card>
        </div>
      </div>
    )
  }

  // Network warning
  if (contractNotFound) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          <Card className="p-8 border-destructive/50 bg-destructive/10">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-center">Contract Not Found</h2>
            <p className="text-muted-foreground text-center mb-4">
              The contract is not deployed on <strong>{chain?.name}</strong>
            </p>
            <div className="text-sm text-center space-y-2">
              <p className="font-mono text-xs break-all">{GAME_CONTRACT_ADDRESS}</p>
              <p className="text-muted-foreground">Please switch to the network where your contract is deployed:</p>
            </div>
            <div className="flex gap-2 justify-center mt-6 flex-wrap">
              {chains.map((c) => (
                <Button
                  key={c.id}
                  variant={chain?.id === c.id ? 'default' : 'outline'}
                  onClick={() => switchChain?.({ chainId: c.id })}
                >
                  {c.name}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="mx-auto mt-4 gap-2"
              onClick={() => refetchOwner()}
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="p-8 border-destructive/50 bg-destructive/10">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-center">Access Denied</h2>
            <p className="text-muted-foreground text-center">Only the contract owner can access this page</p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Owner: {owner ? `${(owner as string).slice(0, 6)}...${(owner as string).slice(-4)}` : 'Unknown'}
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Connected to {chain?.name} • Network ID: {chain?.id}
          </p>
        </div>

        {/* Status Message */}
        {txStatus && (
          <Card className={`p-4 flex items-center gap-3 ${
            txStatus.type === 'success' ? 'bg-primary/10 border-primary/30' :
            txStatus.type === 'error' ? 'bg-destructive/10 border-destructive/30' :
            'bg-muted/10 border-muted/30'
          }`}>
            {txStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-primary" />}
            {txStatus.type === 'error' && <XCircle className="w-5 h-5 text-destructive" />}
            <p className="text-sm flex-1">{txStatus.message}</p>
            <Button variant="ghost" size="sm" onClick={() => setTxStatus(null)}>
              <XCircle className="w-4 h-4" />
            </Button>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Contract Balance</p>
            <p className="text-3xl font-bold text-foreground">
              {contractBalance ? formatCELO(contractBalance as bigint) : '0.0000'} CELO
            </p>
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Active Templates</p>
            <p className="text-3xl font-bold text-foreground">
              {templateCount ? templateCount.toString() : '0'}
            </p>
          </Card>
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Your Address</p>
            <p className="text-sm font-mono text-foreground">
              {address?.slice(0, 10)}...{address?.slice(-8)}
            </p>
          </Card>
        </div>

        {/* Rest of your existing tabs code... */}
        <Card className="border-border bg-card p-0 overflow-hidden">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border bg-card/50">
              <TabsTrigger value="templates" className="rounded-none">Templates</TabsTrigger>
              <TabsTrigger value="funds" className="rounded-none">Funds</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="templates" className="space-y-6">
                <Card className="p-6 bg-card/50 border-border">
                  <h3 className="text-lg font-semibold mb-4">Add New Template</h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Quick add samples:</p>
                    <div className="flex gap-2 flex-wrap">
                      {SAMPLE_TEMPLATES.map((sample, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => addSampleTemplate(sample)}
                        >
                          {sample.answer} ({['Easy', 'Medium', 'Hard'][parseInt(sample.difficulty)]})
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">Answer</label>
                      <Input
                        placeholder="e.g., beach"
                        value={templateForm.answer}
                        onChange={(e) => setTemplateForm({...templateForm, answer: e.target.value})}
                        className="bg-card border-border text-foreground"
                      />
                      {answerHash && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Hash: {answerHash.slice(0, 10)}...
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">Reward (CELO)</label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={templateForm.reward}
                        onChange={(e) => setTemplateForm({...templateForm, reward: e.target.value})}
                        className="bg-card border-border text-foreground"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">Difficulty</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Easy', 'Medium', 'Hard'].map((diff, i) => (
                          <Button
                            key={i}
                            variant={templateForm.difficulty === i.toString() ? 'default' : 'outline'}
                            onClick={() => setTemplateForm({...templateForm, difficulty: i.toString() as '0' | '1' | '2'})}
                          >
                            {diff}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleAddTemplate}
                      disabled={isAddingTemplate || isAddTemplateConfirming || !templateForm.answer || !templateForm.reward}
                      className="w-full gap-2"
                    >
                      {(isAddingTemplate || isAddTemplateConfirming) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isAddingTemplate ? 'Confirm in Wallet...' : 'Adding...'}
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Template
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="funds" className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-card/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
                    <p className="text-2xl font-bold text-foreground mb-4">
                      {contractBalance ? formatCELO(contractBalance as bigint) : '0.0000'} CELO
                    </p>
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
                        step="0.01"
                      />
                      <Button 
                        className="gap-2"
                        onClick={handleDeposit}
                        disabled={isDepositing || isDepositConfirming || !depositAmount}
                      >
                        {(isDepositing || isDepositConfirming) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wallet className="w-4 h-4" />
                        )}
                        Deposit
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Withdraw Funds</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Amount in CELO..."
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="flex-1 bg-card border-border text-foreground"
                        type="number"
                        step="0.01"
                      />
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || isWithdrawConfirming || !withdrawAmount}
                      >
                        {(isWithdrawing || isWithdrawConfirming) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wallet className="w-4 h-4" />
                        )}
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}