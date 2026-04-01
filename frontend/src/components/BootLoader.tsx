import { useState, useEffect } from "react"

const BOOT_SEQUENCE = [
  "INITIALIZING MINIEVM CONNECTION...",
  "VERIFYING ORACLE RESPONSES...",
  "SYNCING LIQUIDITY POOLS [||||      ]",
  "SYNCING LIQUIDITY POOLS [||||||||  ]",
  "SYNCING LIQUIDITY POOLS [||||||||||]",
  "DECRYPTING SMART CONTRACT STATE...",
  "LOADING PROTOCOL CORE...",
  "SYSTEM ZERO-BS PROTOCOL READY.",
]

export function BootLoader({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([])
  
  useEffect(() => {
    let currentLine = 0
    const interval = setInterval(() => {
      if (currentLine < BOOT_SEQUENCE.length) {
        setLines(prev => [...prev, BOOT_SEQUENCE[currentLine]])
        currentLine++
      } else {
        clearInterval(interval)
        setTimeout(onComplete, 400) // slight delay before fully vanishing
      }
    }, 150) // fast boot

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black p-8 pb-20 font-technical text-[clamp(14px,3vw,24px)] font-bold uppercase uppercase tracking-widest text-[#CCFF00]">
      <div className="flex flex-col gap-2">
        {lines.map((line, i) => (
          <div key={i} className="opacity-80">
            <span className="mr-4 text-white">{`>`}</span>
            {line}
          </div>
        ))}
        {/* Blinking cursor */}
        <div className="animate-pulse mt-4 w-4 h-[clamp(14px,3vw,24px)] bg-[#CCFF00]" />
      </div>
    </div>
  )
}
