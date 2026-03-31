import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PoolBar } from "@/components/PoolBar"
import { cn } from "@/lib/utils"
import { ArrowLeft, Clock, Trophy, TrendingUp, TrendingDown } from "lucide-react"

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
}

export function MarketDetailPage() {
  const { id } = useParams()
  const [position, setPosition] = useState<boolean>(true)
  const [amount, setAmount] = useState("")

  const market = MOCK_MARKET // TODO: fetch by id

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#7B6F94] transition-colors hover:text-oracle-soft"
      >
        <ArrowLeft className="size-3.5" />
        Back to Markets
      </Link>

      {/* Market title */}
      <div>
        <h1 className="font-oracle text-oracle-gradient text-2xl italic leading-snug md:text-3xl">
          {market.question}
        </h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-[#7B6F94]">
          <Badge variant="success" className="gap-1">
            <span className="animate-oracle-pulse size-1.5 rounded-full bg-yes" />
            Open
          </Badge>
          <span>Market #{id}</span>
          <span className="text-[#44395A]">&middot;</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            Ends {new Date(Number(market.deadline) * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Pool visualization */}
        <div className="glass-card rounded-xl p-6 md:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="size-4 text-oracle" />
            Pool Distribution
          </h2>
          <PoolBar yesPool={market.totalYesPool} noPool={market.totalNoPool} size="md" />

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-[rgba(155,109,255,0.06)] p-3 text-center">
              <p className="text-xs text-[#7B6F94]">Total Pool</p>
              <p className="font-oracle mt-0.5 text-lg italic text-gold">8 ETH</p>
            </div>
            <div className="rounded-lg bg-[rgba(34,197,94,0.06)] p-3 text-center">
              <p className="text-xs text-[#7B6F94]">Yes Pool</p>
              <p className="mt-0.5 text-lg font-semibold text-yes">5 ETH</p>
            </div>
            <div className="rounded-lg bg-[rgba(239,68,68,0.06)] p-3 text-center">
              <p className="text-xs text-[#7B6F94]">No Pool</p>
              <p className="mt-0.5 text-lg font-semibold text-no">3 ETH</p>
            </div>
          </div>
        </div>

        {/* Bet form */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Trophy className="size-4 text-gold" />
            Place Your Bet
          </h2>

          <div className="space-y-4">
            {/* Position buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPosition(true)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all",
                  position
                    ? "border-yes/30 bg-yes/10 text-yes glow-yes"
                    : "border-[rgba(155,109,255,0.1)] bg-transparent text-[#7B6F94] hover:border-yes/20 hover:text-yes"
                )}
              >
                <TrendingUp className="size-3.5" />
                Yes
              </button>
              <button
                onClick={() => setPosition(false)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all",
                  !position
                    ? "border-no/30 bg-no/10 text-no glow-no"
                    : "border-[rgba(155,109,255,0.1)] bg-transparent text-[#7B6F94] hover:border-no/20 hover:text-no"
                )}
              >
                <TrendingDown className="size-3.5" />
                No
              </button>
            </div>

            {/* Amount input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#7B6F94]" htmlFor="bet-amount">
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
                className="border-oracle/10 bg-[rgba(155,109,255,0.04)] text-foreground placeholder:text-[#44395A] focus-visible:ring-oracle/30"
              />
            </div>

            <Separator className="bg-oracle/10" />

            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#7B6F94]">Position</span>
                <span className={cn("font-medium", position ? "text-yes" : "text-no")}>
                  {position ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7B6F94]">Platform fee</span>
                <span className="text-gold">2%</span>
              </div>
            </div>

            {/* Submit */}
            <Button
              className="btn-shimmer w-full bg-gradient-to-r from-oracle to-oracle-deep text-white hover:shadow-[0_0_20px_rgba(155,109,255,0.3)] disabled:opacity-40"
              disabled={!amount || Number(amount) <= 0}
            >
              Place Bet
            </Button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Trophy className="size-4 text-gold" />
          Leaderboard
        </h2>
        <p className="text-sm text-[#7B6F94]">
          Top bettors will appear here with their .init usernames.
        </p>
      </div>
    </div>
  )
}
