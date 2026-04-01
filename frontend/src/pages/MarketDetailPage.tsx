import { useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PoolBar } from "@/components/PoolBar"
import { BrutalistSparkline } from "@/components/BrutalistSparkline"
import { cn } from "@/lib/utils"
import { useCountdown } from "@/hooks/useCountdown"
import { formatEther } from "viem"
import { FadeIn } from "@/components/FadeIn"
import {
  ArrowLeft, Clock, Trophy, TrendingUp, TrendingDown,
  Users, Zap, Info, TerminalSquare
} from "lucide-react"
import { toast } from "sonner"

import { MOCK_MARKETS } from "@/lib/mock-data"

const MOCK_LEADERBOARD = [
  { rank: 1, name: "oracle.init", position: "Yes", amount: 2000000000000000000n },
  { rank: 2, name: "vitalik.init", position: "No", amount: 1500000000000000000n },
  { rank: 3, name: "satoshi.init", position: "Yes", amount: 1200000000000000000n },
  { rank: 4, name: "alice.init", position: "Yes", amount: 800000000000000000n },
  { rank: 5, name: "bob.init", position: "No", amount: 500000000000000000n },
]

const MOCK_ACTIVITY = [
  { name: "delphi.init", action: "bet Yes", amount: "0.5 ETH", time: "2m ago" },
  { name: "pythia.init", action: "bet No", amount: "0.3 ETH", time: "8m ago" },
  { name: "oracle.init", action: "bet Yes", amount: "1.0 ETH", time: "23m ago" },
  { name: "alice.init", action: "bet Yes", amount: "0.2 ETH", time: "1h ago" },
  { name: "bob.init", action: "bet No", amount: "0.5 ETH", time: "2h ago" },
]

