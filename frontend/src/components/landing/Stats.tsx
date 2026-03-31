import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"
import { FadeIn } from "@/components/FadeIn"

interface StatItem {
  value: number
  suffix: string
  label: string
  color: string
}

const STATS: StatItem[] = [
  { value: 2, suffix: "%", label: "Platform Fee", color: "text-gold" },
  { value: 3, suffix: "", label: "Initia Features", color: "text-oracle" },
  { value: 35, suffix: "+", label: "Tests Passing", color: "text-yes" },
  { value: 0, suffix: "", label: "Wallet Popups", color: "text-oracle-soft" },
]

function AnimatedCounter({ value, suffix, color }: { value: number; suffix: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1200
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [inView, value])

  return (
    <span ref={ref} className={`text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight ${color}`}>
      {display}{suffix}
    </span>
  )
}

export function Stats() {
  return (
    <section className="relative w-full px-4 py-16 sm:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1}>
            <div className="flex flex-col items-center gap-1 text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} color={stat.color} />
              <span className="text-[11px] font-semibold uppercase tracking-[2px] text-[#44395A]">
                {stat.label}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-auto mt-16 max-w-5xl">
        <div className="h-px bg-gradient-to-r from-transparent via-oracle/10 to-transparent" />
      </div>
    </section>
  )
}
