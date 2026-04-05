/**
 * React hooks for interacting with the Pythia prediction market Move contract.
 *
 * Uses:
 * - InterwovenKit's `useInterwovenKit()` for transaction signing + broadcast
 * - TanStack Query for caching + revalidating view function results
 * - `@initia/utils` `createMoveClient` for typed view function calls
 *
 * The InterwovenKit provider is already set up in App.tsx with TESTNET config
 * pointing at initiation-2. The restUrl is resolved at runtime from the chain
 * registry — we read it via the chainRegistry context in the kit.
 *
 * REST URL pattern: https://<lcd>.initiation-2.initia.xyz
 * The chain registry for initiation-2 will return the correct endpoint.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { toast } from "sonner"
import {
  MODULE_ADDRESS,
  MODULE_NAME,
  INITIA_REST_URL,
  DEFAULT_GAS,
  DEFAULT_GAS_ADJUSTMENT,
  UINIT_DENOM,
  buildCreateMarketMsg,
  buildPlaceBetMsg,
  buildClaimWinningsMsg,
  buildResolveMarketMsg,
  fetchMarketCount,
  fetchMarket,
  fetchBet,
  fetchCalculatePayout,
  fetchPlatformFeeBps,
  type OnChainMarket,
  type OnChainBet,
} from "@/lib/move"
import type { Market, Bet } from "@/types/market"

// ── Rest URL resolution ─────────────────────────────────────────────────────
//
// InterwovenKit exposes `restUrl` via an internal context but does NOT
// re-export it through `useInterwovenKit()`. The pattern used inside the
// kit itself is to read the chain registry. For our purposes, the testnet
// LCD URL is stable and we hardcode it as a fallback. When InterwovenKit
// adds a public `useRestUrl()` hook, swap this out.

const REST_URL = INITIA_REST_URL

// ── Query keys ──────────────────────────────────────────────────────────────

export const moveQueryKeys = {
  marketCount: () => ["move", MODULE_ADDRESS, MODULE_NAME, "market_count"] as const,
  market: (id: number) => ["move", MODULE_ADDRESS, MODULE_NAME, "market", id] as const,
  bet: (marketId: number, bettor: string) =>
    ["move", MODULE_ADDRESS, MODULE_NAME, "bet", marketId, bettor] as const,
  payout: (marketId: number, bettor: string) =>
    ["move", MODULE_ADDRESS, MODULE_NAME, "payout", marketId, bettor] as const,
  platformFee: () => ["move", MODULE_ADDRESS, MODULE_NAME, "platform_fee"] as const,
}

// ── Data adapters ────────────────────────────────────────────────────────────
// Convert on-chain Move return values to our frontend Market/Bet types.
// u64 values come back as decimal strings; we convert to BigInt for UI consistency.

function adaptMarket(id: number, raw: OnChainMarket): Market {
  return {
    id,
    question: raw.question,
    deadline: BigInt(raw.deadline),
    totalYesPool: BigInt(raw.totalYesPool),
    totalNoPool: BigInt(raw.totalNoPool),
    resolved: raw.resolved,
    // Move uses u8 outcome (0=YES, 1=NO); convert to boolean for UI parity
    outcome: raw.winningOutcome === 0,
    creator: raw.creator,
    createdAt: BigInt(raw.createdAt),
    bettorCount: Number(raw.bettorCount),
  }
}

function adaptBet(raw: OnChainBet): Bet {
  return {
    yesAmount: BigInt(raw.yesAmount),
    noAmount: BigInt(raw.noAmount),
    claimed: raw.claimed,
  }
}

// ── Read hooks ───────────────────────────────────────────────────────────────

/** Returns the total number of markets as a number. */
export function useMoveMarketCount() {
  return useQuery({
    queryKey: moveQueryKeys.marketCount(),
    queryFn: async () => {
      const count = await fetchMarketCount(REST_URL)
      return Number(count)
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  })
}

/** Returns a single market by ID, or undefined if not found. Supports seed markets (negative IDs). */
export function useMoveMarket(marketId: number) {
  return useQuery({
    queryKey: moveQueryKeys.market(marketId),
    queryFn: async () => {
      // Seed market — return from hardcoded data
      if (marketId < 0) {
        const seed = SEED_MARKETS.find((m) => m.id === marketId)
        if (seed) return seed
        throw new Error("not_found")
      }
      const raw = await fetchMarket(REST_URL, marketId)
      return adaptMarket(marketId, raw)
    },
    refetchInterval: marketId >= 0 ? 15_000 : false,
    staleTime: marketId >= 0 ? 10_000 : Infinity,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("not_found")) return false
      return failureCount < 3
    },
  })
}

