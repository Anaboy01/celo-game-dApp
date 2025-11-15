# Frontend Implementation Plan

## Overview
This document outlines the steps to build the UI that replicates all GameContract functions for the 4 Pictures 1 Word game on Celo.

---

## Phase 1: Setup & Infrastructure

### 1.1 Install Dependencies
```bash
cd apps/web
pnpm add viem @tanstack/react-query
pnpm add -D @types/node
```

### 1.2 Contract Integration Setup
- [ ] Create `apps/web/src/lib/contracts.ts`
  - [ ] Export contract ABI (from compiled contract)
  - [ ] Export contract address (from deployment)
  - [ ] Create contract read/write functions using Viem
  - [ ] Export contract instance helper

### 1.3 IPFS Integration Setup
- [ ] Install IPFS client: `pnpm add ipfs-http-client` or `pnpm add @pinata/sdk`
- [ ] Create `apps/web/src/lib/ipfs.ts`
  - [ ] Setup IPFS client/Pinata SDK
  - [ ] Create `uploadToIPFS()` function
  - [ ] Create `fetchFromIPFS()` function
  - [ ] Create `getGameMetadata()` function (fetches images + metadata)

### 1.4 Environment Variables
- [ ] Add to `.env.local`:
  ```
  NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed_contract_address>
  NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
  PINATA_API_KEY=<your_pinata_key>
  PINATA_SECRET_KEY=<your_pinata_secret>
  ```

### 1.5 Type Definitions
- [ ] Create `apps/web/src/types/game.ts`
  - [ ] Define TypeScript types matching contract structs:
    - `Game`, `PlayerStats`, `LeaderboardEntry`, `FriendLeaderboardEntry`
    - `Difficulty` enum
    - `Achievement` enum
  - [ ] Define IPFS metadata type:
    ```typescript
    interface GameMetadata {
      gameId: number;
      images: string[]; // IPFS URLs
      answer: string;
      hint?: string;
      difficulty: "Easy" | "Medium" | "Hard";
    }
    ```

---

## Phase 2: Core Game Components

### 2.1 Game Board Component
**File**: `apps/web/src/components/game/GameBoard.tsx`

- [ ] Create main game container
- [ ] Integrate `ImageGrid` component
- [ ] Integrate `GuessInput` component
- [ ] Integrate `GameTimer` component
- [ ] Add "Buy Hint" button
- [ ] Add "Play Again" button (shown after completion)
- [ ] Handle game state:
  - [ ] Loading state (fetching game)
  - [ ] Active game state
  - [ ] Completed game state
  - [ ] Error states

**Functions to integrate**:
- `getCurrentGame()` - Fetch player's current game
- `submitGuess(string)` - Submit player's guess
- `buyHint()` - Purchase hint (with value)
- `getNewGame()` - Start new game after completion

### 2.2 Image Grid Component
**File**: `apps/web/src/components/game/ImageGrid.tsx`

- [ ] Create 2x2 grid layout for 4 images
- [ ] Fetch images from IPFS using game template ID
- [ ] Display loading skeletons
- [ ] Handle image load errors
- [ ] Add responsive design (mobile/desktop)

**Functions to integrate**:
- `getPlayerGameTemplateId()` - Get template ID from current game
- `fetchFromIPFS()` - Fetch images from IPFS

### 2.3 Guess Input Component
**File**: `apps/web/src/components/game/GuessInput.tsx`

- [ ] Create text input field
- [ ] Add submit button
- [ ] Show loading state during transaction
- [ ] Show success/error feedback
- [ ] Auto-focus on mount
- [ ] Handle Enter key submission

**Functions to integrate**:
- `submitGuess(string)` - Submit guess with transaction

### 2.4 Game Timer Component
**File**: `apps/web/src/components/game/GameTimer.tsx`

