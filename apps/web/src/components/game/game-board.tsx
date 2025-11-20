'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, Lightbulb, RotateCw } from 'lucide-react'
import { useGame, useGameTimer } from '@/hooks/use-game'
import { useSubmitGuess } from '@/hooks/use-submit-guess'
import { useBuyHint } from '@/hooks/use-buy-hint'

export function GameBoard() {
  const [guess, setGuess] = useState('')
  const [showHint, setShowHint] = useState(false)

  const { game, isLoading } = useGame('0x1234...5678')
  const { timeLeft, isExpired, formattedTime } = useGameTimer(game?.endTime)
  const { submitGuess, isLoading: isSubmitting, isSuccess } = useSubmitGuess()
  const { buyHint, isLoading: isBuyingHint } = useBuyHint()

  const handleSubmit = async () => {
    if (!guess.trim()) return
    await submitGuess(guess)
    setGuess('')
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading game...</div>
  }

  if (!game) {
    return <div className="text-center py-8 text-muted-foreground">No active game</div>
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${isExpired ? 'text-destructive' : 'text-primary'}`} />
          <span className={`text-lg font-semibold ${isExpired ? 'text-destructive' : 'text-foreground'}`}>
            {formattedTime}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">Game 1 of 5</div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative aspect-square bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/30 overflow-hidden group cursor-pointer hover:border-primary/50 transition">
            <img 
              src={`/puzzle-image-.jpg?height=200&width=200&query=puzzle+image+${i}`}
              alt={`Puzzle image ${i}`}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          </div>
        ))}
      </div>

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
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>

          {/* Hint */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => {
                buyHint(game.hintCost.toString())
                setShowHint(true)
              }}
              disabled={isBuyingHint || game.hasPlayerBoughtHint}
            >
              <Lightbulb className="w-4 h-4" />
              {game.hasPlayerBoughtHint ? 'Hint Used' : `Buy Hint (${game.hintCost} CELO)`}
            </Button>
          </div>

          {showHint && (
            <Card className="p-4 bg-primary/10 border-primary/30">
              <p className="text-sm text-foreground">Hint: A common activity people enjoy in summer</p>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-6 bg-primary/10 border-primary/30 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isExpired ? 'Time\'s up!' : 'Correct! 🎉'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isExpired ? 'Game over. Better luck next time!' : 'You earned 50 CELO and 100 XP'}
          </p>
          <Button onClick={() => window.location.reload()} className="w-full gap-2">
            <RotateCw className="w-4 h-4" />
            Next Game
          </Button>
        </Card>
      )}
    </div>
  )
}
