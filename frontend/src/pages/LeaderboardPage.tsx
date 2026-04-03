import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useDocTitle } from "@/hooks/useDocTitle"
import { FadeIn } from "@/components/FadeIn"
import { cn } from "@/lib/utils"
import { Trophy, Crown, Medal, TrendingUp, Coins, Users } from "lucide-react"
import { useMoveAllMarkets } from "@/hooks/useMoveContract"
import { useInitUsernames, formatAddress } from "@/hooks/useInitUsername"
import { UINIT_DECIMALS, INITIA_REST_URL, fetchBettors, fetchBet } from "@/lib/move"
import { getMarketStatus } from "@/types/market"
import { useQuery } from "@tanstack/react-query"

function formatUinit(uinit: bigint, decimals = 2): string {
  return (Number(uinit) / 10 ** UINIT_DECIMALS).toFixed(decimals)
}

interface LeaderboardEntry {
  address: string
  totalWagered: bigint
  totalWon: bigint
  wins: number
  losses: number
  activeBets: number
  winRate: number
}

export function LeaderboardPage() {
  useDocTitle("Leaderboard")
  const { data: markets, isLoading: marketsLoading } = useMoveAllMarkets()

  // Fetch all bettors from all markets using the get_bettors view function,
  // then fetch each bettor's bet details to build real leaderboard data.
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard", markets?.length],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      if (!markets || markets.length === 0) return []

      const entries = new Map<string, LeaderboardEntry>()

      // For each market, fetch the bettors list, then each bettor's bet
      for (const market of markets) {
        let bettorAddrs: string[]
        try {
          bettorAddrs = await fetchBettors(INITIA_REST_URL, market.id)
        } catch {
          continue
        }

        const status = getMarketStatus(market)

        // Fetch all bets in parallel for this market
        const betResults = await Promise.allSettled(
          bettorAddrs.map(async (addr) => {
            const rawBet = await fetchBet(INITIA_REST_URL, market.id, addr)
            return { addr, rawBet }
          }),
        )

        for (const result of betResults) {
          if (result.status !== "fulfilled") continue
          const { addr, rawBet } = result.value
          const yesAmount = BigInt(rawBet.yesAmount)
          const noAmount = BigInt(rawBet.noAmount)
          if (yesAmount === 0n && noAmount === 0n) continue

          if (!entries.has(addr)) {
            entries.set(addr, {
              address: addr,
              totalWagered: 0n,
              totalWon: 0n,
              wins: 0,
              losses: 0,
              activeBets: 0,
              winRate: 0,
            })
          }

          const entry = entries.get(addr)!
          entry.totalWagered += yesAmount + noAmount

          if (market.resolved) {
            const isWinner =
              (market.outcome && yesAmount > 0n) ||
              (!market.outcome && noAmount > 0n)
            if (isWinner) {
              entry.wins += 1
              // Approximate winnings from pool proportions
              const winningPool = market.outcome ? market.totalYesPool : market.totalNoPool
              const winBet = market.outcome ? yesAmount : noAmount
              const totalPool = market.totalYesPool + market.totalNoPool
              if (winningPool > 0n) {
                entry.totalWon += (winBet * totalPool) / winningPool
              }
            } else {
              entry.losses += 1
            }
          } else if (status === "open" || status === "closed") {
            entry.activeBets += 1
          }
        }
      }

      const result = Array.from(entries.values())
      result.forEach((e) => {
        const total = e.wins + e.losses
        e.winRate = total > 0 ? Math.round((e.wins / total) * 100) : 0
      })
      // Sort by total wagered (volume), then by win rate
      result.sort((a, b) => {
        const volumeDiff = Number(b.totalWagered - a.totalWagered)
        if (volumeDiff !== 0) return volumeDiff
        return b.winRate - a.winRate
      })
      return result
    },
    enabled: !!markets && markets.length > 0,
    staleTime: 30_000,
  })

  const addresses = useMemo(
    () => leaderboard?.map((e) => e.address) ?? [],
    [leaderboard],
  )
  const { data: usernames } = useInitUsernames(addresses)

  const isLoading = marketsLoading || leaderboardLoading

  const totalVolume = useMemo(
    () => markets?.reduce((acc, m) => acc + m.totalYesPool + m.totalNoPool, 0n) ?? 0n,
    [markets],
  )
  const totalBettors = useMemo(
    () => markets?.reduce((acc, m) => acc + (m.bettorCount ?? 0), 0) ?? 0,
    [markets],
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="space-y-3 mb-4">
          <div className="inline-flex items-center gap-2 border border-[#333] bg-black px-3 py-1">
            <Trophy className="size-3 text-[#CCFF00]" />
            <span className="font-technical text-[10px] font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
              Rankings
            </span>
          </div>
          <h1 className="font-sans text-[clamp(40px,6vw,72px)] font-black uppercase leading-[0.9] tracking-tighter text-white">
            LEADER<span className="text-[#CCFF00]">BOARD.</span>
          </h1>
          <p className="font-technical text-[14px] leading-[1.6] text-[#888] uppercase max-w-[500px]">
            Top predictors on the Pythia protocol, ranked by volume and accuracy.
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="size-4 text-[#888]" strokeWidth={2.5} />
              <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">PARTICIPANTS</p>
            </div>
            <p className="font-sans text-3xl font-black text-white">
              {isLoading ? "—" : totalBettors}
            </p>
          </div>
          <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
              <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">TOTAL VOLUME</p>
            </div>
            <p className="font-sans text-3xl font-black text-[#CCFF00]">
              {isLoading ? "—" : formatUinit(totalVolume)}{" "}
              <span className="text-xl text-[#555]">INIT</span>
            </p>
          </div>
          <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-4 text-white" strokeWidth={2.5} />
              <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">MARKETS</p>
            </div>
            <p className="font-sans text-3xl font-black text-white">
              {isLoading ? "—" : markets?.length ?? 0}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Leaderboard table */}
      <FadeIn delay={0.1}>
        <div className="brutalist-card bg-black p-6">
          <div className="mb-6 flex items-center justify-between border-b border-[#333] pb-4">
            <h2 className="font-technical text-[14px] font-bold tracking-widest uppercase text-white flex items-center gap-2">
              <Crown className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
              TOP PREDICTORS
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-[#1a1a1a] animate-pulse border border-[#333]" />
              ))}
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-technical text-[14px] font-bold uppercase tracking-widest text-[#555]">
                NO PREDICTIONS YET.
              </p>
              <p className="mt-2 font-technical text-[12px] uppercase tracking-widest text-[#444]">
                Be the first — <Link to="/markets" className="text-[#CCFF00] underline">place a bet now</Link>.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-[40px_1fr_120px_100px] sm:grid-cols-[40px_1fr_120px_100px_100px] gap-4 px-4 py-2 font-technical text-[10px] font-bold uppercase tracking-widest text-[#555]">
                <span>RANK</span>
                <span>PREDICTOR</span>
                <span className="text-right">VOLUME</span>
                <span className="text-right hidden sm:block">MARKETS</span>
                <span className="text-right">WIN RATE</span>
              </div>

              {leaderboard.map((entry, i) => {
                const rank = i + 1
                const username = usernames?.get(entry.address)
                const RankIcon = rank === 1 ? Crown : rank <= 3 ? Medal : null

                return (
                  <div
                    key={entry.address}
                    className={cn(
                      "grid grid-cols-[40px_1fr_120px_100px] sm:grid-cols-[40px_1fr_120px_100px_100px] gap-4 items-center px-4 py-3 border-2 transition-all",
                      rank === 1
                        ? "border-[#CCFF00] bg-[#CCFF00]/5"
                        : rank <= 3
                          ? "border-[#CCFF00]/30 bg-[#CCFF00]/[0.02]"
                          : "border-[#333] bg-[#050505]"
                    )}
                  >
                    <span className={cn(
                      "font-sans text-xl font-black",
                      rank === 1 ? "text-[#CCFF00]" : rank <= 3 ? "text-white" : "text-[#555]"
                    )}>
                      {RankIcon ? (
                        <RankIcon className={cn("size-5", rank === 1 ? "text-[#CCFF00]" : "text-[#888]")} strokeWidth={2.5} />
                      ) : (
                        `#${rank}`
                      )}
                    </span>

                    <span className="font-technical text-[12px] font-bold uppercase tracking-widest text-white truncate">
                      {formatAddress(entry.address, username)}
                    </span>

                    <span className="font-technical text-[12px] font-bold uppercase tracking-widest text-white text-right">
                      {formatUinit(entry.totalWagered)} <span className="text-[#555]">INIT</span>
                    </span>

                    <span className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#888] text-right hidden sm:block">
                      {entry.wins + entry.losses + entry.activeBets} <span className="text-[#555]">({entry.wins}W</span>)
                    </span>

                    <span className={cn(
                      "font-technical text-[12px] font-bold uppercase tracking-widest text-right",
                      entry.winRate >= 60 ? "text-[#CCFF00]" : entry.winRate >= 40 ? "text-white" : "text-[#FF2A2A]"
                    )}>
                      {entry.winRate > 0 ? `${entry.winRate}%` : "—"}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  )
}
