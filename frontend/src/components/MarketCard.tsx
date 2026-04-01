import { Link } from "react-router-dom"
import { PoolBar } from "@/components/PoolBar"
import { Clock, CheckCircle, XCircle, Users } from "lucide-react"
import { useCountdown } from "@/hooks/useCountdown"
import type { Market, MarketStatus } from "@/types/market"
import { getMarketStatus } from "@/types/market"
import { formatEther } from "viem"

const statusConfig: Record<MarketStatus, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  open: { label: "LIVE", bg: "bg-[#CCFF00]", text: "text-black", icon: Clock },
  closed: { label: "CLOSED", bg: "bg-[#FF2A2A]", text: "text-white", icon: XCircle },
  resolved: { label: "RESOLVED", bg: "bg-[#333]", text: "text-white", icon: CheckCircle },
}

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const status = getMarketStatus(market)
  const config = statusConfig[status]
  const Icon = config.icon
  const countdown = useCountdown(market.deadline)
  const total = market.totalYesPool + market.totalNoPool

  return (
    <Link to={`/markets/${market.id}`} className="block h-full">
      <div className="brutalist-card group p-6 flex flex-col h-full bg-black hover:bg-[#0a0a0a] transition-colors">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="font-sans text-[22px] font-black uppercase leading-[1.1] tracking-tighter text-white transition-colors group-hover:text-[#CCFF00]">
            {market.question}
          </h3>
          <div className={`flex shrink-0 items-center justify-center gap-1.5 border-2 border-transparent px-2.5 py-1 font-technical text-[10px] font-bold tracking-widest ${config.bg} ${config.text}`}>
            {status === "open" && (
              <span className="size-1.5 bg-black animate-pulse" />
            )}
            {status !== "open" && <Icon className="size-3" strokeWidth={3} />}
            {config.label}
          </div>
        </div>

        {/* Meta row */}
        <div className="mb-6 flex flex-wrap items-center gap-3 font-technical text-[11px] font-bold uppercase tracking-widest text-[#888]">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {countdown.expired ? "EXPIRED" : countdown.label}
          </span>
          <span className="text-[#333]">&middot;</span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {market.bettorCount ?? 0} BETTORS
          </span>
          <span className="text-[#333]">&middot;</span>
          <span className="text-white">
            {parseFloat(formatEther(total)).toFixed(1)} ETH
          </span>
        </div>

        {/* Pool bar */}
        <div className="mt-auto">
          <PoolBar yesPool={market.totalYesPool} noPool={market.totalNoPool} />
        </div>
      </div>
    </Link>
  )
}
