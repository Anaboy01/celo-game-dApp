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
import { uploadToIPFS, validateImageUrls, type GameMetadata } from '@/lib/ipfs'

interface TemplateForm {
  answer: string
  reward: string
  difficulty: '0' | '1' | '2'
  hint: string
  images: string[] // Array of 4 image URLs or IPFS hashes
}

// Helper to extract error message from various error types
function extractErrorMessage(error: any): string {
  if (!error) return 'Unknown error'
  
  // Try to get the most useful error message
  if (error.message) {
    // Check for revert reason in the message
    const revertMatch = error.message.match(/revert\s+(.+)/i) || 
                       error.message.match(/execution reverted:\s*(.+)/i) ||
                       error.message.match(/reason:\s*(.+)/i)
    if (revertMatch) {
      return revertMatch[1].trim()
    }
    return error.message
  }
  
  if (error.reason) return error.reason
  if (error.shortMessage) return error.shortMessage
  if (typeof error === 'string') return error
  
  // Try to stringify the error
  try {
    return JSON.stringify(error, null, 2)
  } catch {
    return String(error)
  }
}

export default function AdminPage() {
  const { address, isConnected, chain } = useAccount()
  const { chains, switchChain } = useSwitchChain()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [templateForm, setTemplateForm] = useState<TemplateForm>({
    answer: '',
    reward: '1',
    difficulty: '0',
    hint: '',
    images: ['', '', '', ''],
  })
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false)
  const [ipfsHash, setIpfsHash] = useState<string | null>(null)
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

  const { data: minRewardAmount } = useReadContract({
    address: GAME_CONTRACT_ADDRESS as `0x${string}`,
    abi: GAME_CONTRACT_ABI,
    functionName: 'minRewardAmount' as any,
  })

  const { data: maxRewardAmount } = useReadContract({
    address: GAME_CONTRACT_ADDRESS as `0x${string}`,
    abi: GAME_CONTRACT_ABI,
    functionName: 'maxRewardAmount' as any,
  })

  // Type-safe reward limits
  const minReward = minRewardAmount as bigint | undefined
  const maxReward = maxRewardAmount as bigint | undefined

  // Normalize answer the same way the contract does (lowercase, trim spaces)
  const normalizedAnswer = templateForm.answer ? templateForm.answer.toLowerCase().trim().replace(/^\s+|\s+$/g, '') : ''

  const { data: calculatedHash } = useReadContract({
    address: GAME_CONTRACT_ADDRESS as `0x${string}`,
    abi: GAME_CONTRACT_ABI,
    functionName: 'calculateAnswerHash',
    args: normalizedAnswer ? [normalizedAnswer] : undefined,
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

  const { 
    isLoading: isAddTemplateConfirming, 
    isSuccess: isAddTemplateSuccess,
    error: addTemplateReceiptError,
    data: addTemplateReceipt
  } = useWaitForTransactionReceipt({ hash: addTemplateHash })

  const { 
    writeContract: depositFunds, 
    data: depositHash,
    isPending: isDepositing,
    error: depositError 
  } = useWriteContract()

  const { 
    isLoading: isDepositConfirming, 
    isSuccess: isDepositSuccess,
    error: depositReceiptError
  } = useWaitForTransactionReceipt({ hash: depositHash })

  const { 
    writeContract: withdrawFunds, 
    data: withdrawHash,
    isPending: isWithdrawing,
    error: withdrawError
  } = useWriteContract()

  const { 
    isLoading: isWithdrawConfirming, 
    isSuccess: isWithdrawSuccess,
    error: withdrawReceiptError
  } = useWaitForTransactionReceipt({ hash: withdrawHash })

  const isOwner = owner && address && (owner as string).toLowerCase() === address.toLowerCase()

  useEffect(() => {
    if (isAddTemplateSuccess) {
      setTxStatus({ message: `✅ Template added successfully! IPFS: ${ipfsHash?.slice(0, 10)}...`, type: 'success' })
      setTemplateForm({ answer: '', reward: '1', difficulty: '0', hint: '', images: ['', '', '', ''] })
      setIpfsHash(null)
      setTimeout(() => {
        refetchCount()
        setTxStatus(null)
      }, 5000)
    }
  }, [isAddTemplateSuccess, ipfsHash, refetchCount])

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

  // Enhanced error logging
  useEffect(() => {
    if (addTemplateError) {
      console.error('[Admin] Add Template Error:', addTemplateError)
      const errorMessage = extractErrorMessage(addTemplateError)
      const shortMessage = errorMessage.length > 300 ? errorMessage.slice(0, 300) + '...' : errorMessage
      setTxStatus({ 
        message: `❌ Transaction Failed: ${shortMessage}`, 
        type: 'error' 
      })
      setTimeout(() => setTxStatus(null), 15000)
    }
  }, [addTemplateError])

  useEffect(() => {
    if (addTemplateReceiptError) {
      console.error('[Admin] Add Template Receipt Error:', addTemplateReceiptError)
      const errorMessage = extractErrorMessage(addTemplateReceiptError)
      const shortMessage = errorMessage.length > 300 ? errorMessage.slice(0, 300) + '...' : errorMessage
      setTxStatus({ 
        message: `❌ Transaction Reverted: ${shortMessage}`, 
        type: 'error' 
      })
      setTimeout(() => setTxStatus(null), 15000)
    }
  }, [addTemplateReceiptError])

  useEffect(() => {
    if (depositError) {
      console.error('[Admin] Deposit Error:', depositError)
      const errorMessage = extractErrorMessage(depositError)
      const shortMessage = errorMessage.length > 300 ? errorMessage.slice(0, 300) + '...' : errorMessage
      setTxStatus({ 
        message: `❌ Deposit Failed: ${shortMessage}`, 
        type: 'error' 
      })
      setTimeout(() => setTxStatus(null), 15000)
    }
  }, [depositError])

  useEffect(() => {
    if (depositReceiptError) {
      console.error('[Admin] Deposit Receipt Error:', depositReceiptError)
      const errorMessage = extractErrorMessage(depositReceiptError)
      const shortMessage = errorMessage.length > 300 ? errorMessage.slice(0, 300) + '...' : errorMessage
      setTxStatus({ 
        message: `❌ Deposit Reverted: ${shortMessage}`, 
        type: 'error' 
      })
      setTimeout(() => setTxStatus(null), 15000)
    }
  }, [depositReceiptError])

  useEffect(() => {
    if (withdrawError) {
      console.error('[Admin] Withdraw Error:', withdrawError)
      const errorMessage = extractErrorMessage(withdrawError)
      const shortMessage = errorMessage.length > 300 ? errorMessage.slice(0, 300) + '...' : errorMessage
      setTxStatus({ 
        message: `❌ Withdraw Failed: ${shortMessage}`, 
        type: 'error' 
      })
      setTimeout(() => setTxStatus(null), 15000)
    }
  }, [withdrawError])

  useEffect(() => {
    if (withdrawReceiptError) {
      console.error('[Admin] Withdraw Receipt Error:', withdrawReceiptError)
      const errorMessage = extractErrorMessage(withdrawReceiptError)
      const shortMessage = errorMessage.length > 300 ? errorMessage.slice(0, 300) + '...' : errorMessage
      setTxStatus({ 
        message: `❌ Withdraw Reverted: ${shortMessage}`, 
        type: 'error' 
      })
      setTimeout(() => setTxStatus(null), 15000)
    }
  }, [withdrawReceiptError])

  const handleAddTemplate = async () => {
    if (!templateForm.answer || !templateForm.reward || !answerHash) {
      setTxStatus({ message: '⚠️ Please fill in all fields', type: 'error' })
      return
    }

    // Validate images
    if (!validateImageUrls(templateForm.images)) {
      setTxStatus({ message: '⚠️ Please provide 4 image URLs', type: 'error' })
      return
    }

    if (contractNotFound) {
      setTxStatus({ message: '⚠️ Contract not found on this network. Please switch networks.', type: 'error' })
      return
    }

    const rewardAmount = parseFloat(templateForm.reward)
    if (isNaN(rewardAmount) || rewardAmount <= 0) {
      setTxStatus({ message: '⚠️ Please enter a valid reward amount', type: 'error' })
      return
    }

    // Validate reward amount against contract limits
    const rewardInWei = parseEther(templateForm.reward)
    
    if (minReward && rewardInWei < minReward) {
      const minCELO = Number(minReward) / 1e18
      setTxStatus({ 
        message: `⚠️ Reward too low. Minimum: ${minCELO.toFixed(2)} CELO`, 
        type: 'error' 
      })
      return
    }
    if (maxReward && rewardInWei > maxReward) {
      const maxCELO = Number(maxReward) / 1e18
      setTxStatus({ 
        message: `⚠️ Reward too high. Maximum: ${maxCELO.toFixed(2)} CELO`, 
        type: 'error' 
      })
      return
    }

    try {
      // Upload metadata to IPFS first
      setIsUploadingToIPFS(true)
      setTxStatus({ message: '📤 Uploading metadata to IPFS...', type: 'info' })

      const metadata: GameMetadata = {
        templateId: 0, // Will be set by contract
        images: templateForm.images,
        answer: templateForm.answer,
        hint: templateForm.hint,
        difficulty: ['easy', 'medium', 'hard'][parseInt(templateForm.difficulty)] as 'easy' | 'medium' | 'hard',
      }

      const metadataHash = await uploadToIPFS(metadata)
      console.log('[Admin] IPFS hash received:', metadataHash)
      
      if (!metadataHash) {
        throw new Error('IPFS upload returned no hash')
      }
      
      setIpfsHash(metadataHash)
      setIsUploadingToIPFS(false)
      
      setTxStatus({ message: `✅ Metadata uploaded to IPFS: ${metadataHash.slice(0, 10)}...`, type: 'info' })

      // Now create the template on-chain
      addTemplate({
        address: GAME_CONTRACT_ADDRESS as `0x${string}`,
        abi: GAME_CONTRACT_ABI,
        functionName: 'addGameTemplate',
        args: [
          answerHash as `0x${string}`,
          rewardInWei,
          parseInt(templateForm.difficulty),
        ],
      })
      setTxStatus({ message: '⏳ Confirm transaction in your wallet...', type: 'info' })
    } catch (error: any) {
      setIsUploadingToIPFS(false)
      console.error('[Admin] Add template exception:', error)
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      setTxStatus({ 
        message: `❌ Failed: ${errorMessage}`, 
        type: 'error' 
      })
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
      setTxStatus({ message: '⏳ Confirm transaction in your wallet...', type: 'info' })
    } catch (error: any) {
      console.error('[Admin] Deposit exception:', error)
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      setTxStatus({ 
        message: `❌ Failed to send transaction: ${errorMessage}`, 
        type: 'error' 
      })
    }
  }

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setTxStatus({ message: '⚠️ Please enter a valid amount', type: 'error' })
      return
    }

    try {
      console.log('[Admin] Withdrawing funds:', {
        amount: withdrawAmount,
        wei: parseEther(withdrawAmount).toString(),
      })
      
      withdrawFunds({
        address: GAME_CONTRACT_ADDRESS as `0x${string}`,
        abi: GAME_CONTRACT_ABI,
        functionName: 'withdrawFunds',
        args: [parseEther(withdrawAmount)],
      })
      setTxStatus({ message: '⏳ Confirm transaction in your wallet...', type: 'info' })
    } catch (error: any) {
      console.error('[Admin] Withdraw exception:', error)
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      setTxStatus({ 
        message: `❌ Failed to send transaction: ${errorMessage}`, 
        type: 'error' 
      })
    }
  }

  const SAMPLE_TEMPLATES = [
    { answer: 'beach', reward: '0.5', difficulty: '0', hint: 'Sandy place by the ocean' },
    { answer: 'mountain', reward: '2', difficulty: '1', hint: 'Very tall natural elevation' },
    { answer: 'restaurant', reward: '5', difficulty: '2', hint: 'Place to eat meals' },
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
          <Card className={`p-4 flex items-start gap-3 ${
            txStatus.type === 'success' ? 'bg-primary/10 border-primary/30' :
            txStatus.type === 'error' ? 'bg-destructive/10 border-destructive/30' :
            'bg-muted/10 border-muted/30'
          }`}>
            {txStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-primary mt-0.5" />}
            {txStatus.type === 'error' && <XCircle className="w-5 h-5 text-destructive mt-0.5" />}
            {txStatus.type === 'info' && <Loader2 className="w-5 h-5 text-primary animate-spin mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm break-words">{txStatus.message}</p>
              {txStatus.type === 'error' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Check the browser console for detailed error logs
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setTxStatus(null)} className="shrink-0">
              <XCircle className="w-4 h-4" />
            </Button>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-border bg-card/50">
            <p className="text-sm text-muted-foreground mb-2">Contract Balance</p>
            <p className="text-3xl font-bold text-foreground">
               {contractBalance ? formatCELO(contractBalance as bigint) : '0.00'} CELO
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
                      {normalizedAnswer && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Normalized: "{normalizedAnswer}"
                        </p>
                      )}
                      {answerHash && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          Hash: {answerHash.slice(0, 20)}...
                        </p>
                      )}
                      {!answerHash && normalizedAnswer && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Calculating hash...
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Reward (CELO)
                        {minReward && maxReward && (
                          <span className="text-xs text-muted-foreground ml-2 font-normal">
                            (Range: {formatCELO(minReward)} - {formatCELO(maxReward)} CELO)
                          </span>
                        )}
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="1.0"
                        value={templateForm.reward}
                        onChange={(e) => setTemplateForm({...templateForm, reward: e.target.value})}
                        className="bg-card border-border text-foreground"
                      />
                      {minReward && maxReward && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Valid range: {formatCELO(minReward)} - {formatCELO(maxReward)} CELO
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">Hint</label>
                      <Input
                        placeholder="e.g., A sandy place by the ocean"
                        value={templateForm.hint}
                        onChange={(e) => setTemplateForm({...templateForm, hint: e.target.value})}
                        className="bg-card border-border text-foreground"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Images (4 URLs required)
                      </label>
                      <div className="space-y-2">
                        {[0, 1, 2, 3].map((index) => (
                          <Input
                            key={index}
                            placeholder={`Image ${index + 1} URL or IPFS hash...`}
                            value={templateForm.images[index] || ''}
                            onChange={(e) => {
                              const newImages = [...templateForm.images]
                              newImages[index] = e.target.value
                              setTemplateForm({...templateForm, images: newImages})
                            }}
                            className="bg-card border-border text-foreground"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter 4 image URLs or IPFS hashes. These will be stored on IPFS.
                      </p>
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
                      disabled={isAddingTemplate || isAddTemplateConfirming || isUploadingToIPFS || !templateForm.answer || !templateForm.reward || !validateImageUrls(templateForm.images)}
                      className="w-full gap-2"
                    >
                      {(isAddingTemplate || isAddTemplateConfirming || isUploadingToIPFS) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isUploadingToIPFS ? 'Uploading to IPFS...' : isAddingTemplate ? 'Confirm in Wallet...' : 'Adding...'}
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
                      {contractBalance ? formatCELO(contractBalance as bigint) : '0.00'} CELO
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