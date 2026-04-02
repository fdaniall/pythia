import { FadeIn } from "@/components/FadeIn"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const TRUST_BADGES = ["BUILT ON INITIA", "MOVE NATIVE", "PERMISSIONLESS"]

export function CTA() {
  return (
    <section
      className="relative flex w-full flex-col items-center bg-[#CCFF00] overflow-hidden px-4 py-24 text-center sm:px-8 md:py-32"
      id="cta"
    >
      <FadeIn>
        <div className="mb-8 flex justify-center">
          <div className="flex size-16 items-center justify-center border-[2px] border-black p-2 bg-black">
            <img src="/pythia-logo.svg" alt="Pythia Logo" className="size-full object-contain" />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <h2 className="font-sans relative z-10 max-w-[800px] text-[clamp(48px,10vw,90px)] font-black uppercase leading-[0.9] tracking-tighter text-black">
          SYSTEM READY.<br />DEPLOY CAPITAL.
        </h2>
      </FadeIn>

      <FadeIn delay={0.2} className="relative z-10">
        <Link to="/markets" className="mt-12 inline-block">
          <Button
            className="h-16 px-10 border-[3px] border-black bg-black text-[#CCFF00] font-technical text-[18px] font-bold uppercase transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            INITIALIZE SEQUENCE
            <ArrowRight className="ml-3 size-6" strokeWidth={3} />
          </Button>
        </Link>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="relative z-10 mt-16 flex flex-wrap items-center justify-center gap-4">
          {TRUST_BADGES.map((label) => (
            <span
              key={label}
              className="border border-black px-4 py-1.5 font-technical text-[12px] font-bold uppercase tracking-[0.1em] text-black"
            >
              {label}
            </span>
          ))}
        </div>
      </FadeIn>
    </section>
  )
}
