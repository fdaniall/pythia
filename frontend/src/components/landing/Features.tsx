import { useRef, useCallback, type ReactNode } from "react"
import { FadeIn } from "@/components/FadeIn"
import { cn } from "@/lib/utils"
import { Zap, Globe, AtSign, Shield, TrendingUp, Coins } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Auto-Signing",
    description: "Enable a session and bet freely without wallet popups. High-frequency betting that feels like Web2.",
    accent: "oracle",
  },
  {
    icon: Globe,
    title: "Interwoven Bridge",
    description: "Deposit from any chain into Pythia. No manual bridging — seamless cross-chain onboarding.",
    accent: "oracle",
  },
  {
    icon: AtSign,
    title: ".init Usernames",
    description: "Leaderboards show alice.init instead of 0x addresses. Human-readable identities, powered by Initia.",
    accent: "oracle",
  },
  {
    icon: TrendingUp,
    title: "Dynamic Odds",
    description: "Payout ratios shift with the pool. Early conviction gets rewarded — just like real prediction markets.",
    accent: "gold",
  },
  {
    icon: Shield,
    title: "On-Chain & Secure",
    description: "Real bets, real payouts, real smart contracts. Reentrancy-safe. No mock transactions.",
    accent: "gold",
  },
  {
    icon: Coins,
    title: "Own Your Economics",
    description: "Deployed as its own Initia appchain. All gas fees and platform revenue stay with the protocol.",
    accent: "gold",
  },
]

const accentMap: Record<string, { border: string; bg: string; glow: string; icon: string }> = {
  oracle: {
    border: "border-oracle/15 group-hover:border-oracle/35",
    bg: "from-oracle/10 to-oracle/[0.02]",
    glow: "group-hover:shadow-[0_0_30px_rgba(155,109,255,0.15)]",
    icon: "text-oracle-soft",
  },
  gold: {
    border: "border-gold/15 group-hover:border-gold/35",
    bg: "from-gold/10 to-gold/[0.02]",
    glow: "group-hover:shadow-[0_0_30px_rgba(255,215,0,0.12)]",
    icon: "text-gold-soft",
  },
}

function FeatureCard({ children, className }: { children: ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !glowRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    glowRef.current.style.background =
      `radial-gradient(600px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(155,109,255,0.07), transparent 40%)`
  }, [])

  const onLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.background = "transparent"
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("glass-card group relative overflow-hidden rounded-xl p-7", className)}
    >
      <div ref={glowRef} className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function Features() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-20 sm:px-8 md:py-28" id="features">
      {/* Header */}
      <div className="mb-16 flex flex-col items-center text-center">
        <FadeIn>
          <span className="mb-4 block text-[14px] font-semibold uppercase tracking-[3px] text-gold">
            Initia Native
          </span>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="font-oracle text-[clamp(32px,5vw,56px)] italic text-foreground">
            Built different. Built on Initia.
          </h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="mt-4 max-w-[480px] text-[17px] leading-[1.7] text-muted-foreground">
            Pythia integrates all three Initia-native features for an experience
            no other chain can offer.
          </p>
        </FadeIn>
      </div>

      {/* Feature grid */}
      <div className="mx-auto grid max-w-[1000px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const a = accentMap[feature.accent]
          return (
            <FadeIn
              key={feature.title}
              delay={i * 0.1}
              className={cn(
                i === 0 && "sm:col-span-2",
                i === features.length - 1 && "sm:col-span-2 lg:col-span-3"
              )}
            >
              <FeatureCard className="h-full">
                <div className={`mb-5 flex size-12 items-center justify-center rounded-[14px] border bg-gradient-to-br transition-all duration-300 group-hover:-translate-y-0.5 ${a.border} ${a.bg} ${a.glow}`}>
                  <feature.icon size={22} className={a.icon} />
                </div>
                <h3 className="mb-2 text-[18px] font-semibold text-foreground transition-colors group-hover:text-white">
                  {feature.title}
                </h3>
                <p className="text-[15px] leading-[1.65] text-muted-foreground">
                  {feature.description}
                </p>
              </FeatureCard>
            </FadeIn>
          )
        })}
      </div>

      {/* Bottom divider */}
      <div className="mx-auto mt-20 max-w-5xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-oracle/10 to-transparent" />
      </div>
    </section>
  )
}
