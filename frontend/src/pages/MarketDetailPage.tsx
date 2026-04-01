import { useParams, Link } from "react-router-dom"
import { PoolBar } from "@/components/PoolBar"
import { BrutalistSparkline } from "@/components/BrutalistSparkline"
import { BetForm } from "@/components/bet-form"
import { cn } from "@/lib/utils"
import { useCountdown } from "@/hooks/useCountdown"
import { formatEther } from "viem"
import { FadeIn } from "@/components/FadeIn"
import {
  ArrowLeft, Clock, Trophy, Users, Zap, TerminalSquare
} from "lucide-react"
import { MOCK_MARKETS, MOCK_LEADERBOARD, MOCK_ACTIVITY } from "@/lib/mock-data"

export function MarketDetailPage() {
  const { id } = useParams()
  const market = MOCK_MARKETS.find((m) => m.id === parseInt(id || "0"))

  if (!market) {
    return (
      <div className="brutalist-card flex flex-col items-center justify-center bg-black py-24 text-center">
        <p className="font-technical text-[14px] font-bold uppercase tracking-widest text-[#888]">
          ERR 404: MARKET NOT FOUND.
        </p>
        <Link to="/markets" className="mt-4 font-technical text-[12px] text-[#CCFF00] underline uppercase">
          BACK_TO_INDEX
        </Link>
      </div>
    )
  }

  const countdown = useCountdown(market.deadline)
  const total = market.totalYesPool + market.totalNoPool

  return (
    <div className="space-y-8">
      {/* EXPIRED DIAGONAL STAMP */}
      {countdown.expired && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="transform -rotate-12 border-4 border-[#FF2A2A] text-[#FF2A2A] p-4 text-[clamp(40px,8vw,80px)] font-black tracking-widest uppercase opacity-80 mix-blend-screen bg-black/60 shadow-[8px_8px_0_0_#FF2A2A]">
            CLASSIFIED: EXECUTED
          </div>
        </div>
      )}

      <FadeIn>
        <Link
          to="/markets"
          className="inline-flex items-center gap-2 font-technical text-[10px] font-bold uppercase tracking-widest text-[#888] transition-colors hover:text-white relative z-20"
        >
          <ArrowLeft className="size-4" strokeWidth={2.5} />
          BACK_TO_MARKET_INDEX
        </Link>

        {/* Market title + countdown */}
        <div className="mt-8 border-l-4 border-[#CCFF00] pl-6 py-2 relative z-20">
          <h1 className="font-sans text-[clamp(32px,4vw,48px)] font-black uppercase leading-[1.1] tracking-tighter text-white">
            {market.question}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3 font-technical text-[11px] font-bold uppercase tracking-widest text-[#888]">
            <div className="flex items-center justify-center gap-1.5 border-2 border-transparent bg-[#CCFF00] px-2.5 py-1 text-[10px] text-black">
              <span className="size-1.5 bg-black animate-pulse" />
              {countdown.expired ? "ENDED" : "LIVE"}
            </div>
            <span className="text-white">MARKET #{id}</span>
            <span className="text-[#333]">&middot;</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-[#CCFF00]" strokeWidth={2.5} />
              {countdown.expired ? "EXPIRED" : countdown.label + " LEFT"}
            </span>
            <span className="text-[#333]">&middot;</span>
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" strokeWidth={2.5} />
              {market.bettorCount} BETTORS
            </span>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="grid gap-8 lg:grid-cols-3 relative z-20 mt-8">
          {/* Left column: pool + activity */}
          <div className="space-y-8 lg:col-span-2">
            {/* Pool visualization */}
            <div className="brutalist-card bg-black p-8">
              <h2 className="mb-6 flex items-center gap-2 font-technical text-[14px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-4">
                <TerminalSquare className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
                POOL DISTRIBUTION & VOLATILITY
              </h2>

              <div className="mb-8">
                <BrutalistSparkline data={[40, 42, 45, 38, 50, 60, 58, 65, 70, 68, 75, 80, 78, 85, 90, 88, 85, 87, 89, 92]} height={120} />
              </div>

              <PoolBar yesPool={market.totalYesPool} noPool={market.totalNoPool} size="md" />

              <div className="mt-8 grid grid-cols-3 gap-6">
                <div className="border border-[#333] bg-[#050505] p-4 flex flex-col items-center justify-center text-center">
                  <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#888]">TOTAL POOL</p>
                  <p className="mt-2 font-sans text-2xl font-black text-white">
                    {parseFloat(formatEther(total)).toFixed(1)} <span className="text-sm text-[#555]">ETH</span>
                  </p>
                </div>
                <div className="border border-[#CCFF00]/30 bg-[#CCFF00]/5 p-4 flex flex-col items-center justify-center text-center">
                  <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">YES POOL</p>
                  <p className="mt-2 font-sans text-2xl font-black text-[#CCFF00]">
                    {parseFloat(formatEther(market.totalYesPool)).toFixed(1)} <span className="text-sm text-[#CCFF00]/50">ETH</span>
                  </p>
                </div>
                <div className="border border-[#FF2A2A]/30 bg-[#FF2A2A]/5 p-4 flex flex-col items-center justify-center text-center">
                  <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#FF2A2A]">NO POOL</p>
                  <p className="mt-2 font-sans text-2xl font-black text-[#FF2A2A]">
                    {parseFloat(formatEther(market.totalNoPool)).toFixed(1)} <span className="text-sm text-[#FF2A2A]/50">ETH</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Recent activity */}
              <div className="brutalist-card bg-black p-6">
                <h2 className="mb-4 flex items-center gap-2 font-technical text-[12px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-3">
                  <Zap className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
                  LATEST ACTIVITY
                </h2>
                <div className="space-y-3">
                  {MOCK_ACTIVITY.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-l-2 border-[#333] bg-[#0a0a0a] px-3 py-2"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-technical text-[11px] font-bold tracking-widest text-white">[{a.name}]</span>
                        <span className={cn(
                          "font-technical text-[10px] font-bold uppercase tracking-widest",
                          a.action.includes("Yes") ? "text-[#CCFF00]" : "text-[#FF2A2A]"
                        )}>
                          {a.action}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-sans text-[14px] font-black text-white">{a.amount}</span>
                        <span className="font-technical text-[9px] uppercase tracking-widest text-[#555]">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="brutalist-card bg-black p-6">
                <h2 className="mb-4 flex items-center gap-2 font-technical text-[12px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-3">
                  <Trophy className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
                  LEADERBOARD
                </h2>
                <div className="space-y-2">
                  {MOCK_LEADERBOARD.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center justify-between border-b border-[#111] py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "font-technical text-[14px] font-black",
                          entry.rank === 1 ? "text-[#CCFF00]" : "text-[#555]"
                        )}>
                          #{entry.rank}
                        </span>
                        <span className="font-technical text-[11px] font-bold tracking-widest text-white truncate max-w-[80px]">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "border px-1.5 py-0.5 font-technical text-[9px] font-bold uppercase",
                          entry.position === "Yes" ? "bg-[#CCFF00] text-black border-[#CCFF00]" : "bg-[#FF2A2A] text-white border-[#FF2A2A]"
                        )}>
                          {entry.position}
                        </span>
                        <span className="font-sans text-[14px] font-black text-white">
                          {parseFloat(formatEther(entry.amount)).toFixed(1)} ETH
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: bet form */}
          <div className="space-y-6">
            <BetForm market={market} total={total} expired={countdown.expired} />
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
