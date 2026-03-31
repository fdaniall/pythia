import { FadeIn } from "@/components/FadeIn"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const TRUST_BADGES = ["Built on Initia", "MiniEVM", "Open Source"] as const

export function CTA() {
  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden px-4 py-24 text-center sm:px-8 md:py-32"
      style={{
        background: "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(155, 109, 255, 0.1) 0%, transparent 65%), #07050F",
      }}
      id="cta"
    >
      {/* Background wordmark */}
      <div
        aria-hidden="true"
        className="font-oracle pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[clamp(120px,25vw,300px)] italic leading-none text-white/[0.02]"
      >
        PYTHIA
      </div>

      <FadeIn>
        <h2 className="font-oracle relative z-10 max-w-[640px] text-[clamp(32px,8vw,60px)] italic leading-[1.2] tracking-tight text-foreground">
          The oracle awaits your prediction.
        </h2>
      </FadeIn>

      <FadeIn delay={0.15} className="relative z-10">
        <Link to="/markets" className="mt-10 inline-block">
          <Button
            className="btn-shimmer gap-2 bg-gradient-to-r from-oracle to-oracle-deep px-8 py-3 text-base text-white shadow-[0_0_30px_rgba(155,109,255,0.25)] hover:shadow-[0_0_50px_rgba(155,109,255,0.4)]"
            size="lg"
          >
            Start Predicting
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-3">
          {TRUST_BADGES.map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-dim"
            >
              {label}
            </span>
          ))}
        </div>
      </FadeIn>
    </section>
  )
}
