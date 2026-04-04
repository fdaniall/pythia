import { useRef, useEffect, useState } from "react"
import { FadeIn } from "@/components/FadeIn"

interface StatItem {
  value: string
  label: string
  color: string
}

const STATS: StatItem[] = [
  { value: "Dynamic", label: "Real-Time Odds", color: "text-[#CCFF00]" },
  { value: "Cross-Chain", label: "Deposit From Anywhere", color: "text-white" },
  { value: "Zero", label: "Wallet Popups", color: "text-[#CCFF00]" },
  { value: "2%", label: "Platform Fee", color: "text-white" },
]

function RevealText({ value, color }: { value: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <span
      ref={ref}
      className={`whitespace-nowrap font-technical text-[clamp(24px,4vw,36px)] font-bold uppercase tracking-widest transition-all duration-700 ${color} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {value}
    </span>
  )
}

export function Stats() {
  return (
    <section className="relative w-full bg-black px-4 py-16 sm:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1}>
            <div className="flex flex-col items-center gap-2 text-center">
              <RevealText value={stat.value} color={stat.color} />
              <span className="font-technical text-[12px] font-bold uppercase tracking-[0.2em] text-[#555]">
                {stat.label}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <div className="h-[1px] w-full bg-[#333333]" />
      </div>
    </section>
  )
}
