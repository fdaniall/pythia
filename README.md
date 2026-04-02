# Pythia — See the Future on Initia

**Binary prediction market protocol deployed on Initia L1 (MoveVM).** Bet on real-world outcomes, earn proportional payouts, and enjoy seamless UX with auto-signing — no wallet popups.

> *Named after the Oracle of Delphi, the most famous prediction oracle in ancient history.*

---

## What is Pythia?

Pythia lets users create and participate in binary (Yes/No) prediction markets powered by on-chain Move smart contracts on Initia's L1. Think Polymarket, but on Initia — with cross-chain deposits, gasless betting sessions, and `.init` usernames.

**Core Flow:**
1. **Create** a market: *"Will BTC hit $100K by April 10?"*
2. **Bet** Yes or No with INIT tokens — odds shift dynamically based on pool ratios
3. **Resolve** — admin sets the actual outcome after the deadline
4. **Claim** — winners receive proportional payouts from the total pool (minus 2% platform fee)

---

## Key Features

| Feature | Description |
|---|---|
| **On-chain prediction markets** | Real bets, real payouts — no mock transactions or hardcoded odds |
| **Dynamic odds** | Payout ratio determined by pool distribution (parimutuel model) |
| **Auto-signing** | Enable a session and bet freely without wallet popups (Initia native) |
| **Cross-chain deposits** | Deposit from any chain via Interwoven Bridge |
| **`.init` usernames** | Leaderboard displays human-readable names instead of raw addresses |
| **Platform fee** | 2% fee on payouts — own appchain means all revenue stays with the platform |
| **Move on L1** | Native Move contract on Initia L1 — not a rollup, not an EVM wrapper |

---

## Tech Stack

### Smart Contract
- **Move** on Initia L1 (MoveVM, Aptos Move fork)
- **initia_std** — Fungible Asset model, Object/ExtendRef pattern, Table storage
- **initiad CLI** — build, test, deploy

### Frontend
- **React 19** + **TypeScript 5.9**
- **Vite 8** — build tooling with HMR
- **Tailwind CSS 4** + **shadcn/ui** (brutalist theme)
- **InterwovenKit** (`@initia/interwovenkit-react`) — Initia wallet, auto-sign, bridge
- **TanStack Query 5** — server state management
- **React Router 7** — client-side routing

---

## Project Structure

```
pythia/
├── move/                       # Move smart contract (Initia L1)
│   ├── sources/
│   │   ├── prediction_market.move       # Main contract (~460 lines)
│   │   └── prediction_market_tests.move # 28 tests, all passing
│   └── Move.toml
│
├── frontend/                   # React/TypeScript app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui primitives
│   │   │   ├── Layout.tsx     # Header, nav, wallet, footer
│   │   │   ├── MarketCard.tsx # Market preview card
│   │   │   ├── PoolBar.tsx    # Yes/No pool visualization
│   │   │   ├── bet-form.tsx   # Bet interface with payout calc
│   │   │   └── CommandPalette.tsx # Cmd+K search
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx      # Landing page
│   │   │   ├── MarketsPage.tsx      # Browse all markets
│   │   │   ├── MarketDetailPage.tsx # Bet, view pool, claim
│   │   │   ├── CreateMarketPage.tsx # Create new market
│   │   │   ├── PortfolioPage.tsx    # Your bets & winnings
│   │   │   ├── DocsPage.tsx         # Documentation
│   │   │   └── NotFoundPage.tsx     # 404 with terminal UI
│   │   ├── hooks/
│   │   │   ├── useContract.ts # Contract interaction hooks
│   │   │   └── useCountdown.ts # Shared countdown timer
│   │   ├── lib/
│   │   │   ├── contract.ts    # Contract config + ABI
│   │   │   ├── confetti.ts    # Brutalist confetti effect
│   │   │   └── utils.ts       # Tailwind utilities
│   │   └── types/
│   │       └── market.ts      # Market & Bet interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── contracts/                  # Solidity reference implementation (Foundry)
│   ├── src/PredictionMarket.sol
│   ├── test/PredictionMarket.t.sol  # 26 tests
│   └── script/Deploy.s.sol
│
├── .initia/
│   └── submission.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **initiad** — [build from source](https://github.com/initia-labs/initia) or download from releases
- **Git**

### Smart Contract (Move)

```bash
# Navigate to move directory
cd move

# Build
initiad move build --dev

# Run tests (28 tests)
initiad move test --dev

