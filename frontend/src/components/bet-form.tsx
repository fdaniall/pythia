import { useState, useMemo } from "react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  TrendingUp, TrendingDown, Info, TerminalSquare, Wallet, Zap, ArrowDownToLine
} from "lucide-react"
import { fireBrutalistConfetti } from "@/lib/confetti"
import { useMovePlaceBet, useMoveClaimWinnings, useMoveUserBet, useMoveCalculatePayout } from "@/hooks/useMoveContract"
import { UINIT_DECIMALS, INITIA_REST_URL, fetchBalance } from "@/lib/move"
import { useQuery } from "@tanstack/react-query"
import type { Market } from "@/types/market"

interface BetFormProps {
  market: Market
  total: bigint
  expired: boolean
}

function initToUinit(value: string): bigint {
  const parsed = parseFloat(value)
  if (!parsed || parsed <= 0) return 0n
  return BigInt(Math.round(parsed * 10 ** UINIT_DECIMALS))
}

function formatUinit(uinit: bigint, decimals = 4): string {
  return (Number(uinit) / 10 ** UINIT_DECIMALS).toFixed(decimals)
}

export function BetForm({ market, total, expired }: BetFormProps) {
  const { isConnected, openConnect, openBridge, initiaAddress } = useInterwovenKit()
  const [amount, setAmount] = useState("")
  const [position, setPosition] = useState<boolean>(true)
  const [showSuccess, setShowSuccess] = useState(false)

  const { mutate: placeBet, isPending: isBetting } = useMovePlaceBet()
  const { mutate: claimWinnings, isPending: isClaiming } = useMoveClaimWinnings()

  const { data: userBet } = useMoveUserBet(market.id, initiaAddress || undefined)
  const { data: calculatedPayout } = useMoveCalculatePayout(
    market.id,
    market.resolved ? (initiaAddress || undefined) : undefined,
  )

  const { data: balanceUinit } = useQuery({
    queryKey: ["balance", initiaAddress],
    queryFn: () => fetchBalance(INITIA_REST_URL, initiaAddress!),
    enabled: !!initiaAddress,
    refetchInterval: 15_000,
  })
  const balanceInit = balanceUinit ? Number(balanceUinit) / 10 ** UINIT_DECIMALS : 0

  const isSubmitting = isBetting || isClaiming

  const payout = useMemo(() => {
    const betAmountUinit = initToUinit(amount)
    if (betAmountUinit <= 0n) return null

    const winningPool = position
      ? market.totalYesPool + betAmountUinit
      : market.totalNoPool + betAmountUinit
    const totalPool = total + betAmountUinit
    if (winningPool === 0n) return null

    const grossPayout = (betAmountUinit * totalPool) / winningPool
    const fee = (grossPayout * 2n) / 100n
    const netPayout = grossPayout - fee

    return {
      gross: formatUinit(grossPayout),
      fee: formatUinit(fee),
      net: formatUinit(netPayout),
      multiplier: betAmountUinit > 0n
        ? (Number(netPayout) / Number(betAmountUinit)).toFixed(2)
        : "0.00",
      profit: formatUinit(netPayout > betAmountUinit ? netPayout - betAmountUinit : 0n),
    }
  }, [amount, position, market.totalYesPool, market.totalNoPool, total])

  const userHasBet = userBet && (userBet.yesAmount > 0n || userBet.noAmount > 0n)
  const canClaim = market.resolved && userHasBet && !userBet?.claimed && calculatedPayout && calculatedPayout > 0n

  const handlePlaceBet = () => {
    const amountUinit = initToUinit(amount)
    if (amountUinit <= 0n) return

    placeBet(
      {
        marketId: market.id,
        outcome: position ? 0 : 1,
        amountUinit,
      },
      {
        onSuccess: () => {
          fireBrutalistConfetti()
          setAmount("")
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 5000)
        },
      },
    )
  }

  const handleClaim = () => {
    claimWinnings({ marketId: market.id })
  }

  return (
    <div className="brutalist-card bg-black p-6 sticky top-24">
      <h2 className="mb-6 flex items-center gap-2 font-technical text-[14px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-4">
        <TerminalSquare className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
        PLACE YOUR BET
      </h2>

      <div className="space-y-6">
        {/* Success confirmation after bet */}
        {showSuccess && (
          <div className="border-2 border-[#CCFF00] bg-[#CCFF00]/10 p-4 text-center animate-pulse">
            <p className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#CCFF00]">
              BET CONFIRMED
            </p>
            <p className="mt-1 font-technical text-[10px] uppercase tracking-widest text-[#888]">
              Your position is now active. Good luck.
            </p>
          </div>
        )}

        {/* User's existing bet info */}
        {userHasBet && !showSuccess && (
          <div className="border border-[#CCFF00]/30 bg-[#CCFF00]/5 p-4 space-y-2">
            <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">
              YOUR POSITION
            </p>
            <div className="flex gap-4 font-technical text-[11px] uppercase">
              {userBet.yesAmount > 0n && (
                <span className="text-[#CCFF00]">
                  YES: {formatUinit(userBet.yesAmount, 2)} INIT
                </span>
              )}
              {userBet.noAmount > 0n && (
                <span className="text-[#FF2A2A]">
                  NO: {formatUinit(userBet.noAmount, 2)} INIT
                </span>
              )}
            </div>
          </div>
        )}

        {/* Claim winnings button (resolved markets) */}
        {canClaim && (
          <Button
            className="btn-acid h-14 w-full font-technical text-[14px]"
            disabled={isClaiming}
            onClick={handleClaim}
          >
            {isClaiming
              ? "CLAIMING..."
              : `CLAIM ${formatUinit(calculatedPayout, 4)} INIT`}
          </Button>
        )}

        {/* Already claimed — celebrate */}
        {market.resolved && userBet?.claimed && (
          <div className="border border-[#CCFF00]/30 bg-[#CCFF00]/5 p-4 text-center">
            <p className="font-technical text-[12px] uppercase tracking-widest text-[#CCFF00]">
              WINNINGS CLAIMED SUCCESSFULLY
            </p>
          </div>
        )}

        {/* Expired but not resolved message */}
        {expired && !market.resolved && (
          <div className="border border-[#FF2A2A]/30 bg-[#FF2A2A]/5 p-4 text-center">
            <p className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#FF2A2A]">
              BETTING CLOSED
            </p>
            <p className="mt-1 font-technical text-[10px] uppercase tracking-widest text-[#888]">
              Awaiting resolution by market creator. You'll be able to claim once the outcome is confirmed.
            </p>
          </div>
        )}

        {/* Betting form (only for open markets) */}
        {!market.resolved && !expired && (
          <>
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
                    {total > 0n ? Number((market.totalYesPool * 100n) / total) : 50}% of pool
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
                    {total > 0n ? Number((market.totalNoPool * 100n) / total) : 50}% of pool
                  </span>
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#888]" htmlFor="bet-amount">
                  BET AMOUNT (INIT)
                </label>
                {isConnected && (
                  <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#555]">
                    BAL: {balanceInit.toFixed(2)} INIT
                  </span>
                )}
              </div>
              <Input
                id="bet-amount"
                type="number"
                placeholder="0.1"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={expired || isSubmitting}
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
                    disabled={expired || isSubmitting}
                    onClick={() => setAmount(v === "MAX" ? (balanceInit > 0 ? balanceInit.toFixed(2) : "0") : v)}
                    className={cn(
                      "flex-1 border-[1.5px] py-1.5 font-technical text-[11px] font-bold uppercase tracking-widest transition-all",
                      expired ? "opacity-50 cursor-not-allowed" : "",
                      amount === (v === "MAX" ? (balanceInit > 0 ? balanceInit.toFixed(2) : "0") : v)
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
                <span className="text-[#888]">PLATFORM FEE</span>
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
                  <p className="text-[10px] text-[#555] text-right normal-case">
                    You bet {amount} INIT and get back {payout.net} INIT if {position ? "YES" : "NO"} wins
                  </p>
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
                onClick={handlePlaceBet}
              >
                {isSubmitting
                  ? "EXECUTING..."
                  : expired
                    ? "MARKET CLOSED"
                    : payout
                      ? `PLACE BET [ ${amount} INIT -> ${position ? "YES" : "NO"} ]`
                      : "ENTER AN AMOUNT TO SEE YOUR PAYOUT"
                }
              </Button>
            )}
          </>
        )}

        {/* Bridge deposit */}
        {isConnected && balanceInit < 0.1 && !expired && (
          <button
            type="button"
            onClick={() => openBridge()}
            className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-[#CCFF00]/50 bg-[#CCFF00]/5 p-4 text-[#CCFF00] hover:border-[#CCFF00] hover:bg-[#CCFF00]/10 transition-all"
          >
            <ArrowDownToLine className="size-4" strokeWidth={2.5} />
            <span className="font-technical text-[12px] font-bold uppercase tracking-widest">
              BRIDGE FUNDS FROM ANOTHER CHAIN
            </span>
          </button>
        )}

        {/* Info hint */}
        <div className="flex items-start gap-3 border border-[#333] bg-[#050505] p-4">
          <Zap className="mt-0.5 size-4 shrink-0 text-[#CCFF00]" />
          <p className="font-technical text-[10px] uppercase leading-relaxed text-[#888]">
            All bets are settled on <span className="text-[#CCFF00] font-bold">Initia L1</span>. Payouts are proportional to pool distribution minus 2% platform fee.
            {isConnected && (
              <>
                {" "}
                <button type="button" onClick={() => openBridge()} className="text-[#CCFF00] underline hover:text-white transition-colors">
                  Bridge from another chain
                </button>.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