- [ ] Calculate remaining time from `endTime - currentTime`
- [ ] Display countdown (MM:SS format)
- [ ] Update every second
- [ ] Show warning when < 1 minute remaining
- [ ] Show expired state when time runs out
- [ ] Auto-disable input when expired

**Data source**:
- `getCurrentGame()` - Get `endTime` from game struct

### 2.5 Hint Component
**File**: `apps/web/src/components/game/HintButton.tsx`

- [ ] Show hint cost (from game.hintCost)
- [ ] Display "Buy Hint" button
- [ ] Show purchased state if `hasPlayerBoughtHint()`
- [ ] Handle payment transaction
- [ ] Display hint text after purchase (from IPFS metadata)

**Functions to integrate**:
- `buyHint()` - Purchase hint (with value = hintCost)
- `hasPlayerBoughtHint(address)` - Check if hint purchased
- `fetchFromIPFS()` - Fetch hint text

---

## Phase 3: Game State Management

### 3.1 React Hooks for Contract Interaction
**File**: `apps/web/src/hooks/useGame.ts`

- [ ] Create `useGame()` hook
  - [ ] Fetch current game using `getCurrentGame()`
  - [ ] Auto-refresh game state
  - [ ] Handle game auto-start on first interaction
  - [ ] Return: `{ game, isLoading, error, refetch }`

**File**: `apps/web/src/hooks/useSubmitGuess.ts`

- [ ] Create `useSubmitGuess()` hook
  - [ ] Handle `submitGuess()` transaction
  - [ ] Show transaction status (pending, success, error)
  - [ ] Auto-refetch game after success
  - [ ] Return: `{ submitGuess, isLoading, error }`

**File**: `apps/web/src/hooks/useBuyHint.ts`

- [ ] Create `useBuyHint()` hook
  - [ ] Handle `buyHint()` transaction with value
  - [ ] Show transaction status
  - [ ] Return: `{ buyHint, isLoading, error }`

**File**: `apps/web/src/hooks/useNewGame.ts`

- [ ] Create `useNewGame()` hook
  - [ ] Handle `getNewGame()` transaction
  - [ ] Refresh game state after success
  - [ ] Return: `{ getNewGame, isLoading, error }`

### 3.2 Game Metadata Hook
**File**: `apps/web/src/hooks/useGameMetadata.ts`

- [ ] Create `useGameMetadata()` hook
  - [ ] Fetch game template ID from current game
  - [ ] Fetch metadata from IPFS using template ID
  - [ ] Cache metadata
  - [ ] Return: `{ metadata, images, hint, isLoading, error }`

---

## Phase 4: Player Stats & Profile

### 4.1 Player Stats Component
**File**: `apps/web/src/components/profile/PlayerStats.tsx`

- [ ] Display player statistics:
  - [ ] Total games played
  - [ ] Correct answers
  - [ ] Total rewards earned (in CELO)
  - [ ] Current streak
  - [ ] Best streak
  - [ ] Hints purchased

**Functions to integrate**:
- `getPlayerStats(address)` - Fetch player stats

### 4.2 Achievements Component
**File**: `apps/web/src/components/profile/Achievements.tsx`

- [ ] Display achievement badges:
  - [ ] FirstWin
  - [ ] TenWins
  - [ ] FiftyWins
  - [ ] HundredWins
  - [ ] PerfectStreak
  - [ ] HintMaster
  - [ ] SocialButterfly
- [ ] Show locked/unlocked states
- [ ] Add achievement icons/animations

**Functions to integrate**:
- `getPlayerAchievements(address)` - Get all achievements
- `hasAchievement(address, Achievement)` - Check specific achievement

### 4.3 Profile Page
**File**: `apps/web/src/app/profile/page.tsx`

- [ ] Create profile page layout
- [ ] Integrate `PlayerStats` component
- [ ] Integrate `Achievements` component
- [ ] Add player address display
- [ ] Add wallet balance display

---

## Phase 5: Leaderboard

