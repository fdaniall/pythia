import { FadeIn } from "@/components/FadeIn"
import { Button } from "@/components/ui/button"
import { ArrowRight, TerminalSquare } from "lucide-react"
import { Link } from "react-router-dom"

export function Hero() {
  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col bg-technical-grid pt-24"
      id="hero"
    >
      {/* Brutalist Gradient Overlay to fade grid at edges */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />

      {/* Main Content */}
      <div 
        className="relative z-[2] mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pb-20 pt-12 lg:px-12"
      >
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            <FadeIn>
              <div className="mb-6 inline-flex items-center gap-2 border border-[#333] bg-black px-4 py-2">
                <TerminalSquare className="size-4 text-[#CCFF00]" />
                <span className="font-technical text-[11px] font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
                  System Protocol v1.0.0
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-sans text-[clamp(64px,10vw,140px)] font-black uppercase leading-[0.95] tracking-tighter text-white">
                Hack <br />
                <span className="text-[#CCFF00]">The Future.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-8 max-w-[600px] font-technical text-[clamp(15px,1.5vw,18px)] leading-[1.6] text-[#888]">
                ZERO-BULLSHIT PREDICTION MARKETS. NATIVE ON INITIA. CREATE POOLS, SET ODDS, TAKE POSITIONS, EXTRACT LIQUIDITY. ALL ON-CHAIN.
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link to="/markets">
                  <Button
                    className="btn-acid h-14 px-8 font-technical text-[15px]"
                  >
                    Enter Oracle
                    <ArrowRight className="ml-3 size-5" strokeWidth={3} />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button
                    className="btn-outline-sharp h-14 px-8 font-technical text-[15px]"
                  >
                    Read Docs
                  </Button>
                </a>
              </div>
            </FadeIn>
          </div>
          
          <div className="lg:col-span-4 hidden lg:block">
            {/* Brutalist Data Widget */}
            <FadeIn delay={0.5}>
              <div className="brutalist-card p-6">
                <div className="border-b border-[#333] pb-4 mb-4 flex justify-between items-center">
                  <span className="font-technical text-[12px] text-[#888] uppercase">Live Market Data</span>
                  <div className="size-2 bg-[#CCFF00] animate-pulse"></div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2 leading-tight">Will ETH surpass $5k by end of Q2?</h3>
                    <div className="flex justify-between font-technical text-sm mb-1">
                      <span className="text-[#CCFF00]">YES 65%</span>
                      <span className="text-[#FF2A2A]">NO 35%</span>
                    </div>
                    <div className="h-2 w-full bg-[#111] flex">
                      <div className="h-full bg-[#CCFF00] w-[65%]"></div>
                      <div className="h-full bg-[#FF2A2A] w-[35%]"></div>
                    </div>
                  </div>
                  <div>
                  <h3 className="text-white font-bold text-lg mb-2 leading-tight">Initia Mainnet Launch this month?</h3>
                    <div className="flex justify-between font-technical text-sm mb-1">
                      <span className="text-[#CCFF00]">YES 82%</span>
                      <span className="text-[#FF2A2A]">NO 18%</span>
                    </div>
                    <div className="h-2 w-full bg-[#111] flex">
                      <div className="h-full bg-[#CCFF00] w-[82%]"></div>
                      <div className="h-full bg-[#FF2A2A] w-[18%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Marquee Banner */}
      <div className="w-full mt-auto marquee-container z-10">
        <div className="marquee-content">
          <span className="mx-8">SYSTEM ONLINE</span> ✦ 
          <span className="mx-8 text-black">NO WALLET POPUPS</span> ✦ 
          <span className="mx-8">CROSS-CHAIN DEPOSITS</span> ✦ 
          <span className="mx-8 text-black">PERMISSIONLESS POOLS</span> ✦ 
          <span className="mx-8">DYNAMIC ODDS</span> ✦ 
          <span className="mx-8 text-black">INITIA NATIVE</span> ✦ 
          <span className="mx-8">SYSTEM ONLINE</span> ✦ 
          <span className="mx-8 text-black">NO WALLET POPUPS</span> ✦ 
          <span className="mx-8">CROSS-CHAIN DEPOSITS</span> ✦ 
          <span className="mx-8 text-black">PERMISSIONLESS POOLS</span> ✦ 
          <span className="mx-8">DYNAMIC ODDS</span> ✦ 
          <span className="mx-8 text-black">INITIA NATIVE</span> ✦ 
        </div>
      </div>
    </section>
  )
}
