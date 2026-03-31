import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CreateMarketPage() {
  const [question, setQuestion] = useState("")
  const [deadline, setDeadline] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call contract createMarket
    console.log("Creating market:", { question, deadline })
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Market</h1>
        <p className="text-muted-foreground">
          Create a new prediction market for people to bet on.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Market Details</CardTitle>
          <CardDescription>
            Ask a binary question with a clear deadline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="question">Question</label>
              <Input
                id="question"
                placeholder="Will BTC hit $100K by April 10?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Must be a yes/no question with a clear outcome.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="deadline">Deadline</label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Betting closes at this time. Market can be resolved after.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!question.trim() || !deadline}
            >
              Create Market
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
