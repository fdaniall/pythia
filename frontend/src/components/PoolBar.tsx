import { cn } from "@/lib/utils"
import { formatUinit } from "@/lib/move"

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
    <div className={cn("space-y-3", className)} role="group" aria-label="Pool distribution">
      <div className="flex justify-between font-technical text-[12px] font-bold uppercase tracking-widest">
        <span className="text-[#CCFF00]">
          YES {yesPercent}%
        </span>
        <span className="text-[#FF2A2A]">
          NO {noPercent}%
        </span>
      </div>
      <div className={cn(
        "flex bg-[#111] overflow-hidden",
        size === "md" ? "h-4" : "h-3"
      )} role="progressbar" aria-label={`Yes ${yesPercent}%, No ${noPercent}%`} aria-valuenow={yesPercent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="bg-[#CCFF00] transition-all duration-500"
          style={{ width: `${yesPercent}%` }}
        />
        <div
          className="bg-[#FF2A2A] transition-all duration-500"
          style={{ width: `${noPercent}%` }}
        />
      </div>
      <div className="flex justify-between font-technical text-[10px] uppercase tracking-widest text-[#888]">
        <span>{formatUinit(yesPool)} INIT</span>
        <span>{formatUinit(noPool)} INIT</span>
      </div>
    </div>
  )
}
