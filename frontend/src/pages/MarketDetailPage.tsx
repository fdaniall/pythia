import { useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PoolBar } from "@/components/PoolBar"
import { cn } from "@/lib/utils"
import { useCountdown } from "@/hooks/useCountdown"
import { formatEther } from "viem"
import { FadeIn } from "@/components/FadeIn"
import {
  ArrowLeft, Clock, Trophy, TrendingUp, TrendingDown,
  Users, Zap, Info,
} from "lucide-react"

// Mock — will be replaced with on-chain read
const MOCK_MARKET = {
  id: 0,
  question: "Will BTC hit $100K by April 10?",
  deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 3),
  totalYesPool: 5000000000000000000n,
  totalNoPool: 3000000000000000000n,
  resolved: false,
  outcome: false,
  creator: "0x1234567890abcdef1234567890abcdef12345678",
  createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
  bettorCount: 24,
}

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
  const [position, setPosition] = useState<boolean>(true)
  const [amount, setAmount] = useState("")

  const market = MOCK_MARKET
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
      <FadeIn>
      <Link
        to="/markets"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-oracle-soft"
      >
        <ArrowLeft className="size-3.5" />
        Back to Markets
      </Link>

      {/* Market title + countdown */}
      <div>
        <h1 className="font-oracle text-oracle-gradient text-2xl italic leading-snug md:text-3xl">
          {market.question}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="success" className="gap-1">
            <span className="animate-oracle-pulse size-1.5 rounded-full bg-yes" />
            Live
          </Badge>
          <span>Market #{id}</span>
          <span className="text-dim">&middot;</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {countdown.expired ? "Expired" : countdown.label + " left"}
          </span>
          <span className="text-dim">&middot;</span>
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {market.bettorCount} bettors
          </span>
        </div>
      </div>
      </FadeIn>

      <FadeIn delay={0.15}>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: pool + activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pool visualization */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrendingUp className="size-4 text-oracle" />
              Pool Distribution
            </h2>
            <PoolBar yesPool={market.totalYesPool} noPool={market.totalNoPool} size="md" />

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-[rgba(155,109,255,0.06)] p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Pool</p>
                <p className="font-oracle mt-0.5 text-lg italic text-gold">
                  {parseFloat(formatEther(total)).toFixed(1)} ETH
                </p>
              </div>
              <div className="rounded-lg bg-[rgba(34,197,94,0.06)] p-3 text-center">
                <p className="text-xs text-muted-foreground">Yes Pool</p>
                <p className="mt-0.5 text-lg font-semibold text-yes">
                  {parseFloat(formatEther(market.totalYesPool)).toFixed(1)} ETH
                </p>
              </div>
              <div className="rounded-lg bg-[rgba(239,68,68,0.06)] p-3 text-center">
                <p className="text-xs text-muted-foreground">No Pool</p>
                <p className="mt-0.5 text-lg font-semibold text-no">
                  {parseFloat(formatEther(market.totalNoPool)).toFixed(1)} ETH
                </p>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Zap className="size-4 text-gold" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {MOCK_ACTIVITY.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-[rgba(155,109,255,0.03)] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-full bg-oracle/10 text-[10px] font-bold text-oracle">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-foreground">{a.name}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      a.action.includes("Yes") ? "text-yes" : "text-no"
                    )}>
                      {a.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{a.amount}</span>
                    <span className="text-xs text-dim">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Trophy className="size-4 text-gold" />
              Leaderboard
            </h2>
            <div className="space-y-2">
              {MOCK_LEADERBOARD.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center justify-between rounded-lg bg-[rgba(155,109,255,0.03)] px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                      entry.rank === 1 && "bg-gold/15 text-gold",
                      entry.rank === 2 && "bg-[#C0C0C0]/15 text-[#C0C0C0]",
                      entry.rank === 3 && "bg-[#CD7F32]/15 text-[#CD7F32]",
                      entry.rank > 3 && "bg-oracle/10 text-muted-foreground",
                    )}>
                      {entry.rank}
                    </span>
                    <span className="text-sm font-medium text-foreground">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={entry.position === "Yes" ? "success" : "destructive"}
                      className="text-[10px]"
                    >
                      {entry.position}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {parseFloat(formatEther(entry.amount)).toFixed(1)} ETH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: bet form */}
        <div className="space-y-6">
          <div className="glass-card sticky top-20 rounded-xl p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Trophy className="size-4 text-gold" />
              Place Your Bet
            </h2>

            <div className="space-y-4">
              {/* Position buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPosition(true)}
                  aria-pressed={position}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg border px-4 py-3 transition-all",
                    position
                      ? "border-yes/30 bg-yes/10 glow-yes"
                      : "border-[rgba(155,109,255,0.1)] bg-transparent hover:border-yes/20"
                  )}
                >
                  <TrendingUp className={cn("size-4", position ? "text-yes" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-semibold", position ? "text-yes" : "text-muted-foreground")}>Yes</span>
                  <span className="text-[10px] text-muted-foreground">
                    {total > 0n ? Number((market.totalYesPool * 100n) / total) : 50}%
                  </span>
                </button>
                <button
                  onClick={() => setPosition(false)}
                  aria-pressed={!position}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg border px-4 py-3 transition-all",
                    !position
                      ? "border-no/30 bg-no/10 glow-no"
                      : "border-[rgba(155,109,255,0.1)] bg-transparent hover:border-no/20"
                  )}
                >
                  <TrendingDown className={cn("size-4", !position ? "text-no" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-semibold", !position ? "text-no" : "text-muted-foreground")}>No</span>
                  <span className="text-[10px] text-muted-foreground">
                    {total > 0n ? Number((market.totalNoPool * 100n) / total) : 50}%
                  </span>
                </button>
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="bet-amount">
                  Amount (ETH)
                </label>
                <Input
                  id="bet-amount"
                  type="number"
                  placeholder="0.1"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-oracle/10 bg-[rgba(155,109,255,0.04)] text-foreground placeholder:text-dim focus-visible:ring-oracle/30"
                />
                {/* Quick amount buttons */}
                <div className="flex gap-1.5">
                  {["0.1", "0.5", "1.0", "2.0"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className={cn(
                        "flex-1 rounded-md border py-1 text-xs font-medium transition-all",
                        amount === v
                          ? "border-oracle/30 bg-oracle/10 text-oracle"
                          : "border-oracle/8 text-muted-foreground hover:border-oracle/20 hover:text-foreground"
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-oracle/10" />

              {/* Payout calculator */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position</span>
                  <span className={cn("font-medium", position ? "text-yes" : "text-no")}>
                    {position ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform fee</span>
                  <span className="text-gold">2%</span>
                </div>

                {payout && (
                  <>
                    <Separator className="bg-oracle/10" />
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Info className="size-3" />
                        Potential payout
                      </span>
                      <span className="font-semibold text-gold">{payout.net} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit</span>
                      <span className="font-medium text-yes">+{payout.profit} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Multiplier</span>
                      <span className="font-medium text-oracle">{payout.multiplier}x</span>
                    </div>
                  </>
                )}
              </div>

              {/* Submit */}
              <Button
                className="btn-shimmer w-full bg-gradient-to-r from-oracle to-oracle-deep text-white hover:shadow-[0_0_20px_rgba(155,109,255,0.3)] disabled:opacity-40"
                disabled={!amount || Number(amount) <= 0}
              >
                {payout
                  ? `Bet ${amount} ETH on ${position ? "Yes" : "No"}`
                  : "Place Bet"
                }
              </Button>

              {/* Auto-sign hint */}
              <div className="flex items-start gap-2 rounded-lg bg-oracle/[0.04] p-3">
                <Zap className="mt-0.5 size-3.5 shrink-0 text-oracle" />
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  Enable <span className="font-medium text-oracle">auto-signing</span> for instant bets without wallet popups.
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
