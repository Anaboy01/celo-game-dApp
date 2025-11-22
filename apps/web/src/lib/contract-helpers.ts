// apps/web/src/lib/contract-helpers.ts
import { publicClient } from "@/lib/viem-client"
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI } from "./contract-config"
import type { Game, LeaderboardEntry, FriendLeaderboardEntry, GameTemplate, PlayerStatsView } from "./types/game"
import { getWalletClient } from 'wagmi/actions'
import { config } from './wagmi-config' // We'll create this

// Helper to ensure contract address is valid
function getContractAddress(): `0x${string}` {
  if (!GAME_CONTRACT_ADDRESS || GAME_CONTRACT_ADDRESS === "") {
    throw new Error("Game contract address not configured. Set NEXT_PUBLIC_GAME_CONTRACT_ADDRESS in .env.local")
  }
  return GAME_CONTRACT_ADDRESS as `0x${string}`
}

// ============================================
// READ FUNCTIONS (Using Public Client)
// ============================================

export async function getCurrentGame(): Promise<Game | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "getCurrentGame",
    })
    return result as Game
  } catch (error) {
    console.error("[Contract] Error fetching current game:", error)
    return null
  }
}

export async function getPlayerGame(playerAddress: string): Promise<Game | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "getPlayerGame",
      args: [playerAddress as `0x${string}`],
    })
    return result as Game
  } catch (error) {
    console.error("[Contract] Error fetching player game:", error)
    return null
  }
}

export async function getPlayerStats(playerAddress: string): Promise<PlayerStatsView | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "getPlayerStats",
      args: [playerAddress as `0x${string}`],
    })
    return result as PlayerStatsView
  } catch (error) {
    console.error("[Contract] Error fetching player stats:", error)
    return null
  }
}

export async function getTopPlayers(count: number): Promise<LeaderboardEntry[] | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "getTopPlayers",
      args: [BigInt(count)],
    })
    return result as LeaderboardEntry[]
  } catch (error) {
    console.error("[Contract] Error fetching top players:", error)
    return null
  }
}

export async function getFriendLeaderboard(
  playerAddress: string,
  count: number,
): Promise<FriendLeaderboardEntry[] | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "getFriendLeaderboard",
      args: [playerAddress as `0x${string}`, BigInt(count)],
    })
    return result as FriendLeaderboardEntry[]
  } catch (error) {
    console.error("[Contract] Error fetching friend leaderboard:", error)
    return null
  }
}

export async function getPlayerAchievements(playerAddress: string): Promise<boolean[] | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "getPlayerAchievements",
      args: [playerAddress as `0x${string}`],
    })
    return result as boolean[]
  } catch (error) {
    console.error("[Contract] Error fetching achievements:", error)
    return null
  }
}

export async function getFriends(playerAddress: string): Promise<string[] | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "getFriends",
      args: [playerAddress as `0x${string}`],
    })
    return result as string[]
  } catch (error) {
    console.error("[Contract] Error fetching friends:", error)
    return null
  }
}

export async function getContractBalance(): Promise<bigint | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "getContractBalance",
    })
    return result as bigint
  } catch (error) {
    console.error("[Contract] Error fetching contract balance:", error)
    return null
  }
}

// ============================================
// WRITE FUNCTIONS (Using Wagmi's writeContract)
// ============================================
// These should be called from hooks that use wagmi's useWriteContract

export const CONTRACT_WRITE_CONFIG = {
  address: getContractAddress(),
  abi: GAME_CONTRACT_ABI,
}

// Helper to prepare write arguments
export function getStartGameConfig() {
  return {
    ...CONTRACT_WRITE_CONFIG,
    functionName: "startPlayerGame",
  } as const
}

export function getSubmitGuessConfig(answer: string) {
  return {
    ...CONTRACT_WRITE_CONFIG,
    functionName: "submitGuess",
    args: [answer.toLowerCase().trim()],
  } as const
}

export function getBuyHintConfig(hintCost: bigint) {
  return {
    ...CONTRACT_WRITE_CONFIG,
    functionName: "buyHint",
    value: hintCost,
  } as const
}

export function getAddFriendConfig(friendAddress: string) {
  return {
    ...CONTRACT_WRITE_CONFIG,
    functionName: "addFriend",
    args: [friendAddress as `0x${string}`],
  } as const
}

export function getRemoveFriendConfig(friendAddress: string) {
  return {
    ...CONTRACT_WRITE_CONFIG,
    functionName: "removeFriend",
    args: [friendAddress as `0x${string}`],
  } as const
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatCELO(wei: bigint | number | string): string {
  try {
    const num = typeof wei === "bigint" ? wei : BigInt(wei)
    const celo = Number(num) / 1e18
    return celo.toFixed(4)
  } catch {
    return "0.0000"
  }
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}