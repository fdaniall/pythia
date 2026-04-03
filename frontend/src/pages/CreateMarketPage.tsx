import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDocTitle } from "@/hooks/useDocTitle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PoolBar } from "@/components/PoolBar"
import { FadeIn } from "@/components/FadeIn"
import { Sparkles, TerminalSquare, Calendar, Wallet, Lock, Clock, Eye, Bot, Loader2 } from "lucide-react"
import { generateMarketWithAI, type AIMarketSuggestion } from "@/lib/ai"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { useMoveCreateMarket } from "@/hooks/useMoveContract"

export function CreateMarketPage() {
  useDocTitle("Create Market")
  const navigate = useNavigate()
  const { isConnected, openConnect } = useInterwovenKit()
  const [question, setQuestion] = useState("")
  const [deadline, setDeadline] = useState("")
  const [created, setCreated] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState<AIMarketSuggestion | null>(null)

  const { mutate: createMarket, isPending } = useMoveCreateMarket()

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setAiError("")
    setAiSuggestion(null)
    try {
      const suggestion = await generateMarketWithAI(aiPrompt)
      setAiSuggestion(suggestion)
      setQuestion(suggestion.question)
      const deadlineDate = new Date(Date.now() + suggestion.deadlineDays * 24 * 60 * 60 * 1000)
      const local = new Date(deadlineDate.getTime() - deadlineDate.getTimezoneOffset() * 60000)
      setDeadline(local.toISOString().slice(0, 16))
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI generation failed")
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deadlineDate) return

    const deadlineUnixSec = Math.floor(deadlineDate.getTime() / 1000)
    createMarket(
      { question: question.trim(), deadlineUnixSec },
      {
        onSuccess: () => {
          setQuestion("")
          setDeadline("")
          setCreated(true)
          setTimeout(() => navigate("/markets"), 2000)
        },
      },
    )
  }

  const deadlineDate = deadline ? new Date(deadline) : null
  const minDeadlineMs = Date.now() + 60 * 60 * 1000 // at least 1 hour from now
  const isValid = question.trim().length > 0 && deadlineDate !== null && deadlineDate.getTime() > minDeadlineMs
  const isTooSoon = deadlineDate !== null && deadlineDate.getTime() > Date.now() && deadlineDate.getTime() <= minDeadlineMs

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
              Connect your wallet to create a prediction market. It takes 30 seconds.
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
            <p className="font-technical text-[12px] text-[#888] uppercase mt-1">Configure binary condition &amp; deadline.</p>
          </div>

          {created && (
            <div className="border-2 border-[#CCFF00] bg-[#CCFF00]/10 p-4 text-center mb-6">
              <p className="font-technical text-[13px] font-bold uppercase tracking-widest text-[#CCFF00]">
                MARKET CREATED SUCCESSFULLY
              </p>
              <p className="mt-1 font-technical text-[10px] uppercase tracking-widest text-[#888]">
                Redirecting to markets...
              </p>
            </div>
          )}

          {/* AI Generator */}
          <div className="border-2 border-dashed border-[#CCFF00]/30 bg-[#CCFF00]/[0.02] p-5 mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
              <span className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#CCFF00]">
                AI Market Generator
              </span>
            </div>
            <p className="font-technical text-[10px] uppercase text-[#888]">
              Describe your idea in plain language. AI will generate a well-structured market question, deadline, and resolution criteria.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. something about bitcoin price, next US election, AI replacing jobs..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAiGenerate())}
                disabled={aiLoading}
                className="h-11 flex-1 rounded-none border-[2px] border-[#333] bg-black px-4 font-technical text-[12px] text-white placeholder:text-[#555] focus-visible:border-[#CCFF00] focus-visible:ring-0"
              />
              <Button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
                className="btn-acid h-11 px-5 font-technical text-[11px] shrink-0"
              >
                {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <><Bot className="size-4 mr-1.5" />GENERATE</>}
              </Button>
            </div>
            {aiError && (
              <p className="font-technical text-[10px] uppercase text-[#FF2A2A]">{aiError}</p>
            )}
            {aiSuggestion && (
              <div className="border border-[#CCFF00]/30 bg-black p-4 space-y-2">
                <p className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">
                  AI SUGGESTION APPLIED
                </p>
                <p className="font-technical text-[11px] text-[#888]">
                  <span className="text-[#555]">Category:</span> <span className="text-white">{aiSuggestion.category.toUpperCase()}</span>
                  <span className="text-[#555] ml-3">Deadline:</span> <span className="text-white">{aiSuggestion.deadlineDays} days</span>
                </p>
                <p className="font-technical text-[11px] text-[#888]">
                  <span className="text-[#555]">Resolution:</span> <span className="text-[#888]">{aiSuggestion.resolutionCriteria}</span>
                </p>
                <div className="flex gap-2 mt-2">
                  {aiSuggestion.tags.map((tag) => (
                    <span key={tag} className="font-technical text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border border-[#CCFF00]/30 text-[#CCFF00]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#888]" htmlFor="question">
                  Market Question
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
                Tip: Your question must have a clear YES or NO answer. Or use AI Generator above.
              </p>
            </div>

            <div className="space-y-3">
              <label className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#888] flex items-center gap-2" htmlFor="deadline">
                <Calendar className="size-4" />
                Betting Deadline
              </label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-14 rounded-none border-[2px] border-[#333] bg-black px-4 font-technical text-[14px] font-bold uppercase text-white placeholder:text-[#555] focus-visible:border-[#CCFF00] focus-visible:ring-0"
                style={{ colorScheme: "dark" }}
              />
              {isTooSoon && (
                <p className="font-technical text-[10px] uppercase text-[#FF2A2A]">
                  Deadline must be at least 1 hour from now.
                </p>
              )}
              <p className="font-technical text-[10px] uppercase text-[#555]">
                Betting closes at this time. After expiry, market awaits resolution. Minimum 1 hour from now.
              </p>
            </div>

            <Button
              type="submit"
              className="btn-acid h-14 w-full font-technical text-[14px] mt-4"
              disabled={!isValid || isPending}
            >
              <Sparkles className="mr-2 size-4" strokeWidth={2.5} />
              {isPending ? "DEPLOYING..." : "CREATE MARKET"}
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
                This is how your market will appear to bettors.
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
                Resolution relies on admin oracle. Falsified data results in slashing.
              </li>
            </ul>
          </div>
        </div>
        </FadeIn>
      </div>
    </div>
  )
}
