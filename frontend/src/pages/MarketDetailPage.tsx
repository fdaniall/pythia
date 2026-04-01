import { useParams, Link } from "react-router-dom"
import { useDocTitle } from "@/hooks/useDocTitle"
import { PoolBar } from "@/components/PoolBar"
import { BrutalistSparkline } from "@/components/BrutalistSparkline"
import { BetForm } from "@/components/bet-form"
import { cn } from "@/lib/utils"
import { useCountdown } from "@/hooks/useCountdown"
import { formatEther } from "viem"
import { FadeIn } from "@/components/FadeIn"
import {
  ArrowLeft, Clock, Trophy, Users, Zap, TerminalSquare, Share2, Check
} from "lucide-react"
import { useState } from "react"
import { MOCK_MARKETS, MOCK_LEADERBOARD, MOCK_ACTIVITY } from "@/lib/mock-data"

// Deterministic sparkline data per market (seeded by id)
function generateSparkline(seed: number): number[] {
  let value = 30 + (seed * 17) % 40
  const points: number[] = [value]
  for (let i = 1; i < 20; i++) {
    // Simple seeded pseudo-random walk
    const hash = Math.sin(seed * 1000 + i * 137.5) * 10000
    const delta = (hash - Math.floor(hash)) * 20 - 8
    value = Math.max(10, Math.min(95, value + delta))
    points.push(Math.round(value))
  }
  return points
}

function ShareButton({ question }: { question: string }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.href
    const text = `${question} — Predict now on Pythia`

    if (navigator.share) {
      try {
        await navigator.share({ title: "Pythia Market", text, url })
        return
      } catch { /* user cancelled */ }
    }

    await navigator.clipboard.writeText(`${text}\n${url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={share}
      className="flex items-center gap-1.5 text-[#888] hover:text-[#CCFF00] transition-colors"
    >
      {copied ? <Check className="size-3.5" strokeWidth={2.5} /> : <Share2 className="size-3.5" strokeWidth={2.5} />}
      {copied ? "COPIED" : "SHARE"}
    </button>
  )
}

export function MarketDetailPage() {
  const { id } = useParams()
  const market = MOCK_MARKETS.find((m) => m.id === parseInt(id || "0"))

  useDocTitle(market?.question ?? "Market Not Found")
  const countdown = useCountdown(market?.deadline ?? 0n)
  const total = (market?.totalYesPool ?? 0n) + (market?.totalNoPool ?? 0n)

  if (!market) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        {/* Glitch error code */}
        <div className="mb-6 border-2 border-[#FF2A2A] px-8 py-3">
          <span className="font-mono text-[clamp(40px,8vw,72px)] font-black text-[#FF2A2A] leading-none">
            404
          </span>
        </div>

        {/* Terminal block */}
        <div className="w-full max-w-md border-2 border-[#333] bg-[#050505] mb-8">
          <div className="flex items-center gap-2 border-b border-[#333] px-3 py-2 bg-[#0a0a0a]">
            <div className="size-2 bg-[#FF2A2A]" />
            <div className="size-2 bg-[#555]" />
            <div className="size-2 bg-[#555]" />
            <span className="ml-2 font-mono text-[9px] text-[#555] uppercase">pythia://market-resolver</span>
          </div>
          <div className="p-4 font-mono text-[11px] leading-[2] text-left">
            <p><span className="text-[#CCFF00]">&gt;</span> <span className="text-[#888]">getMarket(id: {id})</span></p>
            <p><span className="text-[#FF2A2A]">&gt;</span> <span className="text-[#FF2A2A]">ERR: MARKET_NOT_FOUND</span></p>
            <p><span className="text-[#FF2A2A]">&gt;</span> <span className="text-[#FF2A2A]">No contract deployed at index {id}</span></p>
            <p><span className="text-[#555]">&gt;</span> <span className="text-[#555]">Pool does not exist or has been liquidated.</span></p>
            <p><span className="text-[#CCFF00]">&gt;</span> <span className="text-[#CCFF00]">Redirecting to market index...</span></p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/markets"
            className="btn-acid inline-flex h-11 items-center px-6 font-technical text-[12px] no-underline"
          >
            <ArrowLeft className="mr-2 size-4" strokeWidth={2.5} />
            Market Index
          </Link>
          <Link
            to="/create"
            className="inline-flex h-11 items-center px-6 border-2 border-[#333] font-technical text-[12px] font-bold uppercase tracking-widest text-[#888] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-all no-underline"
          >
            Create Market
          </Link>
        </div>
      </div>
    )
  }

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
            <span className="text-[#333]">&middot;</span>
            <ShareButton question={market.question} />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="grid gap-8 lg:grid-cols-3 relative z-20 mt-8">
          {/* Left column: pool + activity */}
          <div className="space-y-8 lg:col-span-2 order-2 lg:order-1">
            {/* Pool visualization */}
            <div className="brutalist-card bg-black p-8">
              <h2 className="mb-6 flex items-center gap-2 font-technical text-[14px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-4">
                <TerminalSquare className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
                POOL DISTRIBUTION & VOLATILITY
              </h2>

              <div className="mb-8">
                <BrutalistSparkline data={generateSparkline(market.id)} height={120} />
              </div>

              <PoolBar yesPool={market.totalYesPool} noPool={market.totalNoPool} size="md" />

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="border border-[#333] bg-[#050505] p-4 flex flex-col items-center justify-center text-center">
                  <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#888]">TOTAL POOL</p>
                  <p className="mt-2 font-sans text-2xl font-black text-white">
                    {parseFloat(formatEther(total)).toFixed(1)} <span className="text-sm text-[#555]">INIT</span>
                  </p>
                </div>
                <div className="border border-[#CCFF00]/30 bg-[#CCFF00]/5 p-4 flex flex-col items-center justify-center text-center">
                  <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">YES POOL</p>
                  <p className="mt-2 font-sans text-2xl font-black text-[#CCFF00]">
                    {parseFloat(formatEther(market.totalYesPool)).toFixed(1)} <span className="text-sm text-[#CCFF00]/50">INIT</span>
                  </p>
                </div>
                <div className="border border-[#FF2A2A]/30 bg-[#FF2A2A]/5 p-4 flex flex-col items-center justify-center text-center">
                  <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#FF2A2A]">NO POOL</p>
                  <p className="mt-2 font-sans text-2xl font-black text-[#FF2A2A]">
                    {parseFloat(formatEther(market.totalNoPool)).toFixed(1)} <span className="text-sm text-[#FF2A2A]/50">INIT</span>
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
                          {parseFloat(formatEther(entry.amount)).toFixed(1)} INIT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: bet form — shown first on mobile */}
          <div className="space-y-6 order-1 lg:order-2">
            <BetForm market={market} total={total} expired={countdown.expired} />
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
