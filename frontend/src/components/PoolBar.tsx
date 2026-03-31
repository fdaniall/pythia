import { cn } from "@/lib/utils"
import { formatEther } from "viem"

interface PoolBarProps {
  yesPool: bigint
  noPool: bigint
  className?: string
  size?: "sm" | "md"
}

export function PoolBar({ yesPool, noPool, className, size = "sm" }: PoolBarProps) {
  const total = yesPool + noPool
  const yesPercent = total > 0n ? Number((yesPool * 100n) / total) : 50
  const noPercent = total > 0n ? 100 - yesPercent : 50

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-yes">
          Yes {yesPercent}%
        </span>
        <span className="font-medium text-no">
          No {noPercent}%
        </span>
      </div>
      <div className={cn(
        "flex overflow-hidden rounded-full bg-[rgba(155,109,255,0.08)]",
        size === "md" ? "h-4" : "h-3"
      )}>
        <div
          className="pool-bar-yes transition-all duration-500"
          style={{ width: `${yesPercent}%` }}
        />
        <div
          className="pool-bar-no transition-all duration-500"
          style={{ width: `${noPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatEther(yesPool)} ETH</span>
        <span>{formatEther(noPool)} ETH</span>
      </div>
    </div>
  )
}
