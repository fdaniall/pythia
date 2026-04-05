# Pythia — See the Future on Initia

> **INITIATE Hackathon Submission — Gaming & Consumer Applications Track**

## Initia Hackathon Submission

| Field | Value |
|---|---|
| **Project** | Pythia |
| **Track** | Gaming & Consumer Applications |
| **VM** | Move (Initia MoveVM) |
| **Native Features** | Auto-signing, Interwoven Bridge, .init Usernames |
| **Contract** | `0xF83249D6AB09160493214DE15D7EC623CCB5063E::prediction_market` |

---

## Overview

**Pythia is a binary prediction market protocol where users bet on real-world outcomes using INIT tokens.** It targets crypto-native users who want to put conviction behind their opinions — from BTC price targets to election outcomes — with real money and transparent, on-chain settlement.

Unlike existing prediction markets (Polymarket on Ethereum, Azuro on Polygon), Pythia is built natively on Initia and leverages **auto-signing for zero-popup betting**, **Interwoven Bridge for cross-chain deposits**, and **.init usernames for social identity** — delivering a UX that centralized betting platforms can't match with the transparency they can't offer.

---

## Custom Implementation & Unique Functionality

Pythia is **not a Blueprint clone**. Every component is custom-built:

### Smart Contract (Move)
- **Parimutuel market model** — dynamic odds based on pool ratios, not hardcoded multipliers
- **Contract-owned vault** via Initia's `Object + ExtendRef` pattern — funds held by an on-chain object, not an EOA
- **Proportional payout engine** — winners receive `(user_bet / winning_pool) * total_pool * 0.98`
- **13 error codes**, **37 passing tests**, full admin controls (fee adjustment, two-step ownership transfer, fee withdrawal, market cancellation)
- **585 lines** of production Move code with u128 intermediate math to prevent overflow
- **Market cancellation** with automatic refunds to all bettors
- **Two-step ownership transfer** — propose + accept pattern prevents accidental lockout
- **Fee accounting** — tracked fees vs. bettor deposits, admin can only withdraw earned fees

### Frontend (React + InterwovenKit)
- **8 pages**: Landing, Markets (with category filters), Market Detail, Create Market, Portfolio, Leaderboard, Docs, 404
- **Real-time countdown timers** shared across components via `useSyncExternalStore`
- **Payout calculator** — live preview of potential returns as user adjusts bet amount
- **Admin resolution panel** — inline UI for market resolution (only visible to contract admin)
- **Auto-categorization** — markets auto-tagged by keyword analysis (Crypto, Sports, Politics, Tech, Culture)
- **Brutalist/cyberpunk design system** — cohesive neon-on-dark theme with custom grid overlays, glitch effects, and terminal aesthetics
- **Command palette** (Cmd+K) for quick market search and navigation

---

## Native Feature Integration

### 1. Auto-Signing (Primary Feature)
Pythia integrates Initia's Ghost Wallet auto-signing via `enableAutoSign` on `InterwovenKitProvider`. Users who connect via Email/Socials (Privy embedded wallet) can enable a signing session and place unlimited bets without wallet popups — high-frequency betting that feels like a Web2 app. The UI shows auto-sign status in the bet form and uses `submitTxBlock()` for zero-popup transactions when a session is active, falling back to `requestTxBlock()` for standard wallet approval.

**Implementation:** `enableAutoSign` configured on provider ([`App.tsx`](frontend/src/App.tsx)), transaction routing in [`frontend/src/hooks/useMoveContract.ts`](frontend/src/hooks/useMoveContract.ts).

### 2. Interwoven Bridge
New users can deposit INIT from any connected chain directly from the betting interface. When a user's balance is low, the bet form shows a "Bridge Funds" CTA that opens InterwovenKit's bridge modal.

**Implementation:** `openBridge()` from `useInterwovenKit()`. See [`frontend/src/components/bet-form.tsx`](frontend/src/components/bet-form.tsx).

### 3. .init Usernames
The leaderboard, market detail, and portfolio pages resolve on-chain addresses to human-readable `.init` usernames (e.g., `alice.init`). This adds a social layer — users build reputation as predictors.

