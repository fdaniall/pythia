import { Link } from "react-router-dom"
import { useDocTitle } from "@/hooks/useDocTitle"
import { FadeIn } from "@/components/FadeIn"
import { cn } from "@/lib/utils"
import {
  BarChart3, Wallet, Trophy, TrendingUp, TrendingDown,
  ArrowRight, Clock, CheckCircle, Lock
} from "lucide-react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { Button } from "@/components/ui/button"
import { useMoveAllMarkets, useMoveClaimWinnings } from "@/hooks/useMoveContract"
import { formatUinit, INITIA_REST_URL, fetchBet, fetchCalculatePayout } from "@/lib/move"
import { getMarketStatus } from "@/types/market"
import { useCountdown } from "@/hooks/useCountdown"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import type { Market, Bet } from "@/types/market"

function MarketCountdown({ deadline }: { deadline: bigint }) {
  const countdown = useCountdown(deadline)
  return <>{countdown.expired ? "Resolved" : countdown.label + " left"}</>
}

interface Position {
  market: Market
  bet: Bet
  status: ReturnType<typeof getMarketStatus>
  isWinner: boolean
  isLoser: boolean
  totalBet: bigint
  mainPosition: "Yes" | "No"
  canClaim: boolean
  payout: bigint
}

export function PortfolioPage() {
  useDocTitle("Portfolio")
  const { isConnected, openConnect, initiaAddress } = useInterwovenKit()
  const { data: markets, isLoading: marketsLoading } = useMoveAllMarkets()
  const { mutate: claimWinnings } = useMoveClaimWinnings()
  const [claimingId, setClaimingId] = useState<number | null>(null)

  // Fetch bets for all markets for the connected user
  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ["portfolio", initiaAddress, markets?.length],
    queryFn: async (): Promise<Position[]> => {
      if (!markets || !initiaAddress) return []

      const betResults = await Promise.allSettled(
        markets.filter((m) => m.id >= 0).map(async (market): Promise<Position | null> => {
          const rawBet = await fetchBet(INITIA_REST_URL, market.id, initiaAddress)
          const yesAmount = BigInt(rawBet.yesAmount)
          const noAmount = BigInt(rawBet.noAmount)
          if (yesAmount === 0n && noAmount === 0n) return null

          const bet: Bet = { yesAmount, noAmount, claimed: rawBet.claimed }
          const status = getMarketStatus(market)
          const isWinner = market.resolved && (
            (market.outcome && yesAmount > 0n) || (!market.outcome && noAmount > 0n)
          )
          const isLoser = market.resolved && !isWinner
          const totalBet = yesAmount + noAmount
          const mainPosition = yesAmount >= noAmount ? "Yes" as const : "No" as const

          let payout = 0n
          if (market.resolved && isWinner && !bet.claimed) {
            try {
              const raw = await fetchCalculatePayout(INITIA_REST_URL, market.id, initiaAddress)
              payout = BigInt(raw)
            } catch { /* ignore */ }
          }

          return {
            market, bet, status, isWinner, isLoser, totalBet, mainPosition,
            canClaim: isWinner && !bet.claimed && payout > 0n,
            payout,
          }
        }),
      )

      return betResults
        .filter((r): r is PromiseFulfilledResult<Position | null> => r.status === "fulfilled")
        .map((r) => r.value)
        .filter((p): p is Position => p !== null)
    },
    enabled: !!initiaAddress && !!markets && markets.length > 0,
    refetchInterval: 15_000,
    staleTime: 10_000,
  })

  const activeBets = useMemo(() => positions?.filter(p => p.status === "open" || p.status === "closed") ?? [], [positions])
  const wonBets = useMemo(() => positions?.filter(p => p.isWinner) ?? [], [positions])
  const lostBets = useMemo(() => positions?.filter(p => p.isLoser) ?? [], [positions])
  const totalWagered = useMemo(() => positions?.reduce((acc, p) => acc + p.totalBet, 0n) ?? 0n, [positions])
  const winRate = wonBets.length + lostBets.length > 0
    ? Math.round((wonBets.length / (wonBets.length + lostBets.length)) * 100)
    : 0

  const isLoading = marketsLoading || positionsLoading

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <FadeIn>
          <div className="brutalist-card bg-black p-12 text-center max-w-[600px] mx-auto border-dashed">
            <Lock className="size-12 text-[#CCFF00] mx-auto mb-6 opacity-80" strokeWidth={1.5} />
            <h1 className="font-sans text-[clamp(24px,4vw,36px)] font-black uppercase leading-[1.1] tracking-tighter text-white mb-4">
              CONNECT TO VIEW
            </h1>
            <p className="font-technical text-[14px] leading-[1.6] text-[#888] uppercase mb-8">
              Connect your wallet to view your positions and claim winnings.
            </p>
            <Button
              className="btn-acid h-14 w-full font-technical text-[14px]"
              onClick={openConnect}
            >
              <Wallet className="mr-2 size-4" strokeWidth={2.5} />
              CONNECT WALLET
            </Button>
          </div>
        </FadeIn>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="space-y-3 mb-4">
          <div className="inline-flex items-center gap-2 border border-[#333] bg-black px-3 py-1">
            <BarChart3 className="size-3 text-[#CCFF00]" />
            <span className="font-technical text-[10px] font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
              User Portfolio
            </span>
          </div>
          <h1 className="font-sans text-[clamp(40px,6vw,72px)] font-black uppercase leading-[0.9] tracking-tighter text-white">
            YOUR <span className="text-[#CCFF00]">POSITIONS.</span>
          </h1>
          <p className="font-technical text-[14px] leading-[1.6] text-[#888] uppercase max-w-[500px]">
            Track active bets and historical performance on-chain.
          </p>
        </div>
      </FadeIn>

      {/* Stats overview */}
      <FadeIn delay={0.1}>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-[#888]" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">ACTIVE BETS</p>
          </div>
          <p className="font-sans text-3xl font-black text-white">{isLoading ? "—" : activeBets.length}</p>
        </div>
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">WON</p>
          </div>
          <p className="font-sans text-3xl font-black text-[#CCFF00]">{isLoading ? "—" : wonBets.length}</p>
        </div>
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-4 text-white" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">WIN RATE</p>
          </div>
          <p className="font-sans text-3xl font-black text-white">{isLoading ? "—" : `${winRate}%`}</p>
        </div>
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="size-4 text-[#888]" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">TOTAL WAGERED</p>
          </div>
          <p className="font-sans text-3xl font-black text-white">
            {isLoading ? "—" : formatUinit(totalWagered)} <span className="text-xl text-[#555]">INIT</span>
          </p>
        </div>
      </div>
      </FadeIn>

      {/* Positions list */}
      <FadeIn delay={0.15}>
      <div className="brutalist-card bg-black p-6">
        <div className="mb-6 flex items-center justify-between border-b border-[#333] pb-4 bg-black">
          <h2 className="font-technical text-[14px] font-bold tracking-widest uppercase text-white">Positions</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#1a1a1a] animate-pulse border-2 border-[#333]" />
            ))}
          </div>
        ) : !positions || positions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-technical text-[14px] font-bold uppercase tracking-widest text-[#555]">
              YOU HAVEN'T MADE ANY PREDICTIONS YET.
            </p>
            <p className="mt-2 font-technical text-[12px] uppercase tracking-widest text-[#444]">
              Your positions will appear here once you place your first bet.{" "}
              <Link to="/markets" className="text-[#CCFF00] underline">Explore live markets</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((pos) => {
              const statusLabel = pos.isWinner ? "WON" : pos.isLoser ? "LOST" : "ACTIVE"
              const statusColor = pos.isWinner ? "text-[#CCFF00]" : pos.isLoser ? "text-[#FF2A2A]" : "text-white"
              const StatusIcon = pos.isWinner ? Trophy : pos.isLoser ? TrendingDown : Clock

              return (
                <Link
                  key={pos.market.id}
                  to={`/markets/${pos.market.id}`}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-[#333] bg-[#050505] p-4 transition-all hover:border-[#CCFF00] hover:bg-[#111]"
                >
                  <div className="flex-1 space-y-2">
                    <h3 className="font-sans text-[18px] font-black uppercase leading-tight text-white group-hover:text-[#CCFF00]">
                      {pos.market.question}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-technical text-[11px] font-bold uppercase tracking-widest text-[#888]">
                      <span className={cn(
                        "px-2 py-0.5 border-2",
                        pos.mainPosition === "Yes" ? "bg-[#CCFF00] text-black border-[#CCFF00]" : "bg-[#FF2A2A] text-white border-[#FF2A2A]"
                      )}>
                        {pos.mainPosition}
                      </span>
                      <span className="text-white">WAGER: {formatUinit(pos.totalBet)} INIT</span>
                      <span className="text-[#333]">&middot;</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3" />
                        <MarketCountdown deadline={pos.market.deadline} />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right flex flex-col gap-1 items-end">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon className={cn("size-3", statusColor)} strokeWidth={3} />
                        <span className={cn("font-technical text-[10px] font-bold tracking-widest uppercase", statusColor)}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {pos.canClaim ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setClaimingId(pos.market.id)
                          claimWinnings(
                            { marketId: pos.market.id },
                            { onSettled: () => setClaimingId(null) },
                          )
                        }}
                        disabled={claimingId === pos.market.id}
                        className={cn(
                          "ml-2 bg-[#CCFF00] text-black px-4 py-2 font-technical text-[12px] font-black uppercase tracking-widest hover:bg-white transition-colors",
                          claimingId === pos.market.id && "opacity-50"
                        )}
                      >
                        {claimingId === pos.market.id ? "CLAIMING..." : `CLAIM ${formatUinit(pos.payout)} INIT`}
                      </button>
                    ) : (
                      <div className="ml-2 border border-[#333] p-2 bg-black group-hover:border-[#CCFF00] transition-colors">
                        <ArrowRight className="size-4 text-[#555] group-hover:text-[#CCFF00]" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      </FadeIn>
    </div>
  )
}
