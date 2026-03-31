import { FadeIn } from "@/components/FadeIn"
import { HelpCircle, Coins, Trophy, ChevronRight } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: HelpCircle,
    title: "Create",
    description: "Ask a question about the future. Set a deadline. The oracle is open — anyone can create a prediction market.",
    preview: { label: "Sample market", value: '"Will BTC hit $100K?"' },
  },
  {
    number: "02",
    icon: Coins,
    title: "Bet",
    description: "Pick Yes or No. Deposit tokens from any chain. Enable auto-signing — bet freely without wallet popups.",
    preview: { label: "Your position", value: "1.5 ETH on Yes" },
  },
  {
    number: "03",
    icon: Trophy,
    title: "Claim",
    description: "When the market resolves, winners claim proportional payouts from the total pool. Your conviction, rewarded.",
    preview: { label: "Payout", value: "+2.8 ETH" },
  },
]

export function HowItWorks() {
  return (
    <section className="relative w-full overflow-hidden py-20 md:py-28" id="how-it-works">
      {/* Background glow */}
      <div className="pointer-events-none absolute right-[-15%] top-[30%] hidden size-[600px] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#9B6DFF_0deg,#3a1a7c_360deg)] opacity-[0.08] blur-[120px] md:block" />

      {/* Header */}
      <div className="mx-auto mb-16 flex max-w-5xl flex-col items-center px-4 text-center">
        <FadeIn>
          <span className="mb-4 block text-[14px] font-semibold uppercase tracking-[3px] text-oracle">
            How It Works
          </span>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="font-oracle text-[clamp(32px,5vw,56px)] italic text-foreground">
            Three steps. Infinite predictions.
          </h2>
        </FadeIn>
      </div>

      {/* Steps — simple 3-col grid */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={i * 0.15}>
              <div className="group relative text-center">
                {/* Arrow connector (between cards, desktop only) */}
                {i < steps.length - 1 && (
                  <div className="pointer-events-none absolute -right-3 top-[52px] z-10 hidden md:block">
                    <ChevronRight className="size-5 text-oracle/25" />
                  </div>
                )}

                {/* Icon */}
                <div className="mx-auto mb-6 flex size-[72px] items-center justify-center rounded-[20px] border border-oracle/15 bg-gradient-to-br from-oracle/10 to-oracle/[0.02] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-oracle/35 group-hover:shadow-[0_0_30px_rgba(155,109,255,0.15)]">
                  <step.icon size={28} className="text-oracle-soft" />
                </div>

                {/* Number */}
                <span className="mb-3 block text-[15px] font-semibold tracking-[2px] text-dim">
                  {step.number}
                </span>

                {/* Title */}
                <h3 className="mb-3 text-[24px] font-semibold tracking-[-0.3px] text-foreground transition-colors duration-300 group-hover:text-white">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mx-auto max-w-[280px] text-[15px] leading-[1.7] text-muted-foreground">
                  {step.description}
                </p>

                {/* Preview */}
                <div className="mt-6 flex flex-col items-center gap-2 border-t border-white/[0.05] pt-5">
                  <span className="text-[11px] font-semibold uppercase tracking-[2px] text-dim">
                    {step.preview.label}
                  </span>
                  <span className={`text-[20px] font-bold tracking-[-0.5px] ${i === 2 ? "text-gold" : "text-oracle-soft"}`}>
                    {step.preview.value}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="mx-auto mt-20 max-w-5xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-oracle/10 to-transparent" />
      </div>
    </section>
  )
}
