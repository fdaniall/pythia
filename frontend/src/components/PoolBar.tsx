import { cn } from "@/lib/utils"
import { formatEther } from "viem"

interface PoolBarProps {
  yesPool: bigint
  noPool: bigint
  className?: string
}

export function PoolBar({ yesPool, noPool, className }: PoolBarProps) {
  const total = yesPool + noPool
  const yesPercent = total > 0n ? Number((yesPool * 100n) / total) : 50
  const noPercent = total > 0n ? 100 - yesPercent : 50

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-green-600 dark:text-green-400">
          Yes {yesPercent}%
        </span>
        <span className="font-medium text-red-500 dark:text-red-400">
          No {noPercent}%
        </span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="bg-green-500 transition-all duration-300"
          style={{ width: `${yesPercent}%` }}
        />
        <div
          className="bg-red-500 transition-all duration-300"
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
