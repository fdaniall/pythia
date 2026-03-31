# Pythia — See the Future on Initia

**Binary prediction market platform deployed as its own Initia appchain (MiniEVM).** Bet on real-world outcomes, earn proportional payouts, and enjoy seamless UX with auto-signing — no wallet popups.

> *Named after the Oracle of Delphi, the most famous prediction oracle in ancient history.*

---

## What is Pythia?

Pythia lets users create and participate in binary (Yes/No) prediction markets powered by on-chain smart contracts. Think Polymarket, but on Initia — with cross-chain deposits, gasless betting sessions, and `.init` usernames.

**Core Flow:**
1. **Create** a market: *"Will BTC hit $100K by April 10?"*
2. **Bet** Yes or No with real tokens — odds shift dynamically based on pool ratios
3. **Resolve** — admin sets the actual outcome after the deadline
4. **Claim** — winners receive proportional payouts from the total pool (minus 2% platform fee)

---

## Key Features

| Feature | Description |
|---|---|
| **On-chain prediction markets** | Real bets, real payouts — no mock transactions or hardcoded odds |
| **Dynamic odds** | Payout ratio determined by pool distribution (Polymarket-style AMM) |
| **Auto-signing** | Enable a session and bet freely without wallet popups (Initia native) |
| **Cross-chain deposits** | Deposit from any chain via Interwoven Bridge |
| **`.init` usernames** | Leaderboard displays human-readable names instead of `0x...` addresses |
| **Platform fee** | 2% fee on payouts — own appchain means all revenue stays with the platform |
| **Reentrancy-safe** | OpenZeppelin ReentrancyGuard on all payout functions |

---

## Tech Stack

