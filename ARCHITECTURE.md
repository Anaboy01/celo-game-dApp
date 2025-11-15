# 4 Pictures 1 Word Game - Architecture

## Overview

A decentralized guessing game where players see 4 pictures and guess the common word. Built on Celo blockchain with token rewards and leaderboards.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Game UI      │  │ Wallet Conn  │  │ Leaderboard  │      │
│  │ - 4 Images   │  │ - RainbowKit │  │ - Rankings   │      │
│  │ - Guess Input│  │ - Wagmi      │  │ - Stats      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Web3 Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Smart Contracts (Solidity)                │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ GameContract │  │ TokenReward   │                        │
│  │ - Submit     │  │ - ERC20/CELO  │                        │
│  │ - Verify     │  │ - Distribute  │                        │
│  │ - Leaderboard│  │               │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ IPFS Hashes
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Decentralized Storage (IPFS/Pinata)        │
│  ┌──────────────┐                                           │
│  │ Images &     │                                           │
│  │ Metadata     │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Smart Contracts Layer

#### `GameContract.sol`

**Purpose**: Core game logic and state management

**Key Functions**:

- `startGame(uint256 gameId)`: Initialize a new game round
- `submitGuess(uint256 gameId, string guess)`: Submit player's guess
- `verifyAnswer(uint256 gameId, address player)`: Verify if guess is correct
- `getCurrentGame()`: Get active game details
- `getPlayerStats(address player)`: Get player statistics

**State Variables**:

- `mapping(uint256 => Game) games`: Game rounds
- `mapping(address => PlayerStats) playerStats`: Player data
- `uint256 currentGameId`: Active game identifier
- `uint256 gameStartTime`: When current game started
- `uint256 gameDuration`: Time limit per game

**Events**:

- `GameStarted(uint256 gameId, uint256 startTime)`
- `GuessSubmitted(address player, uint256 gameId, string guess)`
- `AnswerCorrect(address player, uint256 gameId, uint256 reward)`
- `AnswerIncorrect(address player, uint256 gameId)`

**Note**: Leaderboard functionality can be integrated into `GameContract.sol` or kept separate for modularity.

### 2. Frontend Layer

#### Game Components

- **`GameBoard.tsx`**: Main game interface (4-image grid, guess input, timer, submit button)
- **`ImageGrid.tsx`**: Image display component (fetch from IPFS, loading states, responsive layout)
- **`GuessInput.tsx`**: Guess submission (text input with validation, submit handler, loading states)
- **`GameTimer.tsx`**: Countdown timer (remaining time display, visual countdown, auto-submit on timeout)

#### Leaderboard Components

- **`Leaderboard.tsx`**: Rankings display (top players, stats, historical data)
- **`PlayerStats.tsx`**: Individual player statistics (games played, correct answers, rewards earned, rank)

#### Wallet & Transaction Components

- **`WalletProvider.tsx`**: Already exists, handles wallet connection
- **`TransactionStatus.tsx`**: Show transaction progress (pending, success/error states)

### 3. Data Storage Strategy

**On-Chain (Smart Contracts)**: Game rounds metadata, player scores/stats, answer verification (hashed), leaderboard rankings

**Off-Chain (IPFS/Pinata)**: Images and game metadata stored as JSON:

```json
{
  "gameId": 1,
  "images": [
    "ipfs://QmHash1",
    "ipfs://QmHash2",
    "ipfs://QmHash3",
    "ipfs://QmHash4"
  ],
  "answer": "word",
  "hint": "optional hint",
  "difficulty": "easy|medium|hard"
}
```

**Frontend State**: Current game state, player's guess, transaction status, cached leaderboard data

## Game Flow

### 1. Game Initialization

```
User connects wallet →
Frontend fetches current game from contract →
If no active game, admin/contract starts new game →
Frontend fetches game metadata from IPFS →
Display 4 images to user
```

### 2. Gameplay

```
User views 4 images →
User types guess →
User clicks submit →
Frontend calls contract.submitGuess() →
Contract verifies answer (on-chain or off-chain) →
If correct: distribute reward, update score →
Emit events →
Frontend updates UI with result
```

### 3. Answer Verification Options

**Hybrid**

- Store answer hash in contract
- Frontend can verify for instant feedback
- Contract verifies for rewards (prevents cheating)

## Technical Stack

### Smart Contracts

- **Solidity**: ^0.8.28
- **Hardhat**: Development framework
- **OpenZeppelin**: Security libraries

### Frontend

- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Wagmi + RainbowKit**: Wallet connection
- **Viem**: Ethereum library
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components

### Storage

- **IPFS/Pinata**: Image and metadata storage (see Data Storage Strategy above)
- **IPFS SDK**: `ipfs-http-client` or `pinata-sdk`

### Additional Libraries

- **React Query**: Data fetching and caching
- **Zustand/Jotai**: State management (if needed)

## Security Considerations

1. **Answer Verification**: Use hashing to prevent front-running
2. **Rate Limiting**: Prevent spam submissions
3. **Access Control**: Admin functions properly protected
4. **Input Validation**: Sanitize user inputs
5. **Gas Optimization**: Batch operations where possible
6. **Reentrancy Guards**: Protect reward distribution

## Cost Optimization

1. **Batch Operations**: Group multiple updates
2. **Event Logs**: Use events instead of storage for historical data
3. **IPFS Storage**: Keep images off-chain
4. **Lazy Loading**: Only load active game data
5. **Caching**: Cache leaderboard and stats

## Deployment Strategy

### Development

- Local Hardhat network
- Local IPFS node or test storage account

### Testnet

- Celo Alfajores testnet
- Test CELO faucet

### Mainnet

- Celo mainnet
- Verified contracts
- Monitoring and analytics

## File Structure

```
apps/
├── contracts/
│   ├── contracts/
│   │   ├── GameContract.sol
│   │   └── TokenReward.sol (optional)
│   ├── test/
│   │   └── GameContract.test.ts
│   └── scripts/
│       └── deploy.ts
└── web/
    └── src/
        ├── app/
        │   ├── game/page.tsx
        │   ├── leaderboard/page.tsx
        │   └── profile/page.tsx
        ├── components/
        │   ├── game/
        │   │   ├── GameBoard.tsx
        │   │   ├── ImageGrid.tsx
        │   │   ├── GuessInput.tsx
        │   │   └── GameTimer.tsx
        │   ├── leaderboard/
        │   │   ├── Leaderboard.tsx
        │   │   └── PlayerStats.tsx
        │   └── ...
        ├── lib/
        │   ├── contracts.ts
        │   ├── ipfs.ts
        │   └── game-utils.ts
        └── hooks/
            ├── useGame.ts
            ├── useLeaderboard.ts
            └── useSubmitGuess.ts
```

## Next Steps

1. ✅ Architecture planning (this document)
2. ⬜ Design smart contract interfaces
3. ⬜ Implement GameContract.sol
4. ⬜ Set up IPFS/Pinata integration
5. ⬜ Build frontend game components
6. ⬜ Implement wallet integration
7. ⬜ Add leaderboard functionality
8. ⬜ Testing (unit + integration)
9. ⬜ Deploy to testnet
10. ⬜ UI/UX polish
11. ⬜ Mainnet deployment
