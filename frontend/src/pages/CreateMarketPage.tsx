import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, HelpCircle, Calendar } from "lucide-react"

export function CreateMarketPage() {
  const [question, setQuestion] = useState("")
  const [deadline, setDeadline] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call contract createMarket
    console.log("Creating market:", { question, deadline })
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
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
            <label className="text-sm font-medium text-[#7B6F94]" htmlFor="question">
              Question
            </label>
            <Input
              id="question"
              placeholder="Will BTC hit $100K by April 10?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="border-oracle/10 bg-[rgba(155,109,255,0.04)] text-foreground placeholder:text-[#44395A] focus-visible:ring-oracle/30"
            />
            <p className="text-xs text-[#44395A]">
              Must be a yes/no question with a clear outcome.
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
            disabled={!question.trim() || !deadline}
          >
            <Sparkles className="size-3.5" />
            Create Market
          </Button>
        </form>
      </div>
    </div>
  )
}
