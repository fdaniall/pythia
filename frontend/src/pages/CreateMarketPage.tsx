import { useState } from "react"
import { useDocTitle } from "@/hooks/useDocTitle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PoolBar } from "@/components/PoolBar"
import { FadeIn } from "@/components/FadeIn"
import { Sparkles, TerminalSquare, Calendar, Wallet, Lock, Clock, Eye } from "lucide-react"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { toast } from "sonner"

export function CreateMarketPage() {
  useDocTitle("Create Market")
  const { isConnected, openConnect } = useInterwovenKit()
  const [question, setQuestion] = useState("")
  const [deadline, setDeadline] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call contract createMarket
    toast.success("Market Created Successfully", {
      description: "Your prediction market is now live and accepting bets.",
      duration: 5000,
    })
  }

  const deadlineDate = deadline ? new Date(deadline) : null
  const isValid = question.trim().length > 0 && deadlineDate !== null && deadlineDate.getTime() > Date.now()

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <FadeIn>
          <div className="brutalist-card bg-black p-12 text-center max-w-[600px] mx-auto border-dashed">
            <Lock className="size-12 text-[#FF2A2A] mx-auto mb-6 opacity-80" strokeWidth={1.5} />
            <h1 className="font-sans text-[clamp(24px,4vw,36px)] font-black uppercase leading-[1.1] tracking-tighter text-white mb-4">
              CONNECT TO CONTINUE
            </h1>
            <p className="font-technical text-[14px] leading-[1.6] text-[#888] uppercase mb-8">
              System deployment protocol requires an authenticated wallet node. Please secure a connection before initializing a new prediction market.
            </p>
            <Button
              className="btn-acid h-14 w-full font-technical text-[14px]"
              onClick={openConnect}
            >
              <Wallet className="mr-2 size-4" strokeWidth={2.5} />
              CONNECT WALLET
            </Button>
          </div>
        </FadeIn>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* Header */}
      <FadeIn>
      <div className="space-y-3 mb-4">
        <div className="inline-flex items-center gap-2 border border-[#333] bg-black px-3 py-1">
          <TerminalSquare className="size-3 text-[#CCFF00]" />
          <span className="font-technical text-[10px] font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
            Deployment Utility
          </span>
        </div>
        <h1 className="font-sans text-[clamp(40px,6vw,72px)] font-black uppercase leading-[0.9] tracking-tighter text-white">
          INITIALIZE <span className="text-[#CCFF00]">POOL.</span>
        </h1>
        <p className="font-technical text-[14px] leading-[1.6] text-[#888] uppercase max-w-[500px]">
          Deploy a new prediction market smart contract to the interwoven network.
        </p>
      </div>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* Form */}
        <FadeIn delay={0.1}>
        <div className="brutalist-card bg-black p-8">
          <div className="mb-6 border-b-2 border-[#333] pb-4">
            <h2 className="font-technical text-[18px] font-bold uppercase tracking-widest text-white">System Parameters</h2>
            <p className="font-technical text-[12px] text-[#888] uppercase mt-1">Configure binary condition & deadline.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#888]" htmlFor="question">
                  Condition String
                </label>
                <span className="font-technical text-[10px] text-[#555]">{question.length}/200</span>
              </div>
              <Input
                id="question"
                placeholder="Will BTC hit $100K by April 10?"
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
                className="h-14 rounded-none border-[2px] border-[#333] bg-black px-4 font-sans text-[16px] font-bold text-white placeholder:text-[#555] focus-visible:border-[#CCFF00] focus-visible:ring-0"
              />
              <p className="font-technical text-[10px] uppercase text-[#555]">
                // Must be resolvable to absolute TRUE or FALSE.
              </p>
            </div>

            <div className="space-y-3">
              <label className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#888] flex items-center gap-2" htmlFor="deadline">
                <Calendar className="size-4" />
                Expiration Timestamp
              </label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-14 rounded-none border-[2px] border-[#333] bg-black px-4 font-technical text-[14px] font-bold uppercase text-white placeholder:text-[#555] focus-visible:border-[#CCFF00] focus-visible:ring-0"
                style={{ colorScheme: "dark" }}
              />
              <p className="font-technical text-[10px] uppercase text-[#555]">
                // Contract settlement unlocked after threshold.
              </p>
            </div>

            <Button
              type="submit"
              className="btn-acid h-14 w-full font-technical text-[14px] mt-4"
              disabled={!isValid}
            >
              <Sparkles className="mr-2 size-4" strokeWidth={2.5} />
              CREATE MARKET
            </Button>
          </form>
        </div>
        </FadeIn>

        {/* Live preview */}
        <FadeIn delay={0.2}>
        <div className="space-y-6">
          <p className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#CCFF00]">
            // LIVE RENDER PREVIEW
          </p>
          <div className="brutalist-card bg-black p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="font-sans text-[22px] font-black uppercase leading-[1.1] tracking-tighter text-white">
                {question || "AWAITING INPUT..."}
              </h3>
              <div className="flex shrink-0 items-center justify-center gap-1.5 border-2 border-transparent bg-[#CCFF00] px-2.5 py-1 font-technical text-[10px] font-bold tracking-widest text-black">
                <span className="size-1.5 bg-black animate-pulse" />
                LIVE
              </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3 font-technical text-[11px] font-bold uppercase tracking-widest text-[#888]">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {deadlineDate
                  ? deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "UNSET"
                }
              </span>
              <span className="text-[#333]">&middot;</span>
              <span>0 BETTORS</span>
              <span className="text-[#333]">&middot;</span>
              <span className="text-white">0.0 INIT</span>
            </div>

            <PoolBar yesPool={0n} noPool={0n} />

            <div className="mt-6 border-t border-[#333] pt-4">
              <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#555] text-center">
                THIS IS EXTREMELY ACCURATE.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="brutalist-card bg-black p-6 border-transparent bg-[#111]">
            <h3 className="mb-4 flex items-center gap-2 font-technical text-[14px] font-bold uppercase tracking-widest text-white">
              <Eye className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
              ORACLE DIRECTIVES
            </h3>
            <ul className="space-y-3 font-technical text-[12px] uppercase text-[#888] leading-relaxed">
              <li className="flex gap-3">
                <span className="text-[#CCFF00] font-black">[1]</span>
                Condition string must be explicit. No ambiguities. Example: "BTC &gt; $100K?"
              </li>
              <li className="flex gap-3">
                <span className="text-[#CCFF00] font-black">[2]</span>
                Expiration timestamp regulates liquidity lock. Optimize for volatility.
              </li>
              <li className="flex gap-3">
                <span className="text-[#CCFF00] font-black">[3]</span>
                Resolution relies on UMA Optimistic Oracle. Falsified data results in slashing.
              </li>
            </ul>
          </div>
        </div>
        </FadeIn>
      </div>
    </div>
  )
}