// ── Seed data for demo ──────────────────────────────────────────────────────
// Hardcoded markets to showcase the UI. Mixed with real on-chain data.
// IDs use negative numbers to avoid collision with on-chain market IDs.

const now = BigInt(Math.floor(Date.now() / 1000))

const SEED_MARKETS: Market[] = [
  {
    id: -1,
    question: "Will BTC reach $150,000 by December 2026?",
    deadline: now + 20_000_000n,
    totalYesPool: 48_500_000n,  // 48.5 INIT
    totalNoPool: 31_200_000n,   // 31.2 INIT
    resolved: false,
    outcome: false,
    creator: "0x7a3b1c9d2e4f5a6b8c0d1e2f3a4b5c6d7e8f9a0b",
    createdAt: now - 432_000n,  // 5 days ago
    bettorCount: 24,
  },
  {
    id: -2,
    question: "Will Ethereum implement full danksharding before 2027?",
    deadline: now + 15_000_000n,
    totalYesPool: 22_800_000n,
    totalNoPool: 35_100_000n,
    resolved: false,
    outcome: false,
    creator: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    createdAt: now - 345_600n,  // 4 days ago
    bettorCount: 18,
  },
  {
    id: -3,
    question: "Did ETH break $5,000 in March 2026?",
    deadline: now - 600_000n,   // past
    totalYesPool: 15_000_000n,
    totalNoPool: 42_300_000n,
    resolved: true,
    outcome: false,             // NO won
    creator: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    createdAt: now - 2_592_000n, // 30 days ago
    bettorCount: 31,
  },
  {
    id: -4,
    question: "Will the US approve spot ETH ETF staking by end of 2026?",
    deadline: now + 18_000_000n,
    totalYesPool: 67_200_000n,
    totalNoPool: 28_900_000n,
    resolved: false,
    outcome: false,
    creator: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    createdAt: now - 259_200n,  // 3 days ago
    bettorCount: 42,
  },
  {
    id: -5,
    question: "Will Argentina win Copa America 2026?",
    deadline: now + 8_000_000n,
    totalYesPool: 38_700_000n,
    totalNoPool: 44_100_000n,
    resolved: false,
    outcome: false,
    creator: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    createdAt: now - 172_800n,  // 2 days ago
    bettorCount: 56,
  },
  {
    id: -6,
    question: "Did Solana hit $300 in Q1 2026?",
    deadline: now - 400_000n,   // past
    totalYesPool: 29_400_000n,
    totalNoPool: 8_700_000n,
    resolved: true,
    outcome: true,              // YES won
    creator: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    createdAt: now - 5_184_000n, // 60 days ago
    bettorCount: 27,
  },
  {
    id: -7,
    question: "Will OpenAI release GPT-5 before July 2026?",
    deadline: now + 6_000_000n,
    totalYesPool: 55_100_000n,
    totalNoPool: 19_800_000n,
    resolved: false,
    outcome: false,
    creator: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
    createdAt: now - 86_400n,   // 1 day ago
    bettorCount: 37,
  },
  {
    id: -8,
    question: "Will Initia mainnet launch before June 2026?",
    deadline: now + 4_500_000n,
    totalYesPool: 71_000_000n,
    totalNoPool: 12_500_000n,
    resolved: false,
    outcome: false,
    creator: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    createdAt: now - 518_400n,  // 6 days ago
    bettorCount: 63,
  },
  {
    id: -9,
    question: "Will NVIDIA hit $200 per share by Q3 2026?",
    deadline: now - 50_000n,    // past, not yet resolved
    totalYesPool: 33_400_000n,
    totalNoPool: 21_800_000n,
    resolved: false,
    outcome: false,
    creator: "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c",
    createdAt: now - 1_209_600n, // 14 days ago
    bettorCount: 19,
  },
  {
    id: -10,
    question: "Did Trump win the 2026 midterm popular vote?",
    deadline: now - 200_000n,   // past, not yet resolved
    totalYesPool: 52_100_000n,
    totalNoPool: 48_700_000n,
    resolved: false,
    outcome: false,
    creator: "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
    createdAt: now - 2_000_000n, // ~23 days ago
    bettorCount: 71,
  },
]

