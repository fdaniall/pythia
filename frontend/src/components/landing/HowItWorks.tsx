import { FadeIn } from "@/components/FadeIn"
import { HelpCircle, Coins, Trophy } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: HelpCircle,
    title: "CREATE POOL",
    description: "Ask a question about the future. Set a deadline. The oracle is open — anyone can create a prediction market.",
    preview: { label: "Sample market", value: "BTC > $100K?" },
  },
  {
    number: "02",
    icon: Coins,
    title: "TAKE POSITION",
    description: "Pick Yes or No. Deposit tokens from any chain. Enable auto-signing — bet freely without wallet popups.",
    preview: { label: "Your position", value: "1.5 ETH / YES" },
  },
  {
    number: "03",
    icon: Trophy,
    title: "EXTRACT",
    description: "When the market resolves, winners claim proportional payouts from the total pool. Your conviction, rewarded.",
    preview: { label: "Est. Payout", value: "+2.8 ETH" },
  },
]

export function HowItWorks() {
  return (
    <section className="relative w-full bg-black overflow-hidden py-20 md:py-28" id="how-it-works">
      {/* Header */}
      <div className="mx-auto mb-16 flex max-w-5xl flex-col items-center px-4 text-center">
        <FadeIn>
          <span className="mb-4 block font-technical text-[12px] font-bold uppercase tracking-[0.3em] text-[#CCFF00]">
            // EXECUTION FLOW
          </span>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="font-sans text-[clamp(40px,6vw,72px)] font-black uppercase leading-none tracking-tighter text-white">
            THREE PHASES.
            <br />
            <span className="text-[#888]">INFINITE MARKETS.</span>
          </h2>
        </FadeIn>
      </div>

      {/* Steps */}
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={i * 0.15}>
              <div className="brutalist-card p-8 h-full flex flex-col relative group">
                
                <div className="mb-8 flex justify-between items-start">
                  <div className="flex size-14 items-center justify-center bg-[#CCFF00] border border-[#CCFF00] transition-transform group-hover:rotate-12 group-hover:bg-white">
                    <step.icon size={28} className="text-black" strokeWidth={2.5} />
                  </div>
                  <span className="font-technical text-4xl font-black text-[#333] transition-colors group-hover:text-white">
                    {step.number}
                  </span>
                </div>

                <h3 className="mb-4 font-technical text-[22px] font-bold uppercase tracking-tight text-white">
                  {step.title}
                </h3>

                <p className="mb-8 font-technical text-[14px] leading-[1.6] text-[#888] flex-1">
                  {step.description}
                </p>

                {/* Preview Data */}
                <div className="mt-auto border-t border-[#333] pt-6 bg-black">
                  <div className="flex justify-between items-center">
                    <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#555]">
                      {step.preview.label}
                    </span>
                    <span className={`font-technical text-[14px] font-bold ${i === 2 ? "text-white" : "text-[#CCFF00]"}`}>
                      {step.preview.value}
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="mx-auto mt-20 max-w-[1200px] px-6">
        <div className="h-[1px] w-full bg-[#333333]" />
      </div>
    </section>
  )
}
