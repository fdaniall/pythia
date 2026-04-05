import { useParams, Link } from "react-router-dom"
import { useDocTitle } from "@/hooks/useDocTitle"
import { PoolBar } from "@/components/PoolBar"
import { BrutalistSparkline } from "@/components/BrutalistSparkline"
import { BetForm } from "@/components/BetForm"
import { cn } from "@/lib/utils"
import { useCountdown } from "@/hooks/useCountdown"
import { FadeIn } from "@/components/FadeIn"
import {
  ArrowLeft, Clock, Trophy, Users, Zap, TerminalSquare, Share2, Check,
  Shield, TrendingUp, TrendingDown
} from "lucide-react"
import { useState } from "react"
import { useMoveMarket, useMoveAdmin, useMoveResolveMarket } from "@/hooks/useMoveContract"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { useInitUsername, formatAddress } from "@/hooks/useInitUsername"
import { formatUinit, bech32ToHex } from "@/lib/move"
import { parseCryptoPriceMarket, fetchCryptoPrice } from "@/lib/ai"

// Deterministic sparkline data per market (seeded by id)
function generateSparkline(seed: number): number[] {
  let value = 30 + (seed * 17) % 40
  const points: number[] = [value]
  for (let i = 1; i < 20; i++) {
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

function ShareToX({ question }: { question: string }) {
  const url = window.location.href
  const text = encodeURIComponent(`${question}\n\nPredict now on @PythiaProtocol 🔮\n${url}`)
  const twitterUrl = `https://x.com/intent/tweet?text=${text}`

  return (
    <a
      href={twitterUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-[#888] hover:text-[#CCFF00] transition-colors"
    >
      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      POST
    </a>
  )
}

function AdminResolvePanel({ marketId, expired, resolved, question }: { marketId: number; expired: boolean; resolved: boolean; question: string }) {
  const { initiaAddress } = useInterwovenKit()
  const { data: adminAddr } = useMoveAdmin()
  const { mutate: resolveMarket, isPending } = useMoveResolveMarket()
  const [oraclePrice, setOraclePrice] = useState<number | null>(null)
  const [oracleLoading, setOracleLoading] = useState(false)

  // Seed markets — no admin panel
  if (marketId >= 1000) return null

  const isAdmin = adminAddr && initiaAddress
    ? bech32ToHex(initiaAddress).toLowerCase() === adminAddr.toLowerCase()
    : false

  const cryptoMarket = parseCryptoPriceMarket(question)

  const handleFetchPrice = async () => {
    if (!cryptoMarket) return
    setOracleLoading(true)
    try {
      const price = await fetchCryptoPrice(cryptoMarket.coinId)
      setOraclePrice(price)
    } catch {
      setOraclePrice(null)
    } finally {
      setOracleLoading(false)
    }
  }

  if (!isAdmin || resolved || !expired) return null

  const oracleSuggestion = oraclePrice !== null && cryptoMarket
    ? oraclePrice >= cryptoMarket.targetPrice ? 0 as const : 1 as const
    : null

  return (
    <div className="brutalist-card bg-black p-6 border-[#CCFF00]">
      <h2 className="mb-4 flex items-center gap-2 font-technical text-[14px] font-bold uppercase tracking-widest text-[#CCFF00] border-b border-[#333] pb-4">
        <Shield className="size-4" strokeWidth={2.5} />
        ADMIN: RESOLVE MARKET
      </h2>

      {/* Crypto price oracle */}
      {cryptoMarket && (
        <div className="border border-[#CCFF00]/30 bg-[#CCFF00]/[0.02] p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-technical text-[11px] font-bold uppercase tracking-widest text-[#CCFF00]">
              PRICE ORACLE — {cryptoMarket.coinSymbol}
            </span>
            <button
              type="button"
              onClick={handleFetchPrice}
              disabled={oracleLoading}
              className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00] border border-[#CCFF00]/50 px-3 py-1 hover:bg-[#CCFF00] hover:text-black transition-all disabled:opacity-50"
            >
              {oracleLoading ? "FETCHING..." : "FETCH LIVE PRICE"}
            </button>
          </div>
          {oraclePrice !== null && (
            <div className="space-y-2">
              <div className="flex justify-between font-technical text-[12px] uppercase tracking-widest">
                <span className="text-[#888]">Current Price</span>
                <span className="text-white font-black">${oraclePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-technical text-[12px] uppercase tracking-widest">
                <span className="text-[#888]">Target Price</span>
                <span className="text-white font-black">${cryptoMarket.targetPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-technical text-[12px] uppercase tracking-widest">
                <span className="text-[#888]">Oracle Verdict</span>
                <span className={oracleSuggestion === 0 ? "text-[#CCFF00] font-black" : "text-[#FF2A2A] font-black"}>
                  {oracleSuggestion === 0 ? "YES — TARGET REACHED" : "NO — BELOW TARGET"}
                </span>
              </div>
              <p className="font-technical text-[9px] uppercase text-[#555]">
                Source: CoinGecko API — live market data
              </p>
            </div>
          )}
        </div>
      )}

      <p className="font-technical text-[11px] uppercase tracking-widest text-[#888] mb-6">
        {oracleSuggestion !== null
          ? "Oracle suggests an outcome. Confirm or override below."
          : "Select the winning outcome to resolve this market and enable payouts."
        }
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => resolveMarket({ marketId, winningOutcome: 0 })}
          disabled={isPending}
          className={cn(
            "flex flex-col items-center gap-2 border-2 p-4 transition-all disabled:opacity-50",
            oracleSuggestion === 0
              ? "border-[#CCFF00] bg-[#CCFF00]/20 text-[#CCFF00] animate-pulse"
              : "border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black"
          )}
        >
          <TrendingUp className="size-5" strokeWidth={2.5} />
          <span className="font-technical text-[14px] font-black uppercase tracking-widest">
            {isPending ? "..." : "YES WINS"}
          </span>
          {oracleSuggestion === 0 && (
            <span className="font-technical text-[9px] uppercase tracking-widest">ORACLE RECOMMENDED</span>
          )}
        </button>
        <button
          onClick={() => resolveMarket({ marketId, winningOutcome: 1 })}
          disabled={isPending}
          className={cn(
            "flex flex-col items-center gap-2 border-2 p-4 transition-all disabled:opacity-50",
            oracleSuggestion === 1
              ? "border-[#FF2A2A] bg-[#FF2A2A]/20 text-[#FF2A2A] animate-pulse"
              : "border-[#FF2A2A] text-[#FF2A2A] hover:bg-[#FF2A2A] hover:text-white"
          )}
        >
          <TrendingDown className="size-5" strokeWidth={2.5} />
          <span className="font-technical text-[14px] font-black uppercase tracking-widest">
            {isPending ? "..." : "NO WINS"}
          </span>
          {oracleSuggestion === 1 && (
            <span className="font-technical text-[9px] uppercase tracking-widest">ORACLE RECOMMENDED</span>
          )}
        </button>
      </div>
    </div>
  )
}

function CreatorDisplay({ address }: { address: string }) {
  const { data: username } = useInitUsername(address)
  return (
    <span className="text-white font-mono text-[10px]">
      {formatAddress(address, username)}
    </span>
  )
}

export function MarketDetailPage() {
  const { id } = useParams()
  const marketId = parseInt(id ?? "0")

  const { data: market, isLoading, error } = useMoveMarket(marketId)

  useDocTitle(market?.question ?? "Market")
  const countdown = useCountdown(market?.deadline ?? 0n)
  const total = (market?.totalYesPool ?? 0n) + (market?.totalNoPool ?? 0n)

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-6 bg-[#1a1a1a] w-32 mb-8" />
        <div className="h-12 bg-[#1a1a1a] w-2/3" />
        <div className="h-4 bg-[#1a1a1a] w-1/3" />
        <div className="grid gap-8 lg:grid-cols-3 mt-8">
          <div className="lg:col-span-2 brutalist-card bg-black p-8" style={{ height: "400px" }} />
          <div className="brutalist-card bg-black p-6" style={{ height: "300px" }} />
        </div>
      </div>
    )
  }

  // Not found or error
  if (!market || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="mb-6 border-2 border-[#FF2A2A] px-8 py-3">
          <span className="font-mono text-[clamp(40px,8vw,72px)] font-black text-[#FF2A2A] leading-none">
            404
          </span>
        </div>

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
      {/* Expired/Resolved banner */}
      {countdown.expired && (
        <div className="border-2 border-[#FF2A2A] bg-[#FF2A2A]/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-3 bg-[#FF2A2A]" />
            <span className="font-technical text-[13px] font-bold uppercase tracking-widest text-[#FF2A2A]">
              {market.resolved ? "MARKET RESOLVED" : "BETTING CLOSED"}
            </span>
          </div>
          <span className="font-technical text-[11px] uppercase tracking-widest">
            {market.resolved
              ? <>Outcome: <span className={market.outcome ? "text-[#CCFF00] font-bold" : "text-[#FF2A2A] font-bold"}>{market.outcome ? "YES" : "NO"}</span></>
              : <span className="text-[#888]">Awaiting resolution by market creator</span>}
          </span>
        </div>
      )}

      <FadeIn>
        <Link
          to="/markets"
          className="inline-flex items-center gap-2 font-technical text-[10px] font-bold uppercase tracking-widest text-[#888] transition-colors hover:text-white relative z-20"
        >
          <ArrowLeft className="size-4" strokeWidth={2.5} />
          BACK TO MARKETS
        </Link>

        {/* Market title + countdown */}
        <div className="mt-8 border-l-4 border-[#CCFF00] pl-6 py-2 relative z-20">
          <h1 className="font-sans text-[clamp(32px,4vw,48px)] font-black uppercase leading-[1.1] tracking-tighter text-white">
            {market.question}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3 font-technical text-[11px] font-bold uppercase tracking-widest text-[#888]">
            <div className={cn(
              "flex items-center justify-center gap-1.5 border-2 border-transparent px-2.5 py-1 text-[10px]",
              countdown.expired ? "bg-[#FF2A2A] text-white" : "bg-[#CCFF00] text-black"
            )}>
              {!countdown.expired && <span className="size-1.5 bg-black animate-pulse" />}
              {countdown.expired ? (market.resolved ? "RESOLVED" : "CLOSED") : "LIVE"}
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
            <span className="text-[#333]">&middot;</span>
            <ShareToX question={market.question} />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="grid gap-8 lg:grid-cols-3 relative z-20 mt-8">
          {/* Left column: pool + info */}
          <div className="space-y-8 lg:col-span-2 order-2 lg:order-1">
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
                    {formatUinit(total)} <span className="text-sm text-[#555]">INIT</span>
                  </p>
                </div>
                <div className="border border-[#CCFF00]/30 bg-[#CCFF00]/5 p-4 flex flex-col items-center justify-center text-center">
                  <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">YES POOL</p>
                  <p className="mt-2 font-sans text-2xl font-black text-[#CCFF00]">
                    {formatUinit(market.totalYesPool)} <span className="text-sm text-[#CCFF00]/50">INIT</span>
                  </p>
                </div>
                <div className="border border-[#FF2A2A]/30 bg-[#FF2A2A]/5 p-4 flex flex-col items-center justify-center text-center">
                  <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#FF2A2A]">NO POOL</p>
                  <p className="mt-2 font-sans text-2xl font-black text-[#FF2A2A]">
                    {formatUinit(market.totalNoPool)} <span className="text-sm text-[#FF2A2A]/50">INIT</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="brutalist-card bg-black p-6">
                <h2 className="mb-4 flex items-center gap-2 font-technical text-[12px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-3">
                  <Zap className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
                  MARKET INFO
                </h2>
                <div className="space-y-3 font-technical text-[11px] uppercase tracking-widest">
                  <div className="flex justify-between border-l-2 border-[#333] bg-[#0a0a0a] px-3 py-2">
                    <span className="text-[#888]">Creator</span>
                    <CreatorDisplay address={market.creator} />
                  </div>
                  <div className="flex justify-between border-l-2 border-[#333] bg-[#0a0a0a] px-3 py-2">
                    <span className="text-[#888]">Deadline</span>
                    <span className="text-white font-mono text-[10px]">
                      {new Date(Number(market.deadline) * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-l-2 border-[#333] bg-[#0a0a0a] px-3 py-2">
                    <span className="text-[#888]">Status</span>
                    <span className={cn(market.resolved ? "text-[#FF2A2A]" : "text-[#CCFF00]")}>
                      {market.resolved ? "RESOLVED" : countdown.expired ? "CLOSED" : "LIVE"}
                    </span>
                  </div>
                  {market.resolved && (
                    <div className="flex justify-between border-l-2 border-[#CCFF00] bg-[#0a0a0a] px-3 py-2">
                      <span className="text-[#888]">Outcome</span>
                      <span className={cn(market.outcome ? "text-[#CCFF00]" : "text-[#FF2A2A]", "font-black")}>
                        {market.outcome ? "YES" : "NO"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-l-2 border-[#333] bg-[#0a0a0a] px-3 py-2">
                    <span className="text-[#888]">Platform Fee</span>
                    <span className="text-white">2%</span>
                  </div>
                </div>
              </div>

              <div className="brutalist-card bg-black p-6">
                <h2 className="mb-4 flex items-center gap-2 font-technical text-[12px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-3">
                  <Trophy className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
                  POOL BREAKDOWN
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between font-technical text-[11px] uppercase tracking-widest">
                    <span className="text-[#CCFF00]">YES POOL</span>
                    <span className="text-white font-black">{formatUinit(market.totalYesPool, 2)} INIT</span>
                  </div>
                  <div className="flex justify-between font-technical text-[11px] uppercase tracking-widest">
                    <span className="text-[#FF2A2A]">NO POOL</span>
                    <span className="text-white font-black">{formatUinit(market.totalNoPool, 2)} INIT</span>
                  </div>
                  <div className="h-px bg-[#333] my-2" />
                  <div className="flex justify-between font-technical text-[11px] uppercase tracking-widest">
                    <span className="text-[#888]">TOTAL</span>
                    <span className="text-white font-black">{formatUinit(total, 2)} INIT</span>
                  </div>
                  <div className="flex justify-between font-technical text-[11px] uppercase tracking-widest">
                    <span className="text-[#888]">BETTORS</span>
                    <span className="text-white font-black">{market.bettorCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: admin resolve + bet form — shown first on mobile */}
          <div className="space-y-6 order-1 lg:order-2">
            <AdminResolvePanel marketId={market.id} expired={countdown.expired} resolved={market.resolved} question={market.question} />
            <BetForm market={market} total={total} expired={countdown.expired} />
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
