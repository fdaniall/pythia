import { FadeIn } from "@/components/FadeIn"
import { cn } from "@/lib/utils"
import { Zap, Globe, AtSign, Shield, TrendingUp, Coins } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Auto-Signing",
    description: "Enable a session and bet freely without wallet popups. High-frequency betting that feels like Web2.",
    accent: "acid",
  },
  {
    icon: Globe,
    title: "Interwoven Bridge",
    description: "Deposit from any chain into Pythia. No manual bridging — seamless cross-chain onboarding.",
    accent: "acid",
  },
  {
    icon: AtSign,
    title: ".init Usernames",
    description: "Leaderboards show alice.init instead of 0x addresses. Human-readable identities, powered by Initia.",
    accent: "acid",
  },
  {
    icon: TrendingUp,
    title: "Dynamic Odds",
    description: "Payout ratios shift with the pool. Early conviction gets rewarded — just like real prediction markets.",
    accent: "white",
  },
  {
    icon: Shield,
    title: "On-Chain & Secure",
    description: "Real bets, real payouts, real smart contracts. Reentrancy-safe. No mock transactions.",
    accent: "white",
  },
  {
    icon: Coins,
    title: "Own Your Economics",
    description: "Deployed as its own Initia appchain. All gas fees and platform revenue stay with the protocol.",
    accent: "white",
  },
]

export function Features() {
  return (
    <section className="relative w-full bg-black px-4 py-20 sm:px-8 md:py-28" id="features">
      {/* Header */}
      <div className="mb-16 flex flex-col items-center text-center">
        <FadeIn>
          <span className="mb-3 block font-technical text-[12px] font-bold uppercase tracking-[0.3em] text-[#CCFF00]">
            // INITIA NATIVE ARCHITECTURE
          </span>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="font-sans text-[clamp(40px,6vw,72px)] font-black uppercase leading-none tracking-tighter text-white">
            BUILT DIFFERENT. <br />
            <span className="text-[#888]">BUILT FOR SCALE.</span>
          </h2>
        </FadeIn>
      </div>

      {/* Feature grid */}
      <div className="mx-auto grid max-w-[1200px] gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const isAcid = feature.accent === "acid";
          return (
            <FadeIn
              key={feature.title}
              delay={i * 0.1}
              className={cn(
                i === 0 && "sm:col-span-2",
                i === features.length - 1 && "sm:col-span-2 lg:col-span-3"
              )}
            >
              <div className="brutalist-card h-full p-8 flex flex-col items-start group">
                <div className={`mb-6 flex size-12 items-center justify-center border transition-all duration-300 group-hover:-translate-y-1 ${isAcid ? 'border-[#CCFF00] bg-[#CCFF00]' : 'border-[#333] bg-black group-hover:bg-[#333]'}`}>
                  <feature.icon size={22} className={isAcid ? 'text-black' : 'text-white'} strokeWidth={2.5} />
                </div>
                <h3 className="mb-3 font-technical text-[20px] font-bold uppercase tracking-tight text-white">
                  {feature.title}
                </h3>
                <p className="font-technical text-[14px] leading-[1.65] text-[#888]">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          )
        })}
      </div>

      {/* Bottom divider */}
      <div className="mx-auto mt-20 max-w-[1200px]">
        <div className="h-[1px] w-full bg-[#333333]" />
      </div>
    </section>
  )
}