### 5.1 Leaderboard Component
**File**: `apps/web/src/components/leaderboard/Leaderboard.tsx`

- [ ] Display top N players
- [ ] Show rank, address, score
- [ ] Add pagination (if needed)
- [ ] Highlight current player
- [ ] Show loading state

**Functions to integrate**:
- `getTopPlayers(uint256)` - Get top N players
- `getPlayerScore(address)` - Get player's score

### 5.2 Friend Leaderboard Component
**File**: `apps/web/src/components/leaderboard/FriendLeaderboard.tsx`

- [ ] Display leaderboard with friend indicators
- [ ] Highlight friends in the list
- [ ] Show friend badge/icon

**Functions to integrate**:
- `getFriendLeaderboard(address, uint256)` - Get friend leaderboard

### 5.3 Leaderboard Page
**File**: `apps/web/src/app/leaderboard/page.tsx`

- [ ] Create leaderboard page
- [ ] Toggle between global and friend leaderboard
- [ ] Integrate both leaderboard components

---

## Phase 6: Social Features

### 6.1 Friends Component
**File**: `apps/web/src/components/social/FriendsList.tsx`

- [ ] Display list of friends
- [ ] Show friend addresses
- [ ] Add "Remove Friend" button
- [ ] Show friend count

**Functions to integrate**:
- `getFriends(address)` - Get friends list
- `removeFriend(address)` - Remove friend

### 6.2 Add Friend Component
**File**: `apps/web/src/components/social/AddFriend.tsx`

- [ ] Create input field for friend address
- [ ] Add "Add Friend" button
- [ ] Validate address format
- [ ] Show success/error feedback
- [ ] Prevent adding self

**Functions to integrate**:
- `addFriend(address)` - Add friend

### 6.3 Social Page
**File**: `apps/web/src/app/social/page.tsx`

- [ ] Create social page layout
- [ ] Integrate `FriendsList` component
- [ ] Integrate `AddFriend` component
- [ ] Show friend count and max friends limit

---

## Phase 7: Admin Features (Owner Only)

### 7.1 Admin Dashboard
**File**: `apps/web/src/app/admin/page.tsx`

- [ ] Check if user is contract owner
- [ ] Show admin-only UI
- [ ] Display contract balance
- [ ] Show active game templates count

**Functions to integrate**:
- `owner()` - Check if user is owner
- `getContractBalance()` - Get contract balance
- `getActiveGameTemplateCount()` - Get template count

### 7.2 Add Game Template Component
**File**: `apps/web/src/components/admin/AddGameTemplate.tsx`

- [ ] Create form with fields:
  - [ ] Upload 4 images
  - [ ] Enter answer word
  - [ ] Enter hint (optional)
  - [ ] Select difficulty
  - [ ] Enter base reward amount
- [ ] Upload images to IPFS
- [ ] Create metadata JSON
- [ ] Upload metadata to IPFS
- [ ] Calculate answer hash (use `calculateAnswerHash()`)
- [ ] Submit template to contract

**Functions to integrate**:
- `uploadToIPFS()` - Upload images and metadata
- `calculateAnswerHash(string)` - Calculate hash
- `addGameTemplate(bytes32, uint256, Difficulty)` - Add template

### 7.3 Manage Templates Component
**File**: `apps/web/src/components/admin/ManageTemplates.tsx`

- [ ] List all game templates
- [ ] Show template details (difficulty, reward, active status)
- [ ] Add "Deactivate" button for active templates
- [ ] Show template count

**Functions to integrate**:
- `gameTemplates(uint256)` - Get template details
- `nextGameTemplateId()` - Get total templates
- `deactivateGameTemplate(uint256)` - Deactivate template

### 7.4 Funds Management Component
**File**: `apps/web/src/components/admin/FundsManagement.tsx`

- [ ] Display contract balance
- [ ] Add "Deposit Funds" button
- [ ] Add "Withdraw Funds" form (amount input)
- [ ] Show transaction status

