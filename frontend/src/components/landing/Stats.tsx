import { useRef } from "react"
import { useInView } from "framer-motion"
import { FadeIn } from "@/components/FadeIn"

interface StatItem {
  value: string
  label: string
  color: string
}

const STATS: StatItem[] = [
  { value: "Dynamic", label: "Real-Time Odds", color: "text-oracle" },
  { value: "Cross-Chain", label: "Deposit From Anywhere", color: "text-gold" },
  { value: "Zero", label: "Wallet Popups", color: "text-yes" },
  { value: "2%", label: "Platform Fee", color: "text-oracle-soft" },
]

function RevealText({ value, color }: { value: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <span
      ref={ref}
      className={`text-[clamp(24px,4vw,36px)] font-extrabold tracking-tight transition-all duration-700 ${color} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {value}
    </span>
  )
}

export function Stats() {
  return (
    <section className="relative w-full px-4 py-16 sm:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1}>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <RevealText value={stat.value} color={stat.color} />
              <span className="text-[11px] font-semibold uppercase tracking-[2px] text-dim">
                {stat.label}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <div className="h-px bg-gradient-to-r from-transparent via-oracle/10 to-transparent" />
      </div>
    </section>
  )
}