**Implementation:** Custom `useInitUsername()` hook resolving via Initia's usernames API. See [`frontend/src/hooks/useInitUsername.ts`](frontend/src/hooks/useInitUsername.ts).

---

## Why This Only Works on Initia

Pythia is not a generic prediction market ported to another chain. Three capabilities make it **impossible to replicate on Ethereum, Solana, or any single-chain L1:**

### 1. Auto-Signing Eliminates Betting Friction
Prediction markets live or die on **speed of conviction**. When a user sees odds shifting, they need to bet *now* — not confirm a wallet popup, wait for it to load, click approve, then confirm. Initia's auto-signing sessions let users place 50 bets in a row without a single popup. On Ethereum, that's 50 MetaMask confirmations. On Solana, 50 Phantom approvals. **No other chain has protocol-level session signing that works this seamlessly.**

### 2. Cross-Chain Deposits Unlock Liquidity
Prediction market depth = better odds = more users. Pythia's bridge integration means a user on Celestia, Cosmos, or any Initia-connected chain can deposit and bet without leaving the app. On Polymarket, you need to bridge ETH to Polygon, swap to USDC, then deposit — 3 transactions across 2 chains. **Initia's interwoven architecture collapses this to 1 click.** More accessible liquidity = deeper pools = more accurate predictions.

### 3. .init Usernames Create a Social Prediction Layer
Prediction markets are inherently social — you're betting against other people's beliefs. `.init` usernames turn anonymous addresses into identities. When you see `oracle.init` is #1 on the leaderboard with a 78% win rate, you pay attention to their positions. **This social layer doesn't exist on any other chain's prediction market.** Polymarket has no identity system. Azuro has no usernames. Pythia has reputation built into the protocol.

**The combination** — frictionless betting (auto-sign) + universal liquidity (bridge) + social identity (usernames) — creates a prediction market UX that **cannot be built on any other chain today.**

---

## How to Run Locally

### Prerequisites
- Node.js >= 18
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/fdaniall/pythia.git
cd pythia

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Start development server
npm run dev
# Opens at http://localhost:5173