**Functions to integrate**:
- `depositFunds()` - Deposit (with value)
- `withdrawFunds(uint256)` - Withdraw funds

### 7.5 Settings Component
**File**: `apps/web/src/components/admin/Settings.tsx`

- [ ] Update game duration
- [ ] Update reward limits
- [ ] Update difficulty multipliers
- [ ] Update hint costs

**Functions to integrate**:
- `setGameDuration(uint256)`
- `setRewardLimits(uint256, uint256)`
- `setDifficultyMultiplier(Difficulty, uint256)`
- `setHintCost(Difficulty, uint256)`

---

## Phase 8: Main Game Page

### 8.1 Game Page
**File**: `apps/web/src/app/game/page.tsx`

- [ ] Create main game page layout
- [ ] Integrate `GameBoard` component
- [ ] Add navigation to other pages
- [ ] Show wallet connection requirement
- [ ] Handle disconnected state

### 8.2 Home Page Updates
**File**: `apps/web/src/app/page.tsx`

- [ ] Update home page to redirect to game or show CTA
- [ ] Add "Play Now" button
- [ ] Show game stats preview
- [ ] Add link to leaderboard

---

## Phase 9: Event Listeners & Real-time Updates

### 9.1 Event Listeners
**File**: `apps/web/src/hooks/useGameEvents.ts`

- [ ] Listen to contract events:
  - [ ] `GameStarted` - Refresh game state
  - [ ] `GuessSubmitted` - Update UI
  - [ ] `AnswerCorrect` - Show success, update stats
  - [ ] `AnswerIncorrect` - Show error message
  - [ ] `GameCompleted` - Show completion screen
  - [ ] `HintPurchased` - Update hint state
  - [ ] `AchievementUnlocked` - Show achievement notification
  - [ ] `FriendAdded` - Refresh friends list

### 9.2 Real-time Updates
- [ ] Use React Query for automatic refetching
- [ ] Poll game state every 5 seconds (if active)
- [ ] Update timer in real-time
- [ ] Refresh leaderboard periodically

---

## Phase 10: UI/UX Enhancements

### 10.1 Transaction Status Component
**File**: `apps/web/src/components/ui/TransactionStatus.tsx`

- [ ] Show transaction pending state
- [ ] Show transaction success with link to explorer
- [ ] Show transaction error with message
- [ ] Auto-dismiss after success

### 10.2 Loading States
- [ ] Add loading skeletons for all async operations
- [ ] Show loading spinners during transactions
- [ ] Disable buttons during transactions

### 10.3 Error Handling
- [ ] Create error boundary component
- [ ] Show user-friendly error messages
- [ ] Handle network errors
- [ ] Handle contract revert reasons

### 10.4 Success Animations
- [ ] Add confetti animation on correct answer
- [ ] Add achievement unlock animation
- [ ] Add reward received animation

### 10.5 Responsive Design
- [ ] Mobile-first approach
- [ ] Tablet layout optimization
- [ ] Desktop layout enhancement

---

## Phase 11: Utility Functions

### 11.1 Formatting Utilities
**File**: `apps/web/src/lib/format.ts`

- [ ] `formatAddress(address)` - Shorten address (0x1234...5678)
- [ ] `formatCELO(wei)` - Convert wei to CELO string
- [ ] `formatTime(seconds)` - Format countdown timer
- [ ] `formatDate(timestamp)` - Format last played time

### 11.2 Validation Utilities
**File**: `apps/web/src/lib/validation.ts`

- [ ] `isValidAddress(address)` - Validate Ethereum address
- [ ] `isValidAnswer(answer)` - Validate answer format
- [ ] `normalizeAnswer(answer)` - Normalize for comparison

### 11.3 Contract Helpers
**File**: `apps/web/src/lib/contract-helpers.ts`

