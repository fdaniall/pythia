import { useState, useMemo } from "react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatEther } from "viem"
import {
  TrendingUp, TrendingDown, Info, TerminalSquare, Wallet, Zap
} from "lucide-react"
import { toast } from "sonner"
import type { Market } from "@/types/market"

interface BetFormProps {
  market: Market
  total: bigint
  expired: boolean
}

export function BetForm({ market, total, expired }: BetFormProps) {
  const { isConnected, openConnect } = useInterwovenKit()
  const [amount, setAmount] = useState("")
  const [position, setPosition] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const payout = useMemo(() => {
    const betAmount = parseFloat(amount)
    if (!betAmount || betAmount <= 0) return null

    const betWei = BigInt(Math.floor(betAmount * 1e18))
    const winningPool = position ? market.totalYesPool + betWei : market.totalNoPool + betWei
    const totalPool = total + betWei
    const grossPayout = (betWei * totalPool) / winningPool
    const fee = (grossPayout * 2n) / 100n
    const netPayout = grossPayout - fee

    return {
      gross: parseFloat(formatEther(grossPayout)).toFixed(4),
      fee: parseFloat(formatEther(fee)).toFixed(4),
      net: parseFloat(formatEther(netPayout)).toFixed(4),
      multiplier: (Number(netPayout) / Number(betWei)).toFixed(2),
      profit: parseFloat(formatEther(netPayout - betWei)).toFixed(4),
    }
  }, [amount, position, market.totalYesPool, market.totalNoPool, total])

  return (
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
              disabled={expired}
              aria-pressed={position}
              className={cn(
                "flex flex-col items-center gap-1 border-[2px] p-4 transition-all",
                expired ? "opacity-50 cursor-not-allowed" : "",
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
              disabled={expired}
              aria-pressed={!position}
              className={cn(
                "flex flex-col items-center gap-1 border-[2px] p-4 transition-all",
                expired ? "opacity-50 cursor-not-allowed" : "",
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
            BET AMOUNT (INIT)
          </label>
          <Input
            id="bet-amount"
            type="number"
            placeholder="0.1"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={expired}
            className={cn(
              "h-12 rounded-none border-[2px] bg-black px-4 font-sans text-xl font-black text-white placeholder:text-[#333] focus-visible:ring-0",
              expired ? "border-[#333] opacity-50 cursor-not-allowed" : "border-[#333] focus-visible:border-[#CCFF00]"
            )}
          />
          <div className="flex gap-2">
            {["0.1", "0.5", "1.0", "MAX"].map((v) => (
              <button
                key={v}
                type="button"
                disabled={expired}
                onClick={() => setAmount(v === "MAX" ? "10.0" : v)}
                className={cn(
                  "flex-1 border-[1.5px] py-1.5 font-technical text-[11px] font-bold uppercase tracking-widest transition-all",
                  expired ? "opacity-50 cursor-not-allowed" : "",
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
              {position ? "YES" : "NO"}
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
                <span className="text-[#CCFF00]">{payout.net} INIT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">PROFIT</span>
                <span className="text-white">+{payout.profit} INIT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">MULTIPLIER</span>
                <span className="text-white">{payout.multiplier}X</span>
              </div>
            </>
          )}
        </div>

        {/* Submit / Connect */}
        {!isConnected ? (
          <Button
            className="btn-acid h-14 w-full font-technical text-[14px]"
            onClick={openConnect}
          >
            <Wallet className="mr-2 size-4" />
            CONNECT WALLET
          </Button>
        ) : (
          <Button
            className={cn(
              "h-14 w-full font-technical text-[14px]",
              expired ? "bg-[#333] text-[#888] cursor-not-allowed border-[2px] border-[#333] rounded-none hover:bg-[#333]" : "btn-acid"
            )}
            disabled={expired || !amount || Number(amount) <= 0 || isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              try {
                // TODO: call contract placeBet
                await new Promise((r) => setTimeout(r, 1000))
                toast.success("Bet Placed Successfully", {
                  description: `${amount} INIT on ${position ? "YES" : "NO"} — your position is now active.`,
                  duration: 5000,
                })
                setAmount("")
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            {isSubmitting
              ? "EXECUTING..."
              : expired
                ? "MARKET CLOSED"
                : payout
                  ? `PLACE BET [ ${amount} INIT -> ${position ? "YES" : "NO"} ]`
                  : "ENTER AMOUNT..."
            }
          </Button>
        )}

        {/* Auto-sign hint */}
        <div className="flex items-start gap-3 border border-[#333] bg-[#050505] p-4">
          <Zap className="mt-0.5 size-4 shrink-0 text-[#CCFF00]" />
          <p className="font-technical text-[10px] uppercase leading-relaxed text-[#888]">
            <span className="text-[#CCFF00] font-bold">1-TAP SIGNING</span> available. Enable in settings to execute transactions without RPC popup interruptions.
          </p>
        </div>
      </div>
    </div>
  )
}
