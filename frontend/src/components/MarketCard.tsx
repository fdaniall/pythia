import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PoolBar } from "@/components/PoolBar"
import type { Market, MarketStatus } from "@/types/market"
import { getMarketStatus } from "@/types/market"

const statusConfig: Record<MarketStatus, { label: string; variant: "success" | "warning" | "secondary" }> = {
  open: { label: "Open", variant: "success" },
  closed: { label: "Closed", variant: "warning" },
  resolved: { label: "Resolved", variant: "secondary" },
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

  return (
    <Link to={`/markets/${market.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">
              {market.question}
            </CardTitle>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDeadline(market.deadline)}
          </p>
        </CardHeader>
        <CardContent>
          <PoolBar yesPool={market.totalYesPool} noPool={market.totalNoPool} />
        </CardContent>
      </Card>
    </Link>
  )
}
