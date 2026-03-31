import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { FadeIn } from "@/components/FadeIn"
import { Button } from "@/components/ui/button"
import { ArrowRight, Eye } from "lucide-react"
import { Link } from "react-router-dom"

function AutoplayVideo({ src, className, poster }: { src: string; className: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.play().catch(() => setBlocked(true))
  }, [])

  if (blocked) {
    return <img src={poster} alt="" className={className} />
  }

  return (
    <video ref={ref} loop muted playsInline preload="metadata" poster={poster} className={className}>
      <source src={src} type="video/mp4" />
    </video>
  )
}

export function Hero() {
  const { scrollY } = useScroll()
  const scrollOpacity = useTransform(scrollY, [0, 100], [1, 0])

  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden pb-10"
      id="hero"
    >
      {/* Video background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_60%,#1a0840_0%,#0a0520_40%,#07050F_100%)]">
        <AutoplayVideo
          src="/hero-video.mp4"
          poster="/hero-poster.jpg"
          className="hidden h-full w-full object-cover object-center md:block"
        />
        <AutoplayVideo
          src="/hero-video-mobile.mp4"
          poster="/hero-poster.jpg"
          className="h-full w-full object-cover object-center md:hidden"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,5,15,0.3)_0%,rgba(7,5,15,0.7)_70%,rgba(7,5,15,0.95)_100%),linear-gradient(to_bottom,transparent_0%,transparent_60%,#07050F_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-[2] flex max-w-[800px] flex-col items-center px-4 text-center sm:px-6">
        <FadeIn>
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-oracle/20 bg-oracle/5 backdrop-blur-sm">
            <Eye className="size-8 text-oracle" strokeWidth={1.5} />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="font-oracle text-[clamp(48px,12vw,120px)] font-normal italic leading-none tracking-tight text-white [text-shadow:0_0_80px_rgba(155,109,255,0.35),0_0_160px_rgba(155,109,255,0.1)]">
            Pythia
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="font-oracle mt-5 text-[clamp(18px,3vw,28px)] italic leading-[1.4] text-white/85">
            See the future. Bet on it.
          </p>
        </FadeIn>

        <FadeIn delay={0.35}>
          <p className="mt-4 max-w-[520px] text-[clamp(14px,1.5vw,18px)] leading-[1.7] text-muted-foreground">
            The prediction market on Initia. Create markets, bet on outcomes
            with dynamic odds, and claim winnings — all on-chain, from any chain.
          </p>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="mt-10 flex items-center gap-4 max-[768px]:w-full max-[768px]:max-w-[280px] max-[768px]:flex-col">
            <Link to="/markets">
              <Button
                className="btn-shimmer gap-2 bg-gradient-to-r from-oracle to-oracle-deep px-6 py-2.5 text-white shadow-[0_0_30px_rgba(155,109,255,0.25)] hover:shadow-[0_0_40px_rgba(155,109,255,0.4)]"
                size="lg"
              >
                Launch App
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="border-white/[0.1] bg-white/[0.03] text-muted-foreground backdrop-blur-sm hover:border-oracle/30 hover:text-foreground"
              >
                How It Works
              </Button>
            </a>
          </div>
        </FadeIn>
      </div>

      {/* Scroll indicator */}
      <FadeIn delay={0.8} className="absolute bottom-4 z-[2] md:bottom-12">
        <motion.div style={{ opacity: scrollOpacity }} className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[4px] text-dim">
            Scroll
          </span>
          <div className="scroll-line" />
        </motion.div>
      </FadeIn>
    </section>
  )
}
