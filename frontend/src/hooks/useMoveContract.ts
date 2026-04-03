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

/** Returns a single market by ID, or undefined if not found. */
export function useMoveMarket(marketId: number) {
  return useQuery({
    queryKey: moveQueryKeys.market(marketId),
    queryFn: async () => {
      const raw = await fetchMarket(REST_URL, marketId)
      return adaptMarket(marketId, raw)
    },
    enabled: marketId >= 0,
    refetchInterval: 15_000,
    staleTime: 10_000,
    retry: (failureCount, error) => {
      // Don't retry on "market not found" errors
      if (error instanceof Error && error.message.includes("not_found")) return false
      return failureCount < 3
    },
  })
}

/** Returns all markets from ID 0 to marketCount-1. */
export function useMoveAllMarkets() {
  const { data: count } = useMoveMarketCount()
  const marketCount = count ?? 0

  return useQuery({
    queryKey: [...moveQueryKeys.marketCount(), "all"],
    queryFn: async () => {
      if (marketCount === 0) return []

      // Fetch all markets in parallel
      const results = await Promise.allSettled(
        Array.from({ length: marketCount }, (_, i) => fetchMarket(REST_URL, i)),
      )

      const markets: Market[] = []
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === "fulfilled") {
          markets.push(adaptMarket(i, result.value))
        }
      }
      return markets
    },
    enabled: marketCount > 0,
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
// InterwovenKit's `requestTxBlock` method:
//   - Takes a TxRequest with `messages`, optional `gas`, `gasAdjustment`, `gasPrices`
//   - Returns DeliverTxResponse on success, throws on failure
//   - Handles wallet interaction (popup/signing) internally
//
// `initiaAddress` from useInterwovenKit() returns the bech32 Cosmos address
// (init1...) which is what MsgExecuteJSON.sender expects.

/** Creates a new prediction market. */
export function useMoveCreateMarket() {
  const { requestTxBlock, initiaAddress } = useInterwovenKit()
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

      return requestTxBlock({
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
  const { requestTxBlock, initiaAddress } = useInterwovenKit()
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

      return requestTxBlock({
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
  const { requestTxBlock, initiaAddress } = useInterwovenKit()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: number }) => {
      const msg = buildClaimWinningsMsg(initiaAddress, marketId)

      return requestTxBlock({
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

/** Resolves a market (admin only). */
export function useMoveResolveMarket() {
  const { requestTxBlock, initiaAddress } = useInterwovenKit()
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

      return requestTxBlock({
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
