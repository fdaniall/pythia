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
Users enable a signing session via InterwovenKit and place unlimited bets without wallet popups. This is the **core UX differentiator** — high-frequency betting feels instant, like a Web2 app. Without auto-signing, every bet requires a manual wallet approval, destroying the betting flow.

**Implementation:** `requestTxBlock()` from `useInterwovenKit()` handles session-based signing transparently. See [`frontend/src/hooks/useMoveContract.ts`](frontend/src/hooks/useMoveContract.ts).

### 2. Interwoven Bridge
New users can deposit INIT from any connected chain directly from the betting interface. When a user's balance is low, the bet form shows a "Bridge Funds" CTA that opens InterwovenKit's bridge modal.

**Implementation:** `openBridge()` from `useInterwovenKit()`. See [`frontend/src/components/bet-form.tsx`](frontend/src/components/bet-form.tsx).

### 3. .init Usernames
The leaderboard, market detail, and portfolio pages resolve on-chain addresses to human-readable `.init` usernames (e.g., `alice.init`). This adds a social layer — users build reputation as predictors.

**Implementation:** Custom `useInitUsername()` hook resolving via Initia's usernames API. See [`frontend/src/hooks/useInitUsername.ts`](frontend/src/hooks/useInitUsername.ts).

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

**Target Users:** Crypto-native users who already trade on prediction markets (Polymarket, Azuro) or sports betting platforms, looking for a transparent, on-chain alternative with better UX.

**Revenue Model:**
- **2% platform fee** on all winning payouts (configurable up to 10%)
- **Gas fees** — own appchain means all transaction fees stay with the platform
- Every bet generates revenue. The platform operator captures value from market activity, not just market creation.

**Competitive Landscape:**
- **Polymarket** (Ethereum) — dominant but high gas, no auto-signing, no cross-chain UX
- **Azuro** (Polygon) — focused on sports, oracle-dependent, not on Initia
- **No native prediction market exists on Initia** — Pythia fills this gap with deep ecosystem integration

**Go-to-Market:** Deploy as own Initia appchain → attract Initia ecosystem users via .init username integration → expand to crypto prediction markets (price targets, protocol events, governance votes).

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
