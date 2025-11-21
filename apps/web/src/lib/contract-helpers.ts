import { publicClient, walletClient } from "@/lib/viem-client"
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI } from "./contract-config"
import type { Game, LeaderboardEntry, FriendLeaderboardEntry, GameTemplate } from "./types/game"

// Read functions (public client)
export async function getCurrentGame(): Promise<Game | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getCurrentGame",
    })
    return result as Game
  } catch (error) {
    console.error("[v0] Error fetching current game:", error)
    return null
  }
}

export async function getPlayerGame(playerAddress: string): Promise<Game | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getPlayerGame",
      args: [playerAddress as `0x${string}`],
    })
    return result as Game
  } catch (error) {
    console.error("[v0] Error fetching player game:", error)
    return null
  }
}

export async function getPlayerScore(playerAddress: string): Promise<bigint | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getPlayerScore",
      args: [playerAddress as `0x${string}`],
    })
    return result as bigint
  } catch (error) {
    console.error("[v0] Error fetching player score:", error)
    return null
  }
}

export async function getGlobalLeaderboard(count: number): Promise<LeaderboardEntry[] | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getGlobalLeaderboard",
      args: [BigInt(count)],
    })
    return result as LeaderboardEntry[]
  } catch (error) {
    console.error("[v0] Error fetching global leaderboard:", error)
    return null
  }
}

export async function getFriendLeaderboard(
  playerAddress: string,
  count: number,
): Promise<FriendLeaderboardEntry[] | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getFriendLeaderboard",
      args: [playerAddress as `0x${string}`, BigInt(count)],
    })
    return result as FriendLeaderboardEntry[]
  } catch (error) {
    console.error("[v0] Error fetching friend leaderboard:", error)
    return null
  }
}

export async function getPlayerAchievements(playerAddress: string): Promise<boolean[] | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getPlayerAchievements",
      args: [playerAddress as `0x${string}`],
    })
    return result as boolean[]
  } catch (error) {
    console.error("[v0] Error fetching achievements:", error)
    return null
  }
}

export async function getFriends(playerAddress: string): Promise<string[] | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getFriends",
      args: [playerAddress as `0x${string}`],
    })
    return result as string[]
  } catch (error) {
    console.error("[v0] Error fetching friends:", error)
    return null
  }
}

export async function calculateAnswerHash(answer: string): Promise<string | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "calculateAnswerHash",
      args: [answer],
    })
    return result as string
  } catch (error) {
    console.error("[v0] Error calculating answer hash:", error)
    return null
  }
}

export async function areFriends(player1: string, player2: string): Promise<boolean | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "areFriends",
      args: [player1 as `0x${string}`, player2 as `0x${string}`],
    })
    return result as boolean
  } catch (error) {
    console.error("[v0] Error checking friend status:", error)
    return null
  }
}

export async function getGameTemplate(templateId: number): Promise<GameTemplate | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getGameTemplate",
      args: [BigInt(templateId)],
    })
    return result as GameTemplate
  } catch (error) {
    console.error("[v0] Error fetching game template:", error)
    return null
  }
}

export async function getContractBalance(): Promise<bigint | null> {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getContractBalance",
    })
    return result as bigint
  } catch (error) {
    console.error("[v0] Error fetching contract balance:", error)
    return null
  }
}

// Utility functions
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatCELO(wei: bigint | number): string {
  const num = typeof wei === "bigint" ? wei : BigInt(wei)
  const celo = Number(num) / 1e18
  return celo.toFixed(4)
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// New read functions
export async function getPlayerStats(playerAddress: string) {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getPlayerStats",
      args: [playerAddress as `0x${string}`],
    })
    return result
  } catch (error) {
    console.error("[v0] Error fetching player stats:", error)
    return null
  }
}

export async function getTopPlayers(count: number) {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getTopPlayers",
      args: [BigInt(count)],
    })
    return result
  } catch (error) {
    console.error("[v0] Error fetching top players:", error)
    return null
  }
}

export async function hasAchievement(playerAddress: string, achievement: number) {
  try {
    const result = await publicClient.readContract({
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "hasAchievement",
      args: [playerAddress as `0x${string}`, achievement],
    })
    return result
  } catch (error) {
    console.error("[v0] Error checking achievement:", error)
    return null
  }
}

// Write functions (wallet client)
export async function getNewGame(account: `0x${string}`): Promise<`0x${string}` | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "getNewGame",
    })
    return hash
  } catch (error) {
    console.error("[v0] Error getting new game:", error)
    throw error
  }
}

export async function submitGuess(account: `0x${string}`, answer: string): Promise<`0x${string}` | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "submitGuess",
      args: [answer],
    })
    return hash
  } catch (error) {
    console.error("[v0] Error submitting guess:", error)
    throw error
  }
}

export async function buyHint(account: `0x${string}`, hintCost: bigint): Promise<`0x${string}` | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "buyHint",
      value: hintCost,
    })
    return hash
  } catch (error) {
    console.error("[v0] Error buying hint:", error)
    throw error
  }
}

export async function addFriend(account: `0x${string}`, friendAddress: string): Promise<`0x${string}` | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "addFriend",
      args: [friendAddress as `0x${string}`],
    })
    return hash
  } catch (error) {
    console.error("[v0] Error adding friend:", error)
    throw error
  }
}

export async function removeFriend(account: `0x${string}`, friendAddress: string): Promise<`0x${string}` | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "removeFriend",
      args: [friendAddress as `0x${string}`],
    })
    return hash
  } catch (error) {
    console.error("[v0] Error removing friend:", error)
    throw error
  }
}

export async function addGameTemplate(
  account: `0x${string}`,
  answerHash: string,
  baseRewardAmount: bigint,
  difficulty: number,
): Promise<`0x${string}` | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "addGameTemplate",
      args: [answerHash as `0x${string}`, baseRewardAmount, difficulty],
    })
    return hash
  } catch (error) {
    console.error("[v0] Error adding game template:", error)
    throw error
  }
}

export async function deactivateGameTemplate(
  account: `0x${string}`,
  templateId: number,
): Promise<`0x${string}` | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "deactivateGameTemplate",
      args: [BigInt(templateId)],
    })
    return hash
  } catch (error) {
    console.error("[v0] Error deactivating game template:", error)
    throw error
  }
}

export async function depositFunds(account: `0x${string}`, amount: bigint): Promise<`0x${string}` | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "depositFunds",
      value: amount,
    })
    return hash
  } catch (error) {
    console.error("[v0] Error depositing funds:", error)
    throw error
  }
}

export async function withdrawFunds(account: `0x${string}`, amount: bigint): Promise<`0x${string}` | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "withdrawFunds",
      args: [amount],
    })
    return hash
  } catch (error) {
    console.error("[v0] Error withdrawing funds:", error)
    throw error
  }
}

export async function startPlayerGame(account: `0x${string}`): Promise<`0x${string}` | null> {
  try {
    const hash = await walletClient.writeContract({
      account,
      address: GAME_CONTRACT_ADDRESS as `0x${string}`,
      abi: GAME_CONTRACT_ABI,
      functionName: "startPlayerGame",
    })
    return hash
  } catch (error) {
    console.error("[v0] Error starting player game:", error)
    throw error
  }
}