export function MarketDetailPage() {
  const { id } = useParams()
  const market = MOCK_MARKETS.find((m) => m.id === parseInt(id || "0")) || MOCK_MARKETS[0]

  const [amount, setAmount] = useState("")
  const [position, setPosition] = useState<boolean>(true)
  
  const countdown = useCountdown(market.deadline)
  const total = market.totalYesPool + market.totalNoPool

  // Payout calculator
  const payout = useMemo(() => {
    const betAmount = parseFloat(amount)
    if (!betAmount || betAmount <= 0) return null

    const betWei = BigInt(Math.floor(betAmount * 1e18))
    const winningPool = position ? market.totalYesPool + betWei : market.totalNoPool + betWei
    const totalPool = total + betWei
    const grossPayout = (betWei * totalPool) / winningPool
    const fee = (grossPayout * 2n) / 100n
    const netPayout = grossPayout - fee
    const multiplier = Number(netPayout) / Number(betWei)

    return {
      gross: parseFloat(formatEther(grossPayout)).toFixed(4),
      fee: parseFloat(formatEther(fee)).toFixed(4),
      net: parseFloat(formatEther(netPayout)).toFixed(4),
      multiplier: multiplier.toFixed(2),
      profit: parseFloat(formatEther(netPayout - betWei)).toFixed(4),
    }
  }, [amount, position, market.totalYesPool, market.totalNoPool, total])

  return (
    <div className="space-y-8">
      {/* EXPIRED DIAGONAL STAMP (Must be outside FadeIn to avoid transform breaking fixed position) */}
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
            
            {/* Sparkline Chart */}
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
          <div className="brutalist-card bg-black p-6 sticky top-24">
            <h2 className="mb-6 flex items-center gap-2 font-technical text-[14px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-4">
              <TerminalSquare className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
              TRANSACTION INTERFACE
            </h2>

            <div className="space-y-6">
              {/* Position buttons */}
              <div className="space-y-2">
                <label className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#888]">
                  SELECT POSITION
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPosition(true)}
                    disabled={countdown.expired}
                    aria-pressed={position}
                    className={cn(
                      "flex flex-col items-center gap-1 border-[2px] p-4 transition-all",
                      countdown.expired ? "opacity-50 cursor-not-allowed" : "",
                      position
                        ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                        : "border-[#333] bg-transparent text-[#555] hover:border-[#CCFF00] hover:text-[#CCFF00]"
                    )}
                  >
                    <TrendingUp className="size-5 mb-1" strokeWidth={2.5} />
                    <span className="font-technical text-[14px] font-black uppercase tracking-widest">YES</span>
                    <span className="font-technical text-[10px] font-bold opacity-70">
                      {total > 0n ? Number((market.totalYesPool * 100n) / total) : 50}%
                    </span>
                  </button>
                  <button
                    onClick={() => setPosition(false)}
                    disabled={countdown.expired}
                    aria-pressed={!position}
                    className={cn(
                      "flex flex-col items-center gap-1 border-[2px] p-4 transition-all",
                      countdown.expired ? "opacity-50 cursor-not-allowed" : "",
                      !position
                        ? "border-[#FF2A2A] bg-[#FF2A2A] text-white"
                        : "border-[#333] bg-transparent text-[#555] hover:border-[#FF2A2A] hover:text-[#FF2A2A]"
                    )}
                  >
                    <TrendingDown className="size-5 mb-1" strokeWidth={2.5} />
                    <span className="font-technical text-[14px] font-black uppercase tracking-widest">NO</span>
                    <span className="font-technical text-[10px] font-bold opacity-70">
                      {total > 0n ? Number((market.totalNoPool * 100n) / total) : 50}%
                    </span>
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-3">
                <label className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#888]" htmlFor="bet-amount">
                  INPUT LIQUIDITY (ETH)
                </label>
                <Input
                  id="bet-amount"
                  type="number"
                  placeholder="0.1"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={countdown.expired}
                  className={cn(
                    "h-12 rounded-none border-[2px] bg-black px-4 font-sans text-xl font-black text-white placeholder:text-[#333] focus-visible:ring-0",
                    countdown.expired ? "border-[#333] opacity-50 cursor-not-allowed" : "border-[#333] focus-visible:border-[#CCFF00]"
                  )}
                />
                {/* Quick amount buttons */}
                <div className="flex gap-2">
                  {["0.1", "0.5", "1.0", "MAX"].map((v) => (
                    <button
                      key={v}
                      disabled={countdown.expired}
                      onClick={() => setAmount(v === "MAX" ? "10.0" : v)}
                      className={cn(
                        "flex-1 border-[1.5px] py-1.5 font-technical text-[11px] font-bold uppercase tracking-widest transition-all",
                        countdown.expired ? "opacity-50 cursor-not-allowed" : "",
                        amount === (v === "MAX" ? "10.0" : v)
                          ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                          : "border-[#333] text-[#888] hover:border-[#CCFF00] hover:text-[#CCFF00]"
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-[#333]" />

              {/* Payout calculator */}
              <div className="space-y-3 font-technical text-[11px] font-bold uppercase tracking-widest">
                <div className="flex justify-between">
                  <span className="text-[#888]">POSITION</span>
                  <span className={cn(position ? "text-[#CCFF00]" : "text-[#FF2A2A]")}>
                    {position ? "LONG YES" : "SHORT NO"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">NETWORK FEE</span>
                  <span className="text-white">2.0%</span>
                </div>

                {payout && (
                  <>
                    <div className="h-px w-full bg-[#333] my-2" />
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1.5 text-[#888]">
                        <Info className="size-3" />
                        EST. RETURN
                      </span>
                      <span className="text-[#CCFF00]">{payout.net} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888]">PROFIT</span>
                      <span className="text-white">+{payout.profit} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888]">MULTIPLIER</span>
                      <span className="text-white">{payout.multiplier}X</span>
                    </div>
                  </>
                )}
              </div>

              {/* Submit */}
              <Button
                className={cn(
                  "h-14 w-full font-technical text-[14px]",
                  countdown.expired ? "bg-[#333] text-[#888] cursor-not-allowed border-[2px] border-[#333] rounded-none hover:bg-[#333]" : "btn-acid"
                )}
                disabled={countdown.expired || !amount || Number(amount) <= 0}
                onClick={() => {
                  toast.success("TX_EXECUTED_SUCCESSFULLY", {
                    description: `-> Dest: ${position ? "YES_POOL" : "NO_POOL"}\n-> Value: ${amount} ETH\n-> Block: 13,094,882`,
                    duration: 5000,
                  })
                }}
              >
                {countdown.expired 
                  ? "SYSTEM_HALTED[RESOLVED]"
                  : payout
                    ? `EXECUTE [ ${amount} ETH -> ${position ? "YES" : "NO"} ]`
                    : "AWAITING VALUE..."
                }
              </Button>

              {/* Auto-sign hint */}
              <div className="flex items-start gap-3 border border-[#333] bg-[#050505] p-4">
                <Zap className="mt-0.5 size-4 shrink-0 text-[#CCFF00]" />
                <p className="font-technical text-[10px] uppercase leading-relaxed text-[#888]">
                  <span className="text-[#CCFF00] font-bold">1-TAP SIGNING</span> available. Enable in settings to execute transactions without RPC popup interruptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </FadeIn>
    </div>
  )
}
