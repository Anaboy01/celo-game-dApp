'use client'

import { useAccount } from 'wagmi'
import { getOwner } from '@/lib/contract-helpers'
import useSWR from 'swr'

export function useIsOwner() {
  const { address, isConnected } = useAccount()
  
  const { data: isOwner, isLoading } = useSWR(
    isConnected && address ? ['isOwner', address] : null,
    async () => {
      if (!address) return false
      const ownerAddress = await getOwner()
      return ownerAddress?.toLowerCase() === address.toLowerCase()
    },
    { 
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  )

  return {
    isOwner: isOwner || false,
    isLoading,
  }
}

