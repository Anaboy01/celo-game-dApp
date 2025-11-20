// Validation utilities for user inputs

export function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  
  export function isValidAnswer(answer: string): boolean {
    return answer.length > 0 && answer.length <= 100 && /^[a-zA-Z\s'-]+$/.test(answer)
  }
  
  export function normalizeAnswer(answer: string): string {
    return answer.toLowerCase().trim().replace(/\s+/g, ' ')
  }
  
  export function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  export function truncateAddress(address: string, chars = 4): string {
    if (!isValidAddress(address)) return address
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
  }
  