# Deploy to Initia testnet
initiad move deploy \
  --path . \
  --upgrade-policy COMPATIBLE \
  --from <YOUR_KEY> \
  --gas auto --gas-adjustment 1.5 \
  --gas-prices 0.015uinit \
  --node https://rpc.testnet.initia.xyz \
  --chain-id initiation-2
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
```

---

## Smart Contract Architecture

### prediction_market.move

The contract uses Initia's **Fungible Asset model** with an **Object + ExtendRef** pattern for holding bet funds in a contract-owned vault.

**Storage:**

```move
struct Market has store {
    question: String,
    deadline: u64,          // Unix timestamp
    total_yes_pool: u64,
    total_no_pool: u64,
    resolved: bool,
    winning_outcome: u8,    // 0 = YES, 1 = NO
    creator: address,
    created_at: u64,
    bets: Table<address, Bet>,
    bettors: vector<address>,
}

struct Bet has store, copy, drop {
    yes_amount: u64,
    no_amount: u64,
    claimed: bool,
}
```

**Entry Functions:**

| Function | Access | Description |
|---|---|---|
| `create_market(question, deadline)` | Public | Create a new prediction market |
| `place_bet(market_id, outcome, amount)` | Public | Bet YES (0) or NO (1) with INIT tokens |
| `resolve_market(market_id, winning_outcome)` | Admin only | Set the market outcome |
| `claim_winnings(market_id)` | Public | Winners claim proportional payout |
| `set_platform_fee(new_fee_bps)` | Admin only | Adjust fee (max 10%) |
| `transfer_ownership(new_admin)` | Admin only | Transfer admin rights |
| `withdraw_fees(amount)` | Admin only | Withdraw accumulated platform fees |

**View Functions:**

| Function | Returns |
|---|---|
| `get_market_count()` | Total number of markets |
| `get_market(market_id)` | Full market data tuple |
| `get_bet(market_id, bettor)` | User's bet amounts + claimed status |
| `calculate_payout(market_id, bettor)` | Preview net payout after fees |
| `get_platform_fee_bps()` | Current fee in basis points |
| `get_admin()` | Admin address |

**Payout Formula:**
```
gross_payout = (user_winning_bet / winning_pool) * total_pool
fee = gross_payout * platform_fee_bps / 10000
net_payout = gross_payout - fee
```

**Security:**
- Contract-owned vault via `ExtendRef` — funds held by an object, not an EOA
- Admin-only resolution with `error::permission_denied` checks
- Input validation: deadline in future, non-zero bets, valid outcome (0 or 1)
- Double-claim prevention via `claimed` flag
- u128 intermediate math to prevent overflow on payout calculation

---

## Initia Integration

Pythia is built specifically for Initia and integrates native features:

### 1. Auto-Signing (Session Keys)
Users enable a signing session and place bets without wallet popups. High-frequency betting feels instant, like a Web2 app.

### 2. Interwoven Bridge
Users can deposit INIT from any connected chain directly. No manual bridging needed — onboarding from anywhere.

### 3. `.init` Usernames
The leaderboard and bet history display human-readable `.init` names (e.g., `alice.init`) instead of raw addresses.

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, features, how it works, CTA |
| `/markets` | Markets | Browse all open, closed, and resolved markets |
| `/markets/:id` | Market Detail | View pool distribution, place bets, share |
| `/create` | Create Market | Form to create a new prediction market |
| `/portfolio` | Portfolio | Your active bets, winnings, and claim status |
| `/docs` | Documentation | Protocol mechanics, architecture, FAQ |
| `*` | 404 | Interactive terminal crash recovery |

---

## Revenue Model

- **Platform fee:** 2% on all winning payouts (configurable, max 10%)
- **Gas fees:** All transaction fees on the Initia appchain stay with the platform
- **Own economics:** Every bet generates revenue for the platform operator

---

## Testing

The Move contract includes **28 tests** covering:

- Market creation with validation (deadline, multiple markets)
- Bet placement (YES/NO, both sides, multiple users, edge cases)
- Market resolution (admin only, double resolve prevention)
- Payout calculation and claiming (proportional, fee deduction)
- Claim protection (losers, double claims, before resolution)
- Admin functions (fee changes, ownership transfer)
- Error cases (expired markets, nonexistent markets, invalid outcomes)

```bash
cd move
initiad move test --dev
# Test result: OK. Total tests: 28; passed: 28; failed: 0
```

---

## Submission

This project is submitted to the **INITIATE — The Initia Hackathon (Season 1)** on DoraHacks.

- **Track:** Gaming & Consumer Applications
- **VM:** MoveVM (Initia L1)
- **Hackathon:** March 16 — April 15, 2026

---

## License

MIT
