import { FadeIn } from "@/components/FadeIn"
import { HelpCircle, Coins, Trophy, ArrowRight } from "lucide-react"

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
    <section className="relative w-full px-4 py-20 sm:px-8 md:py-28" id="how-it-works">
      {/* Background glow */}
      <div className="pointer-events-none absolute right-[-15%] top-[30%] hidden size-[600px] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#9B6DFF_0deg,#3a1a7c_360deg)] opacity-[0.08] blur-[120px] md:block" />

      {/* Header */}
      <div className="mb-16 flex flex-col items-center text-center">
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

      {/* Steps */}
      <div className="mx-auto grid max-w-[1100px] items-start gap-10 max-lg:flex max-lg:flex-col max-lg:items-center lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {steps.map((step, i) => (
          <div key={step.number} className="contents">
            <FadeIn delay={i * 0.2} className="group w-full max-w-[400px] px-4 text-center lg:max-w-none">
              {/* Icon */}
              <div className="mx-auto mb-6 flex size-[72px] items-center justify-center rounded-[20px] border border-oracle/15 bg-gradient-to-br from-oracle/10 to-oracle/[0.02] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-oracle/35 group-hover:shadow-[0_0_30px_rgba(155,109,255,0.15)]">
                <step.icon size={28} className="text-oracle-soft" />
              </div>

              {/* Number */}
              <span className="mb-4 block text-[15px] font-semibold tracking-[2px] text-[#44395A]">
                {step.number}
              </span>

              {/* Title */}
              <h3 className="mb-3 text-[26px] font-semibold tracking-[-0.3px] text-foreground transition-colors duration-300 group-hover:text-white">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mx-auto max-w-[300px] text-[17px] leading-[1.7] text-[#7B6F94]">
                {step.description}
              </p>

              {/* Preview */}
              <div className="mt-7 flex flex-col items-center gap-2.5 border-t border-white/[0.05] pt-5">
                <span className="text-[12px] font-semibold uppercase tracking-[2px] text-[#44395A]">
                  {step.preview.label}
                </span>
                <span className={`text-[22px] font-bold tracking-[-0.5px] ${i === 2 ? "text-gold" : "text-oracle-soft"}`}>
                  {step.preview.value}
                </span>
              </div>
            </FadeIn>

            {/* Arrow between steps */}
            {i < steps.length - 1 && (
              <FadeIn delay={i * 0.2 + 0.15} className="hidden items-center pt-9 lg:flex">
                <div className="flex items-center gap-1">
                  <div className="h-px w-10 bg-gradient-to-r from-oracle/30 to-oracle/10" />
                  <ArrowRight className="size-3.5 text-oracle/30" />
                </div>
              </FadeIn>
            )}
          </div>
        ))}
      </div>

      {/* Bottom divider */}
      <div className="mx-auto mt-20 max-w-5xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-oracle/10 to-transparent" />
      </div>
    </section>
  )
}