- [ ] `getContract()` - Get contract instance
- [ ] `readContract(functionName, args)` - Read contract state
- [ ] `writeContract(functionName, args, value?)` - Write contract
- [ ] `waitForTransaction(hash)` - Wait for transaction confirmation

---

## Phase 12: Testing & Polish

### 12.1 Integration Testing
- [ ] Test game flow end-to-end
- [ ] Test hint purchase flow
- [ ] Test friend management
- [ ] Test leaderboard updates
- [ ] Test admin functions

### 12.2 Error Scenarios
- [ ] Test with no active games in pool
- [ ] Test with expired game
- [ ] Test with insufficient balance
- [ ] Test with invalid inputs

### 12.3 Performance Optimization
- [ ] Optimize image loading
- [ ] Cache IPFS metadata
- [ ] Debounce contract reads
- [ ] Lazy load components

### 12.4 Final Polish
- [ ] Add loading animations
- [ ] Add hover effects
- [ ] Add transitions
- [ ] Add sound effects (optional)
- [ ] Add toast notifications

---

## Implementation Order

### Sprint 1: Foundation
1. Setup contract integration
2. Setup IPFS integration
3. Create type definitions
4. Create utility functions

### Sprint 2: Core Game
1. Game Board component
2. Image Grid component
3. Guess Input component
4. Game Timer component
5. Basic game flow

### Sprint 3: Game Features
1. Hint system
2. Game state management hooks
3. Event listeners
4. Transaction handling

### Sprint 4: Stats & Profile
1. Player stats component
2. Achievements component
3. Profile page

### Sprint 5: Social & Leaderboard
1. Friends management
2. Leaderboard components
3. Social page

### Sprint 6: Admin
1. Admin dashboard
2. Add game template
3. Manage templates
4. Funds management

### Sprint 7: Polish
1. Error handling
2. Loading states
3. Animations
4. Responsive design
5. Testing

---

## Key Contract Functions Reference

### Player Functions
- `startPlayerGame()` - Start a new game
- `submitGuess(string)` - Submit guess
- `buyHint()` - Buy hint (payable)
- `getNewGame()` - Get new game after completion
- `getCurrentGame()` - Get current game
- `getPlayerStats(address)` - Get player stats
- `getPlayerScore(address)` - Get player score
- `getPlayerAchievements(address)` - Get achievements
- `hasPlayerBoughtHint(address)` - Check hint purchase

### Social Functions
- `addFriend(address)` - Add friend
- `removeFriend(address)` - Remove friend
- `getFriends(address)` - Get friends list
- `areFriends(address, address)` - Check friendship
- `getFriendLeaderboard(address, uint256)` - Get friend leaderboard

### Leaderboard Functions
- `getTopPlayers(uint256)` - Get top players
- `playerScores(address)` - Get player score

### Admin Functions
- `addGameTemplate(bytes32, uint256, Difficulty)` - Add template
- `deactivateGameTemplate(uint256)` - Deactivate template
- `depositFunds()` - Deposit (payable)
- `withdrawFunds(uint256)` - Withdraw funds
- `setGameDuration(uint256)` - Set duration
- `setRewardLimits(uint256, uint256)` - Set limits
- `setDifficultyMultiplier(Difficulty, uint256)` - Set multiplier
- `setHintCost(Difficulty, uint256)` - Set hint cost

### Utility Functions
- `calculateAnswerHash(string)` - Calculate hash
- `getContractBalance()` - Get balance
- `getActiveGameTemplateCount()` - Get template count
- `gameTemplates(uint256)` - Get template details
- `difficultyMultipliers(Difficulty)` - Get multiplier
- `hintCosts(Difficulty)` - Get hint cost

---

## Notes

- All contract interactions should use Viem for type safety
- Use React Query for data fetching and caching
- Handle all transaction states (pending, success, error)
- Show user-friendly error messages
- Cache IPFS data to reduce requests
- Use optimistic updates where appropriate
- Implement proper loading states
- Add proper error boundaries

