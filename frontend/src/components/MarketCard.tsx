import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { PoolBar } from "@/components/PoolBar"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import type { Market, MarketStatus } from "@/types/market"
import { getMarketStatus } from "@/types/market"

const statusConfig: Record<MarketStatus, { label: string; variant: "success" | "warning" | "secondary"; icon: typeof Clock }> = {
  open: { label: "Open", variant: "success", icon: Clock },
  closed: { label: "Closed", variant: "warning", icon: XCircle },
  resolved: { label: "Resolved", variant: "secondary", icon: CheckCircle },
}

function formatDeadline(deadline: bigint): string {
  const date = new Date(Number(deadline) * 1000)
  const now = new Date()
  const diff = date.getTime() - now.getTime()

  if (diff <= 0) return "Expired"

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h left`
  if (hours > 0) return `${hours}h left`
  return `${Math.floor(diff / (1000 * 60))}m left`
}

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const status = getMarketStatus(market)
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Link to={`/markets/${market.id}`}>
      <div className="glass-card transition-oracle group rounded-xl p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-oracle text-lg leading-snug italic text-foreground group-hover:text-oracle-soft">
            {market.question}
          </h3>
          <Badge variant={config.variant} className="shrink-0 gap-1">
            <Icon className="size-3" />
            {config.label}
          </Badge>
        </div>

        <p className="mb-4 flex items-center gap-1 text-xs text-[#7B6F94]">
          <Clock className="size-3" />
          {formatDeadline(market.deadline)}
        </p>

        <PoolBar yesPool={market.totalYesPool} noPool={market.totalNoPool} />
      </div>
    </Link>
  )
}