# 4. Connect wallet via InterwovenKit (testnet)
# Click "Connect Wallet" in the navbar — InterwovenKit handles wallet setup
# The app connects to Initia testnet (initiation-2) by default
```

The smart contract is already deployed on testnet. No local contract deployment needed to test the frontend.

To build and test the Move contract:
```bash
cd move
initiad move build --dev
initiad move test --dev
# Test result: OK. Total tests: 37; passed: 37; failed: 0
```

---

## Architecture

```
pythia/
├── move/                          # Move smart contract
│   ├── sources/
│   │   ├── prediction_market.move        # Core contract (475+ lines)
│   │   └── prediction_market_tests.move  # 37 tests
│   └── Move.toml
│
├── frontend/                      # React/TypeScript app
│   ├── src/
│   │   ├── components/            # UI components (MarketCard, BetForm, PoolBar, etc.)
│   │   ├── pages/                 # 8 pages (Landing → Markets → Detail → Create → Portfolio → Leaderboard → Docs → 404)
│   │   ├── hooks/                 # useMoveContract, useInitUsername, useCountdown
│   │   ├── lib/                   # move.ts (contract integration), confetti, utils
│   │   └── types/                 # Market, Bet, MarketCategory types
│   └── package.json
│
├── .initia/
│   └── submission.json            # Hackathon submission metadata
│
└── README.md
```

### Smart Contract Functions

**Entry Functions:**

| Function | Access | Description |
|---|---|---|
| `create_market(question, deadline)` | Public | Create a binary prediction market |
| `place_bet(market_id, outcome, amount)` | Public | Bet YES (0) or NO (1) with INIT |
| `resolve_market(market_id, winning_outcome)` | Admin | Set market outcome |
| `claim_winnings(market_id)` | Public | Winners claim proportional payout |
| `cancel_market(market_id)` | Admin | Cancel market & refund all bettors |
| `set_platform_fee(new_fee_bps)` | Admin | Adjust fee (max 10%) |
| `propose_admin(new_admin)` | Admin | Step 1: propose new admin |
| `accept_admin()` | Proposed | Step 2: accept admin role |
| `withdraw_fees(amount)` | Admin | Withdraw earned platform fees only |

**Payout Formula:**
```
gross = (user_winning_bet / winning_pool) * total_pool
net   = gross * (1 - platform_fee)
```

---

## Revenue & Market Understanding

### Market Size

Prediction markets are a proven, high-growth category:
- **Polymarket** processed **$9B+ in volume in 2024** — up from ~$300M in 2023 (30x growth)
- **Global online betting market** projected at $150B+ by 2027
- **Initia ecosystem** is early-stage with growing user base — zero prediction markets exist today
- Even capturing **0.1% of Polymarket's volume on Initia** = $9M+ annual volume at 2% fee = **$180K+ revenue**

### Target Users

| Segment | Why They Use Pythia | Acquisition Channel |
|---|---|---|
| **Initia ecosystem users** | Already have INIT, .init usernames, familiar with InterwovenKit | .init leaderboard creates competitive loop — users recruit friends to compete |
| **Polymarket refugees** | Lower fees, no bridging friction, auto-sign UX | Crypto Twitter, "bet on X without 3 bridge transactions" narrative |
| **Crypto traders** | Already have price opinions — prediction market = put money behind conviction | AI market creation lowers barrier — type an idea, market is live in seconds |

### Revenue Model

| Revenue Stream | Mechanism | Scale |
|---|---|---|
| **Platform fee** | 2% on winning payouts (configurable up to 10%) | Grows linearly with volume |
| **Gas fees** | Own appchain = all tx fees stay with platform | Every bet, claim, and market creation generates gas revenue |
| **Market creation fee** | Optional gate to prevent spam (configurable) | Quality control + revenue |

### Competitive Landscape

| Platform | Chain | Auto-Sign | Cross-Chain Deposits | Usernames | Fee | Weakness |
|---|---|---|---|---|---|---|
| **Polymarket** | Ethereum/Polygon | No | No (manual bridge) | No | 0% (maker) / 1% (taker) | High friction, no social layer, no auto-sign |
| **Azuro** | Polygon/Gnosis | No | No | No | 2-5% | Sports-only, oracle-dependent, no crypto markets |
| **Drift** | Solana | No | No | No | Variable | Perps-focused, not pure prediction market |
| **Pythia** | **Initia** | **Yes** | **Yes** | **Yes (.init)** | **2%** | MVP — centralized resolution, binary only |

### User Acquisition Funnel

```
Discovery → .init leaderboard on Twitter ("I'm #3 on Pythia")
    ↓
Onboarding → Bridge from any chain, 1 click
    ↓
First Bet → AI creates market from plain text, auto-sign = zero friction
    ↓
Retention → Leaderboard rank + win rate = competitive loop
    ↓
Viral → Share to X button on every market ("I bet YES on BTC $100K")
```

### Go-to-Market

1. **Launch on Initia mainnet** as own appchain — capture first-mover advantage
2. **Seed markets** around Initia ecosystem events (launches, governance, TVL milestones)
3. **Leaderboard as growth engine** — .init usernames make top predictors into micro-influencers
4. **Expand categories** — crypto → sports → politics → culture (follow Polymarket's playbook)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Move (Initia MoveVM) |
| Frontend | React 19, TypeScript 5.9, Vite 8 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Wallet/SDK | InterwovenKit (`@initia/interwovenkit-react`) |
| State | TanStack Query 5 (server), React state (client) |
| Routing | React Router 7 |

---

## Known Limitations (MVP)

- **Centralized resolution** — markets are resolved by the contract admin, not a decentralized oracle. Roadmap includes UMA Optimistic Oracle integration.
- **Binary outcomes only** — markets support YES/NO only. Multi-outcome markets planned for v2.
- **No dispute mechanism** — resolution is final once submitted. Future versions will add a dispute window.
- **AI market creation uses client-side API key** — Groq API key is bundled in the frontend. For production, this should be proxied through a backend.
- **Leaderboard scales linearly** — fetches all bettors for all markets via REST. Production would use an indexer.

---

## License

MIT
