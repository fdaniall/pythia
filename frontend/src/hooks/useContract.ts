import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "@/lib/contract"
import type { Market, Bet } from "@/types/market"

const contractConfig = {
  address: PREDICTION_MARKET_ADDRESS,
  abi: PREDICTION_MARKET_ABI,
} as const

// ── Read: Market Count ──────────────────────────────────────────
export function useMarketCount() {
  return useReadContract({
    ...contractConfig,
    functionName: "marketCount",
    query: { refetchInterval: 10_000 },
  })
}

// ── Read: Single Market ─────────────────────────────────────────
export function useMarket(marketId: number) {
  const result = useReadContract({
    ...contractConfig,
    functionName: "getMarket",
    args: [BigInt(marketId)],
    query: { enabled: marketId >= 0 },
  })

  const bettors = useReadContract({
    ...contractConfig,
    functionName: "getMarketBettors",
    args: [BigInt(marketId)],
    query: { enabled: marketId >= 0 },
  })

  const market: Market | undefined = result.data
    ? {
        id: marketId,
        question: result.data.question,
        deadline: result.data.deadline,
        totalYesPool: result.data.totalYesPool,
        totalNoPool: result.data.totalNoPool,
        resolved: result.data.resolved,
        outcome: result.data.outcome,
        creator: result.data.creator,
        createdAt: result.data.createdAt,
        bettorCount: bettors.data?.length ?? 0,
      }
    : undefined

  return {
    market,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  }
}

// ── Read: All Markets ───────────────────────────────────────────
export function useAllMarkets() {
  const { data: count, isLoading: countLoading } = useMarketCount()
  const marketCount = count ? Number(count) : 0

  const contracts = Array.from({ length: marketCount }, (_, i) => ({
    ...contractConfig,
    functionName: "getMarket" as const,
    args: [BigInt(i)] as const,
  }))

  const bettorContracts = Array.from({ length: marketCount }, (_, i) => ({
    ...contractConfig,
    functionName: "getMarketBettors" as const,
    args: [BigInt(i)] as const,
  }))

  const marketsResult = useReadContracts({
    contracts,
    query: {
      enabled: marketCount > 0,
      refetchInterval: 15_000,
    },
  })

  const bettorsResult = useReadContracts({
    contracts: bettorContracts,
    query: {
      enabled: marketCount > 0,
      refetchInterval: 15_000,
    },
  })

  const markets: Market[] = []
  if (marketsResult.data) {
    for (let i = 0; i < marketsResult.data.length; i++) {
      const r = marketsResult.data[i]
      if (r.status === "success" && r.result) {
        const d = r.result as unknown as {
          question: string
          deadline: bigint
          totalYesPool: bigint
          totalNoPool: bigint
          resolved: boolean
          outcome: boolean
          creator: string
          createdAt: bigint
        }
        const bettorData = bettorsResult.data?.[i]
        markets.push({
          id: i,
          question: d.question,
          deadline: d.deadline,
          totalYesPool: d.totalYesPool,
          totalNoPool: d.totalNoPool,
          resolved: d.resolved,
          outcome: d.outcome,
          creator: d.creator,
          createdAt: d.createdAt,
          bettorCount: bettorData?.status === "success" ? (bettorData.result as unknown as string[]).length : 0,
        })
      }
    }
  }

  return {
    markets,
    isLoading: countLoading || marketsResult.isLoading,
    error: marketsResult.error,
    refetch: marketsResult.refetch,
  }
}

// ── Read: User's Bet on a Market ────────────────────────────────
export function useUserBet(marketId: number, address: `0x${string}` | undefined) {
  const result = useReadContract({
    ...contractConfig,
    functionName: "getBet",
    args: address ? [BigInt(marketId), address] : undefined,
    query: { enabled: !!address },
  })

  const bet: Bet | undefined = result.data
    ? {
        yesAmount: result.data.yesAmount,
        noAmount: result.data.noAmount,
        claimed: result.data.claimed,
      }
    : undefined

  return { bet, isLoading: result.isLoading, refetch: result.refetch }
}

// ── Read: Payout calculation ────────────────────────────────────
export function useCalculatePayout(marketId: number, address: `0x${string}` | undefined) {
  return useReadContract({
    ...contractConfig,
    functionName: "calculatePayout",
    args: address ? [BigInt(marketId), address] : undefined,
    query: { enabled: !!address },
  })
}

// ── Write: Create Market ────────────────────────────────────────
export function useCreateMarket() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const create = (question: string, deadline: number) => {
    writeContract({
      ...contractConfig,
      functionName: "createMarket",
      args: [question, BigInt(deadline)],
    })
  }

  return { create, hash, isPending, isConfirming, isSuccess, error, reset }
}

// ── Write: Place Bet ────────────────────────────────────────────
export function usePlaceBet() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const placeBet = (marketId: number, position: boolean, amountEth: string) => {
    writeContract({
      ...contractConfig,
      functionName: "placeBet",
      args: [BigInt(marketId), position],
      value: parseEther(amountEth),
    })
  }

  return { placeBet, hash, isPending, isConfirming, isSuccess, error, reset }
}

// ── Write: Claim Winnings ───────────────────────────────────────
export function useClaimWinnings() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const claim = (marketId: number) => {
    writeContract({
      ...contractConfig,
      functionName: "claimWinnings",
      args: [BigInt(marketId)],
    })
  }

  return { claim, hash, isPending, isConfirming, isSuccess, error, reset }
}

// ── Write: Resolve Market (admin) ───────────────────────────────
export function useResolveMarket() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const resolve = (marketId: number, outcome: boolean) => {
    writeContract({
      ...contractConfig,
      functionName: "resolveMarket",
      args: [BigInt(marketId), outcome],
    })
  }

  return { resolve, hash, isPending, isConfirming, isSuccess, error, reset }
}
