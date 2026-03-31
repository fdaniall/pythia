import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { PoolBar } from "@/components/PoolBar"
import { Clock, CheckCircle, XCircle, Users } from "lucide-react"
import { useCountdown } from "@/hooks/useCountdown"
import type { Market, MarketStatus } from "@/types/market"
import { getMarketStatus } from "@/types/market"
import { formatEther } from "viem"

const statusConfig: Record<MarketStatus, { label: string; variant: "success" | "warning" | "secondary"; icon: typeof Clock }> = {
  open: { label: "Live", variant: "success", icon: Clock },
  closed: { label: "Closed", variant: "warning", icon: XCircle },
  resolved: { label: "Resolved", variant: "secondary", icon: CheckCircle },
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
    <Link to={`/markets/${market.id}`}>
      <div className="glass-card group rounded-xl p-6">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-oracle text-lg leading-snug italic text-foreground group-hover:text-oracle-soft">
            {market.question}
          </h3>
          <Badge variant={config.variant} className="shrink-0 gap-1">
            {status === "open" && (
              <span className="animate-oracle-pulse size-1.5 rounded-full bg-yes" />
            )}
            {status !== "open" && <Icon className="size-3" />}
            {config.label}
          </Badge>
        </div>

        {/* Meta row */}
        <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {countdown.expired ? "Expired" : countdown.label}
          </span>
          <span className="text-dim">&middot;</span>
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {market.bettorCount ?? 0} bettors
          </span>
          <span className="text-dim">&middot;</span>
          <span className="text-gold font-medium">
            {parseFloat(formatEther(total)).toFixed(1)} ETH
          </span>
        </div>

        {/* Pool bar */}
        <PoolBar yesPool={market.totalYesPool} noPool={market.totalNoPool} />
      </div>
    </Link>
  )
}