### Smart Contracts
- **Solidity 0.8.24** on MiniEVM (Initia's EVM-compatible rollup)
- **Foundry** — Forge (testing), Anvil (local node), Cast (interaction)
- **OpenZeppelin** — ReentrancyGuard, access control patterns

### Frontend
- **React 19** + **TypeScript 5.9**
- **Vite 8** — build tooling with HMR
- **Tailwind CSS 4** + **shadcn/ui** (base-nova theme)
- **Wagmi 2** + **Viem 2** — Ethereum/EVM hooks and client
- **InterwovenKit** (`@initia/interwovenkit-react`) — Initia wallet, auto-sign, bridge
- **TanStack Query 5** — server state management
- **React Router 7** — client-side routing

---

## Project Structure

```
pythia/
├── contracts/                  # Solidity smart contracts (Foundry)
│   ├── src/
│   │   └── PredictionMarket.sol    # Main contract
│   ├── test/
│   │   └── PredictionMarket.t.sol  # 35+ tests
│   ├── script/                     # Deployment scripts
│   ├── lib/                        # Dependencies (OZ, forge-std)
│   └── foundry.toml
│
├── frontend/                   # React/TypeScript app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui primitives
│   │   │   ├── Layout.tsx     # Header, nav, wallet connection
│   │   │   ├── MarketCard.tsx # Market preview card
│   │   │   └── PoolBar.tsx    # Yes/No pool visualization
│   │   ├── pages/
│   │   │   ├── MarketsPage.tsx       # Browse all markets
│   │   │   ├── MarketDetailPage.tsx  # Bet, view pool, claim
│   │   │   ├── CreateMarketPage.tsx  # Create new market
│   │   │   └── PortfolioPage.tsx     # Your bets & winnings
│   │   ├── lib/
│   │   │   ├── contract.ts    # ABI + contract address
│   │   │   └── utils.ts       # Tailwind utilities
│   │   ├── types/
│   │   │   └── market.ts      # Market & Bet interfaces
│   │   └── hooks/             # Custom React hooks
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Foundry** — [install here](https://book.getfoundry.sh/getting-started/installation)
- **Git**

### Smart Contracts

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
forge install

# Build
forge build

# Run tests
forge test

# Run tests with verbose output
forge test -vvv

# Start local node
anvil

# Deploy (replace with your RPC and key)
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

### Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Environment Setup

After deploying the contract, update the contract address in `frontend/src/lib/contract.ts`:

```typescript
export const PREDICTION_MARKET_ADDRESS = "0xYourDeployedAddress";
```

---

## Smart Contract Architecture

### PredictionMarket.sol

**Data Structures:**

```solidity
struct Market {
    string question;       // "Will BTC hit $100K by April 10?"
    uint256 deadline;      // Unix timestamp — betting closes after this
    uint256 totalYesPool;  // Total tokens bet on Yes
    uint256 totalNoPool;   // Total tokens bet on No
    bool resolved;         // Has admin set the outcome?
    bool outcome;          // true = Yes won, false = No won
    address creator;
    uint256 createdAt;
}

struct Bet {
    uint256 yesAmount;     // User's total Yes position
    uint256 noAmount;      // User's total No position
    bool claimed;          // Has user claimed winnings?
}
```

**Functions:**

| Function | Access | Description |
|---|---|---|
| `createMarket(question, deadline)` | Public | Create a new prediction market |
| `placeBet(marketId, position)` | Public (payable) | Bet Yes or No with native tokens |
| `resolveMarket(marketId, outcome)` | Admin only | Set the market outcome after deadline |
| `claimWinnings(marketId)` | Public | Winners claim proportional payout |
| `calculatePayout(marketId, user)` | View | Preview potential winnings |
| `getMarket(marketId)` | View | Fetch market details |
| `getBet(marketId, user)` | View | Get user's position on a market |
| `getMarketBettors(marketId)` | View | List all bettors on a market |
| `setPlatformFee(fee)` | Admin only | Adjust fee (max 10%) |
| `withdrawFees()` | Admin only | Withdraw accumulated platform fees |
| `transferOwnership(newOwner)` | Admin only | Transfer admin rights |

**Payout formula:**
```
winnerPayout = (userBet / winningPool) * totalPool * (1 - platformFee)
```

**Security:**
- ReentrancyGuard on `claimWinnings()`
- `onlyOwner` modifier on admin functions
- Input validation (deadline in future, non-zero bets, can't bet after deadline)
- Safe ETH transfer with `call{value}`

---

## Initia Integration

Pythia is built specifically for Initia and integrates all three native features:

### 1. Auto-Signing (Session Keys)
Users enable a signing session and place bets without wallet popups. This is the killer UX feature — high-frequency betting feels instant, like a Web2 app.

### 2. Interwoven Bridge
Users can deposit tokens from any connected chain directly into the Pythia appchain. No manual bridging needed — onboarding from anywhere.

### 3. `.init` Usernames
The leaderboard and bet history display human-readable `.init` names (e.g., `alice.init`) instead of raw `0x` addresses.

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Markets | Browse all open, closed, and resolved markets |
| `/markets/:id` | Market Detail | View pool distribution, place bets, claim winnings |
| `/create` | Create Market | Form to create a new prediction market |
| `/portfolio` | Portfolio | Your active bets, winnings history, and claim status |

---

## Revenue Model

- **Platform fee:** 2% on all winning payouts (configurable, max 10%)
- **Gas fees:** Deployed as own Initia appchain — all gas revenue stays with the platform
- **Own economics:** Every transaction on Pythia generates revenue for the platform operator

---

## Testing

The contract includes 35+ tests covering:

- Market creation with validation
- Bet placement (Yes/No, multiple bets, edge cases)
- Market resolution (admin only, after deadline)
- Payout calculation and claiming
- Platform fee mechanics
- Access control (ownership, unauthorized calls)
- Reentrancy protection
- Edge cases (zero bets, double claims, expired markets)

```bash
cd contracts
forge test -vvv
```

---

## Deployment

### Initia Appchain (Production)

1. Install the Initia CLI (`weave`)
2. Spin up a MiniEVM appchain with your chain configuration
3. Deploy the contract using Foundry:
   ```bash
   forge script script/Deploy.s.sol \
     --rpc-url <YOUR_APPCHAIN_RPC> \
     --private-key <DEPLOYER_KEY> \
     --broadcast
   ```
4. Update `frontend/src/lib/contract.ts` with the deployed address
5. Build and deploy the frontend

### Local Development

```bash
# Terminal 1: Start local EVM node
cd contracts && anvil

# Terminal 2: Deploy contract locally
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key <ANVIL_KEY> --broadcast

# Terminal 3: Start frontend
cd frontend && npm run dev
```

---

## Submission

This project is submitted to the **INITIATE — The Initia Hackathon (Season 1)** on DoraHacks.

- **Track:** Gaming & Consumer Applications
- **VM:** MiniEVM (Solidity/EVM)
- **Hackathon:** March 16 — April 15, 2026

---

## License

MIT
