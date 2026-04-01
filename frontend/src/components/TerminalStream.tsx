import { useState, useEffect } from "react"
import { FadeIn } from "@/components/FadeIn"

const LOG_MESSAGES = [
  "[SYS] Syncing with MiniEVM RPC...",
  "[INFO] Block 14,092,109 Indexed.",
  "[MEMPOOL] Detected pending liquidity injection.",
  "[TX] 0x8Af... Pool 4 Executed (YES).",
  "[WARN] High volatility detected in MKT-0.",
  "[INFO] Oracle consensus reached: 0x992...",
  "[OK] Smart contract status: ACTIVE.",
  "[SYS] Optimistic verification cycle: 12ms",
]

function randomLog() {
  return LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)]
}

export function TerminalStream() {
  const [logs, setLogs] = useState<string[]>(["[SYS] Terminal initialized."])

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return
      setLogs((prev) => {
        const next = [...prev, `[${new Date().toISOString().split("T")[1].slice(0, 12)}] ${randomLog()}`]
        return next.length > 8 ? next.slice(-8) : next
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <FadeIn delay={1}>
      <div className="fixed bottom-0 left-0 z-0 hidden lg:flex w-[320px] flex-col font-technical text-[10px] uppercase text-[#CCFF00] opacity-30 pointer-events-none mix-blend-screen px-6 pb-6">
        <div className="mb-2 border-b border-[#CCFF00]/30 pb-2 font-bold tracking-widest text-[#CCFF00]/60">
          :: PYTHIA_NODE_STREAM
        </div>
        <div className="flex flex-col gap-1 overflow-hidden h-[120px] justify-end">
          {logs.map((log, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap opacity-60">
              {log}
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  )
}
