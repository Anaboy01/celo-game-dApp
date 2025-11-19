'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'

export type TransactionStatus = 'pending' | 'success' | 'error' | null

interface TransactionStatusProps {
  status: TransactionStatus
  message?: string
  txHash?: string
  onDismiss?: () => void
  autoClose?: number
}

export function TransactionStatusComponent({
  status,
  message,
  txHash,
  onDismiss,
  autoClose = 5000,
}: TransactionStatusProps) {
  const [isVisible, setIsVisible] = useState(!!status)

  useEffect(() => {
    if (!status || status === 'pending') return

    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, autoClose)
      return () => clearInterval(timer)
    }
  }, [status, autoClose, onDismiss])

  if (!isVisible || !status) return null

  const getIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-primary" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />
      default:
        return null
    }
  }

  const getColors = () => {
    switch (status) {
      case 'pending':
        return 'bg-primary/10 border-primary/30'
      case 'success':
        return 'bg-primary/10 border-primary/30'
      case 'error':
        return 'bg-destructive/10 border-destructive/30'
      default:
        return 'bg-card border-border'
    }
  }

  return (
    <Card className={`p-4 flex items-start gap-3 ${getColors()}`}>
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {status === 'pending' && 'Processing...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Error'}
        </p>
        {message && <p className="text-xs text-muted-foreground mt-1">{message}</p>}
        {txHash && (
          <a
            href={`https://celoscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-2 inline-block"
          >
            View on Explorer →
          </a>
        )}
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          onDismiss?.()
        }}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition"
      >
        <X className="w-4 h-4" />
      </button>
    </Card>
  )
}
