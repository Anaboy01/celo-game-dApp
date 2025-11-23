// apps/web/src/lib/contract-helpers.ts
import { publicClient } from "@/lib/viem-client"
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI } from "./contract-config"
import type { Game, LeaderboardEntry, FriendLeaderboardEntry, GameTemplate, PlayerStatsView } from "./types/game"

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

export async function getPlayerScore(playerAddress: string): Promise<bigint | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "getPlayerScore",
      args: [playerAddress as `0x${string}`],
    })
    return result as bigint
  } catch (error) {
    console.error("[Contract] Error fetching player score:", error)
    return null
  }
}

export async function hasPlayerBoughtHint(playerAddress: string): Promise<boolean | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "hasPlayerBoughtHint" as "hasPlayerBoughtHint",
      args: [playerAddress as `0x${string}`],
    })
    return Boolean(result)
  } catch (error) {
    console.error("[Contract] Error checking hint purchase:", error)
    return null
  }
}

export async function playerHasActiveGame(playerAddress: string): Promise<boolean | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "playerHasActiveGame" as "playerHasActiveGame",
      args: [playerAddress as `0x${string}`],
    })
    return Boolean(result)
  } catch (error) {
    console.error("[Contract] Error checking active game:", error)
    return null
  }
}

export async function areFriends(player1: string, player2: string): Promise<boolean | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "areFriends",
      args: [player1 as `0x${string}`, player2 as `0x${string}`],
    })
    return result as boolean
  } catch (error) {
    console.error("[Contract] Error checking friendship:", error)
    return null
  }
}

export async function hasAchievement(
  playerAddress: string,
  achievement: number
): Promise<boolean | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "hasAchievement",
      args: [playerAddress as `0x${string}`, achievement],
    })
    return Boolean(result)
  } catch (error) {
    console.error("[Contract] Error checking achievement:", error)
    return null
  }
}

export async function calculateAnswerHash(answer: string): Promise<string | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "calculateAnswerHash",
      args: [answer],
    })
    return result as string
  } catch (error) {
    console.error("[Contract] Error calculating answer hash:", error)
    return null
  }
}

export async function getActiveGameTemplateCount(): Promise<bigint | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "getActiveGameTemplateCount",
    })
    return result as bigint
  } catch (error) {
    console.error("[Contract] Error fetching active template count:", error)
    return null
  }
}

export async function getGameTemplate(templateId: number): Promise<GameTemplate | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "gameTemplates",
      args: [BigInt(templateId)],
    })
    const [answerHash, baseRewardAmount, difficulty, isActive] = result as readonly [string, bigint, number, boolean]
    return {
      answerHash,
      baseRewardAmount,
      difficulty,
      isActive,
    } as GameTemplate
  } catch (error) {
    console.error("[Contract] Error fetching game template:", error)
    return null
  }
}

export async function getOwner(): Promise<string | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "owner",
    })
    return result as string
  } catch (error) {
    console.error("[Contract] Error fetching owner:", error)
    return null
  }
}

export async function getGameDuration(): Promise<bigint | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "gameDuration",
    })
    return result as bigint
  } catch (error) {
    console.error("[Contract] Error fetching game duration:", error)
    return null
  }
}

export async function getFriendCount(playerAddress: string): Promise<bigint | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "friendCount",
      args: [playerAddress as `0x${string}`],
    })
    return result as bigint
  } catch (error) {
    console.error("[Contract] Error fetching friend count:", error)
    return null
  }
}

export async function getMinRewardAmount(): Promise<bigint | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "minRewardAmount",
    })
    return result as bigint
  } catch (error) {
    console.error("[Contract] Error fetching min reward amount:", error)
    return null
  }
}

export async function getMaxRewardAmount(): Promise<bigint | null> {
  try {
    const result = await publicClient.readContract({
      address: getContractAddress(),
      abi: GAME_CONTRACT_ABI,
      functionName: "maxRewardAmount",
    })
    return result as bigint
  } catch (error) {
    console.error("[Contract] Error fetching max reward amount:", error)
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

export function getNewGameConfig() {
  return {
    ...CONTRACT_WRITE_CONFIG,
    functionName: "getNewGame",
  } as const
}

export function getDepositFundsConfig(amount: bigint) {
  return {
    ...CONTRACT_WRITE_CONFIG,
    functionName: "depositFunds",
    value: amount,
  } as const
}

export function getWithdrawFundsConfig(amount: bigint) {
  return {
    ...CONTRACT_WRITE_CONFIG,
    functionName: "withdrawFunds",
    args: [amount],
  } as const
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatCELO(wei: bigint | number | string): string {
  try {
    const num = typeof wei === "bigint" ? wei : BigInt(wei)
    const celo = Number(num) / 1e18
    return celo.toFixed(2)
  } catch {
    return "0.00"
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