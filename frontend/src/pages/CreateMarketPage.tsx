import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PoolBar } from "@/components/PoolBar"
import { Sparkles, HelpCircle, Calendar, Eye, Clock } from "lucide-react"

export function CreateMarketPage() {
  const [question, setQuestion] = useState("")
  const [deadline, setDeadline] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call contract createMarket
    console.log("Creating market:", { question, deadline })
  }

  const deadlineDate = deadline ? new Date(deadline) : null
  const isValid = question.trim().length > 0 && deadline.length > 0

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Sparkles className="size-5 text-gold" />
          <h1 className="font-oracle text-oracle-gradient text-3xl italic">
            Create Market
          </h1>
        </div>
        <p className="text-[#7B6F94]">
          Ask the oracle. Create a new prediction for the world to bet on.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form */}
        <div className="glass-card rounded-xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-oracle/10">
              <HelpCircle className="size-4 text-oracle" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Market Details</h2>
              <p className="text-xs text-[#7B6F94]">Ask a binary question with a clear deadline.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#7B6F94]" htmlFor="question">
                  Question
                </label>
                <span className="text-xs text-[#44395A]">{question.length}/200</span>
              </div>
              <Input
                id="question"
                placeholder="Will BTC hit $100K by April 10?"
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
                className="border-oracle/10 bg-[rgba(155,109,255,0.04)] text-foreground placeholder:text-[#44395A] focus-visible:ring-oracle/30"
              />
              <p className="text-xs text-[#44395A]">
                Must be a yes/no question with a clear, verifiable outcome.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#7B6F94]" htmlFor="deadline">
                <Calendar className="size-3.5" />
                Deadline
              </label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="border-oracle/10 bg-[rgba(155,109,255,0.04)] text-foreground placeholder:text-[#44395A] focus-visible:ring-oracle/30"
              />
              <p className="text-xs text-[#44395A]">
                Betting closes at this time. Market can be resolved after.
              </p>
            </div>

            <Button
              type="submit"
              className="btn-shimmer w-full bg-gradient-to-r from-oracle to-oracle-deep text-white hover:shadow-[0_0_20px_rgba(155,109,255,0.3)] disabled:opacity-40"
              disabled={!isValid}
            >
              <Sparkles className="size-3.5" />
              Create Market
            </Button>
          </form>
        </div>

        {/* Live preview */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#44395A]">Live Preview</p>
          <div className="glass-card rounded-xl p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <h3 className="font-oracle text-lg leading-snug italic text-foreground">
                {question || "Your question will appear here..."}
              </h3>
              <Badge variant="success" className="shrink-0 gap-1">
                <span className="animate-oracle-pulse size-1.5 rounded-full bg-yes" />
                Live
              </Badge>
            </div>

            <div className="mb-4 flex items-center gap-3 text-xs text-[#7B6F94]">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {deadlineDate
                  ? deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "No deadline set"
                }
              </span>
              <span className="text-[#44395A]">&middot;</span>
              <span>0 bettors</span>
            </div>

            <PoolBar yesPool={0n} noPool={0n} />

            <div className="mt-4 rounded-lg bg-oracle/[0.04] p-3">
              <p className="text-center text-xs text-[#7B6F94]">
                This is how your market will look to bettors.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Eye className="size-4 text-oracle" />
              Tips for good markets
            </h3>
            <ul className="space-y-2 text-sm text-[#7B6F94]">
              <li className="flex gap-2">
                <span className="text-oracle">1.</span>
                Be specific — "Will BTC hit $100K by April 10?" not "Will BTC go up?"
              </li>
              <li className="flex gap-2">
                <span className="text-oracle">2.</span>
                Set a realistic deadline — too short and nobody bets, too long and people lose interest.
              </li>
              <li className="flex gap-2">
                <span className="text-oracle">3.</span>
                Make it verifiable — the outcome must be objectively provable.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