/** Returns all markets from ID 0 to marketCount-1, plus seed data for demo. */
export function useMoveAllMarkets() {
  const { data: count } = useMoveMarketCount()
  const marketCount = count ?? 0

  return useQuery({
    queryKey: [...moveQueryKeys.marketCount(), "all"],
    queryFn: async () => {
      const onChainMarkets: Market[] = []

      if (marketCount > 0) {
        const results = await Promise.allSettled(
          Array.from({ length: marketCount }, (_, i) => fetchMarket(REST_URL, i)),
        )
        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          if (result.status === "fulfilled") {
            onChainMarkets.push(adaptMarket(i, result.value))
          }
        }
      }

      // Merge: on-chain first, then seed data
      return [...onChainMarkets, ...SEED_MARKETS]
    },
    // Always enabled so seed data shows even with 0 on-chain markets
    refetchInterval: 15_000,
    staleTime: 10_000,
  })
}

/** Returns a user's bet on a specific market. */
export function useMoveUserBet(marketId: number, bettorAddress: string | undefined) {
  return useQuery({
    queryKey: moveQueryKeys.bet(marketId, bettorAddress ?? ""),
    queryFn: async () => {
      if (!bettorAddress) return undefined
      const raw = await fetchBet(REST_URL, marketId, bettorAddress)
      return adaptBet(raw)
    },
    enabled: !!bettorAddress && marketId >= 0,
    refetchInterval: 15_000,
    staleTime: 5_000,
  })
}

/** Returns the calculated payout for a bettor on a resolved market (in uinit). */
export function useMoveCalculatePayout(marketId: number, bettorAddress: string | undefined) {
  return useQuery({
    queryKey: moveQueryKeys.payout(marketId, bettorAddress ?? ""),
    queryFn: async () => {
      if (!bettorAddress) return 0n
      const raw = await fetchCalculatePayout(REST_URL, marketId, bettorAddress)
      return BigInt(raw)
    },
    enabled: !!bettorAddress && marketId >= 0,
    staleTime: 10_000,
  })
}

