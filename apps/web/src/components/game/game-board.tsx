// apps/web/src/components/game/game-board.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, Lightbulb, RotateCw, Loader2, Trophy } from 'lucide-react'
import { useGame, useGameTimer } from '@/hooks/use-game'
import { useSubmitGuess } from '@/hooks/use-submit-guess'
import { useBuyHint } from '@/hooks/use-buy-hint'
import { useStartGame } from '@/hooks/use-start-game'
import { useHintStatus } from '@/hooks/use-hint-status'
import { useGetNewGame } from '@/hooks/use-get-new-game'
import { useAccount } from 'wagmi'
import { getGameMetadata, getIPFSImageUrl } from '@/lib/ipfs'
import { formatCELO } from '@/lib/contract-helpers'
import { ImageGrid } from './image-grid'

export function GameBoard() {
  const [guess, setGuess] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [gameMetadata, setGameMetadata] = useState<any>(null)

  const { address } = useAccount()
  const { game, isLoading: isGameLoading, refetch } = useGame(address)
  const { timeLeft, isExpired, formattedTime } = useGameTimer(game?.endTime ? Number(game.endTime) : undefined)
  const { submitGuess, isLoading: isSubmitting, isSuccess, error: submitError } = useSubmitGuess()
  const { buyHint, isLoading: isBuyingHint, isSuccess: isHintBought } = useBuyHint()
  const { startGame, isLoading: isStarting } = useStartGame()
  const { getNew, isLoading: isGettingNew } = useGetNewGame()
  const { hasBoughtHint, refetch: refetchHint } = useHintStatus(address)

  // Fetch game metadata when game changes
  useEffect(() => {
    if (game && game.gameId) {
      const templateId = Number(game.gameId) % 3 // Mock: cycle through 3 templates
      getGameMetadata(templateId).then(metadata => {
        setGameMetadata(metadata)
      })
    }
  }, [game?.gameId])

  const handleSubmit = async () => {
    if (!guess.trim()) return
    await submitGuess(guess)
    if (!submitError) {
      setGuess('')
      // Refetch game to see if we won
      setTimeout(() => refetch(), 2000)
    }
  }

  const handleBuyHint = async () => {
    if (!game) return
    await buyHint(game.hintCost)
    setTimeout(() => {
      refetchHint()
      setShowHint(true)
    }, 2000)
  }

  const handleStartNewGame = async () => {
    if (game?.isActive) {
      await getNew()
    } else {
      await startGame()
    }
    setGuess('')
    setShowHint(false)
    setTimeout(() => {
      refetch()
      refetchHint()
    }, 2000)
  }

  // Update hint display when hint is bought
  useEffect(() => {
    if (hasBoughtHint && gameMetadata?.hint) {
      setShowHint(true)
    }
  }, [hasBoughtHint, gameMetadata])

  if (isGameLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // No active game - show start button
  if (!game || !game.isActive) {
    return (
      <div className="space-y-6 text-center py-12">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Ready to Play?</h3>
          <p className="text-muted-foreground">
            Guess the word from 4 pictures and win CELO rewards!
          </p>
        </div>
        <Button 
          onClick={handleStartNewGame}
          disabled={isStarting || isGettingNew || !address}
          size="lg"
          className="gap-2"
        >
          {(isStarting || isGettingNew) ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Starting Game...
            </>
          ) : (
            <>
              <Trophy className="w-5 h-5" />
              Start New Game
            </>
          )}
        </Button>
        {!address && (
          <p className="text-sm text-muted-foreground">
            Connect your wallet to start playing
          </p>
        )}
      </div>
    )
  }

  const images = gameMetadata?.images || []

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${isExpired ? 'text-destructive' : 'text-primary'}`} />
          <span className={`text-lg font-semibold ${isExpired ? 'text-destructive' : 'text-foreground'}`}>
            {formattedTime}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Reward</p>
          <p className="text-lg font-bold text-primary">
            {formatCELO(game.rewardAmount)} CELO
          </p>
        </div>
      </div>

      {/* Image Grid */}
      <ImageGrid images={images} isLoading={!gameMetadata} />

      {!isSuccess && !isExpired ? (
        <>
          {/* Guess Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Your guess:</label>
            <div className="flex gap-2">
              <Input 
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your answer..."
                className="flex-1 bg-card border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={isSubmitting || isExpired}
              />
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !guess.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
          </div>

          {/* Hint Button */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={handleBuyHint}
              disabled={isBuyingHint || hasBoughtHint}
            >
              <Lightbulb className="w-4 h-4" />
              {hasBoughtHint ? 'Hint Used' : `Buy Hint (${formatCELO(game.hintCost)} CELO)`}
            </Button>
          </div>

          {/* Hint Display */}
          {showHint && gameMetadata?.hint && (
            <Card className="p-4 bg-primary/10 border-primary/30">
              <p className="text-sm font-medium text-foreground mb-1">💡 Hint:</p>
              <p className="text-sm text-foreground">{gameMetadata.hint}</p>
            </Card>
          )}
        </>
      ) : (
        <Card className={`p-6 text-center ${isExpired ? 'bg-destructive/10 border-destructive/30' : 'bg-primary/10 border-primary/30'}`}>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isExpired ? "⏰ Time's Up!" : '🎉 Correct!'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isExpired 
              ? 'Better luck next time!' 
              : `You earned ${formatCELO(game.rewardAmount)} CELO!`
            }
          </p>
          <Button onClick={handleStartNewGame} className="w-full gap-2" disabled={isStarting || isGettingNew}>
            {(isStarting || isGettingNew) ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <RotateCw className="w-4 h-4" />
                Next Game
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  )
}