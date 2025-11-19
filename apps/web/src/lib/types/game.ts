export enum Difficulty {
    Easy = 0,
    Medium = 1,
    Hard = 2,
  }
  
  export enum Achievement {
    FirstWin = 0,
    TenWins = 1,
    FiftyWins = 2,
    HundredWins = 3,
    PerfectStreak = 4,
    HintMaster = 5,
    SocialButterfly = 6,
  }
  

  export interface Game {
    gameId: bigint
    answerHash: string
    startTime: bigint
    endTime: bigint
    rewardAmount: bigint
    difficulty: Difficulty
    hintCost: bigint
    isActive: boolean
    totalSubmissions: bigint
    correctAnswers: bigint
  }
  

  export interface PlayerStatsView {
    totalGamesPlayed: bigint
    correctAnswers: bigint
    totalRewardsEarned: bigint
    lastPlayedTime: bigint
    hintsPurchased: bigint
    currentStreak: bigint
    bestStreak: bigint
  }
  

  export interface LeaderboardEntry {
    player: string
    score: bigint
  }
  
 
  export interface FriendLeaderboardEntry {
    player: string
    score: bigint
    isFriend: boolean
  }
  

  export interface GameTemplate {
    answerHash: string
    baseRewardAmount: bigint
    difficulty: Difficulty
    isActive: boolean
  }
  