/** Returns the platform fee in basis points (e.g. 200 = 2%). */
export function useMovePlatformFee() {
  return useQuery({
    queryKey: moveQueryKeys.platformFee(),
    queryFn: async () => {
      const raw = await fetchPlatformFeeBps(REST_URL)
      return Number(raw)
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}

// ── Write hooks (InterwovenKit) ─────────────────────────────────────────────
//
// Two methods for sending transactions:
//   - `requestTxBlock`: Always shows wallet popup for manual approval
//   - `submitTxBlock`: Uses auto-sign (ghost wallet) — NO popup when enabled
//
// We use submitTxBlock when auto-sign is active, requestTxBlock as fallback.

/** Helper: send tx with auto-sign if enabled, fallback to manual approval */
function useSendTx() {
  const kit = useInterwovenKit()
  return async (txRequest: { messages: any[]; gas?: number; gasAdjustment?: number }) => {
    const autoSignEnabled = Object.values(kit.autoSign?.isEnabledByChain ?? {}).some(Boolean)
    if (autoSignEnabled) {
      // submitTxBlock needs { messages, fee } not { messages, gas }
      const gasAmount = txRequest.gas ?? DEFAULT_GAS
      return kit.submitTxBlock({
        messages: txRequest.messages,
        fee: {
          amount: [{ denom: UINIT_DENOM, amount: String(Math.ceil(gasAmount * 0.015)) }],
          gas: String(gasAmount),
        },
      } as any)
    }
    return kit.requestTxBlock(txRequest)
  }
}

/** Creates a new prediction market. */
export function useMoveCreateMarket() {
  const { initiaAddress } = useInterwovenKit()
  const sendTx = useSendTx()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      question,
      deadlineUnixSec,
    }: {
      question: string
      deadlineUnixSec: number
    }) => {
      const msg = buildCreateMarketMsg(initiaAddress, question, deadlineUnixSec)

      return sendTx({
        messages: [msg],
        gas: DEFAULT_GAS,
        gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
      })
    },
    onSuccess: () => {
      // Invalidate market count and all-markets so they refetch
      queryClient.invalidateQueries({ queryKey: moveQueryKeys.marketCount() })
      toast.success("Market Created", {
        description: "Your prediction market is now live on Initia.",
      })
    },
    onError: (error: Error) => {
      console.error("create_market failed:", error)
      toast.error("Transaction Failed", {
        description: error.message ?? "Failed to create market.",
      })
    },
  })
}

/**
 * Places a bet on a market.
 * Amount should be in uinit (1 INIT = 1_000_000 uinit).
 */
export function useMovePlaceBet() {
  const { initiaAddress } = useInterwovenKit()
  const sendTx = useSendTx()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      marketId,
      outcome,
      amountUinit,
    }: {
      marketId: number
      outcome: 0 | 1
      amountUinit: bigint
    }) => {
      const msg = buildPlaceBetMsg(initiaAddress, marketId, outcome, amountUinit)

      return sendTx({
        messages: [msg],
        gas: DEFAULT_GAS,
        gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: moveQueryKeys.market(variables.marketId) })
      queryClient.invalidateQueries({
        queryKey: moveQueryKeys.bet(variables.marketId, initiaAddress),
      })
      queryClient.invalidateQueries({ queryKey: moveQueryKeys.marketCount() })
      toast.success("Bet Placed", {
        description: `Your ${variables.outcome === 0 ? "YES" : "NO"} bet has been recorded.`,
      })
    },
    onError: (error: Error) => {
      console.error("place_bet failed:", error)
      toast.error("Bet Failed", {
        description: error.message ?? "Failed to place bet.",
      })
    },
  })
}

// We need initiaAddress in the onSuccess callbacks but it's not available
// in the closure after mutation - fix by using a ref-pattern in the hook
// that reads address at call time. The pattern above accesses initiaAddress
// from the outer hook closure which is fine since hooks re-render correctly.

/** Claims winnings from a resolved market. */
export function useMoveClaimWinnings() {
  const { initiaAddress } = useInterwovenKit()
  const sendTx = useSendTx()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: number }) => {
      const msg = buildClaimWinningsMsg(initiaAddress, marketId)

      return sendTx({
        messages: [msg],
        gas: DEFAULT_GAS,
        gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: moveQueryKeys.bet(variables.marketId, initiaAddress),
      })
      queryClient.invalidateQueries({
        queryKey: moveQueryKeys.payout(variables.marketId, initiaAddress),
      })
      toast.success("Winnings Claimed", {
        description: "Your INIT tokens have been sent to your wallet.",
      })
    },
    onError: (error: Error) => {
      console.error("claim_winnings failed:", error)
      toast.error("Claim Failed", {
        description: error.message ?? "Failed to claim winnings.",
      })
    },
  })
}

