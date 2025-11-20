import { publicClient, walletClient } from '@/lib/viem-client'
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI } from './contract-config'
import type {
  Game,
  PlayerStatsView,
  LeaderboardEntry,
  FriendLeaderboardEntry,
  Difficulty,
  Achievement,
} from './types/game'

// Read functions (public client)
export async function getCurrentGame(playerAddress: string): Promise<Game | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'getCurrentGame',
      account: playerAddress as `0x${string}`,
    })
    return result as Game
  } catch (error) {
    console.error('[v0] Error fetching current game:', error)
    return null
  }
}

export async function getPlayerStats(playerAddress: string): Promise<PlayerStatsView | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'getPlayerStats',
      args: [playerAddress as `0x${string}`],
    })
    return result as PlayerStatsView
  } catch (error) {
    console.error('[v0] Error fetching player stats:', error)
    return null
  }
}

export async function getPlayerScore(playerAddress: string): Promise<bigint | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'getPlayerScore',
      args: [playerAddress as `0x${string}`],
    })
    return result as bigint
  } catch (error) {
    console.error('[v0] Error fetching player score:', error)
    return null
  }
}

export async function getTopPlayers(count: number): Promise<LeaderboardEntry[] | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'getTopPlayers',
      args: [BigInt(count)],
    })
    return result as LeaderboardEntry[]
  } catch (error) {
    console.error('[v0] Error fetching top players:', error)
    return null
  }
}

export async function getFriendLeaderboard(
  playerAddress: string,
  count: number
): Promise<FriendLeaderboardEntry[] | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'getFriendLeaderboard',
      args: [playerAddress as `0x${string}`, BigInt(count)],
    })
    return result as FriendLeaderboardEntry[]
  } catch (error) {
    console.error('[v0] Error fetching friend leaderboard:', error)
    return null
  }
}

export async function getPlayerAchievements(playerAddress: string): Promise<boolean[] | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'getPlayerAchievements',
      args: [playerAddress as `0x${string}`],
    })
    return result as boolean[]
  } catch (error) {
    console.error('[v0] Error fetching achievements:', error)
    return null
  }
}

export async function hasAchievement(
  playerAddress: string,
  achievement: Achievement
): Promise<boolean | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'hasAchievement',
      args: [playerAddress as `0x${string}`, achievement],
    })
    return result as boolean
  } catch (error) {
    console.error('[v0] Error checking achievement:', error)
    return null
  }
}

export async function getFriends(playerAddress: string): Promise<string[] | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'getFriends',
      args: [playerAddress as `0x${string}`],
    })
    return result as string[]
  } catch (error) {
    console.error('[v0] Error fetching friends:', error)
    return null
  }
}

export async function calculateAnswerHash(answer: string): Promise<string | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'calculateAnswerHash',
      args: [answer],
    })
    return result as string
  } catch (error) {
    console.error('[v0] Error calculating answer hash:', error)
    return null
  }
}

export async function hasPlayerBoughtHint(playerAddress: string): Promise<boolean | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'hasPlayerBoughtHint',
      args: [playerAddress as `0x${string}`],
    })
    return result as boolean
  } catch (error) {
    console.error('[v0] Error checking hint purchase:', error)
    return null
  }
}

// Write functions (wallet client)
export async function startPlayerGame(account: `0x${string}`): Promise<string | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'startPlayerGame',
    })
    return hash
  } catch (error) {
    console.error('[v0] Error starting game:', error)
    throw error
  }
}

export async function submitGuess(account: `0x${string}`, guess: string): Promise<string | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'submitGuess',
      args: [guess],
    })
    return hash
  } catch (error) {
    console.error('[v0] Error submitting guess:', error)
    throw error
  }
}

export async function buyHint(
  account: `0x${string}`,
  hintCost: bigint
): Promise<string | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'buyHint',
      value: hintCost,
    })
    return hash
  } catch (error) {
    console.error('[v0] Error buying hint:', error)
    throw error
  }
}

export async function addFriend(
  account: `0x${string}`,
  friendAddress: string
): Promise<string | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'addFriend',
      args: [friendAddress as `0x${string}`],
    })
    return hash
  } catch (error) {
    console.error('[v0] Error adding friend:', error)
    throw error
  }
}

export async function removeFriend(
  account: `0x${string}`,
  friendAddress: string
): Promise<string | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'removeFriend',
      args: [friendAddress as `0x${string}`],
    })
    return hash
  } catch (error) {
    console.error('[v0] Error removing friend:', error)
    throw error
  }
}

export async function getNewGame(account: `0x${string}`): Promise<string | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'getNewGame',
    })
    return hash
  } catch (error) {
    console.error('[v0] Error getting new game:', error)
    throw error
  }
}

export async function depositFunds(
  account: `0x${string}`,
  amount: bigint
): Promise<string | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: 'depositFunds',
      value: amount,
    })
    return hash
  } catch (error) {
    console.error('[v0] Error depositing funds:', error)
    throw error
  }
}

// Utility functions
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatCELO(wei: bigint | number): string {
  const num = typeof wei === 'bigint' ? wei : BigInt(wei)
  const celo = Number(num) / 1e18
  return celo.toFixed(4)
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