/** Returns the contract admin address. */
export function useMoveAdmin() {
  return useQuery({
    queryKey: [...moveQueryKeys.marketCount(), "admin"],
    queryFn: async () => {
      const { fetchAdmin } = await import("@/lib/move")
      const adminAddr = await fetchAdmin(REST_URL)
      return adminAddr
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}

/** Resolves a market (admin only). */
export function useMoveResolveMarket() {
  const { initiaAddress } = useInterwovenKit()
  const sendTx = useSendTx()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      marketId,
      winningOutcome,
    }: {
      marketId: number
      winningOutcome: 0 | 1
    }) => {
      const msg = buildResolveMarketMsg(initiaAddress, marketId, winningOutcome)

      return sendTx({
        messages: [msg],
        gas: DEFAULT_GAS,
        gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: moveQueryKeys.market(variables.marketId) })
      toast.success("Market Resolved", {
        description: `Market resolved with ${variables.winningOutcome === 0 ? "YES" : "NO"} outcome.`,
      })
    },
    onError: (error: Error) => {
      console.error("resolve_market failed:", error)
      toast.error("Resolution Failed", {
        description: error.message ?? "Failed to resolve market.",
      })
    },
  })
}

/** Cancels a market and refunds all bettors (admin only). */
export function useMoveCancelMarket() {
  const { initiaAddress } = useInterwovenKit()
  const sendTx = useSendTx()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: number }) => {
      const { buildCancelMarketMsg } = await import("@/lib/move")
      const msg = buildCancelMarketMsg(initiaAddress, marketId)
      return sendTx({
        messages: [msg],
        gas: DEFAULT_GAS,
        gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: moveQueryKeys.market(variables.marketId) })
      queryClient.invalidateQueries({ queryKey: moveQueryKeys.marketCount() })
      toast.success("Market Cancelled", {
        description: "All bets have been refunded to bettors.",
      })
    },
    onError: (error: Error) => {
      toast.error("Cancellation Failed", {
        description: error.message ?? "Failed to cancel market.",
      })
    },
  })
}

/** Proposes a new admin (step 1 of two-step ownership transfer). */
export function useMoveProposeAdmin() {
  const { initiaAddress } = useInterwovenKit()
  const sendTx = useSendTx()

  return useMutation({
    mutationFn: async ({ newAdmin }: { newAdmin: string }) => {
      const { buildProposeAdminMsg } = await import("@/lib/move")
      const msg = buildProposeAdminMsg(initiaAddress, newAdmin)
      return sendTx({
        messages: [msg],
        gas: DEFAULT_GAS,
        gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
      })
    },
    onSuccess: () => {
      toast.success("Admin Proposed", {
        description: "New admin must call accept_admin to complete transfer.",
      })
    },
    onError: (error: Error) => {
      toast.error("Proposal Failed", {
        description: error.message ?? "Failed to propose admin.",
      })
    },
  })
}

/** Accepts admin role (step 2 of two-step ownership transfer). */
export function useMoveAcceptAdmin() {
  const { initiaAddress } = useInterwovenKit()
  const sendTx = useSendTx()

  return useMutation({
    mutationFn: async () => {
      const { buildAcceptAdminMsg } = await import("@/lib/move")
      const msg = buildAcceptAdminMsg(initiaAddress)
      return sendTx({
        messages: [msg],
        gas: DEFAULT_GAS,
        gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
      })
    },
    onSuccess: () => {
      toast.success("Admin Accepted", {
        description: "You are now the contract admin.",
      })
    },
    onError: (error: Error) => {
      toast.error("Accept Failed", {
        description: error.message ?? "Failed to accept admin role.",
      })
    },
  })
}
