import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PoolBar } from "@/components/PoolBar"
import { cn } from "@/lib/utils"

// Mock — will be replaced with on-chain read
const MOCK_MARKET = {
  id: 0,
  question: "Will BTC hit $100K by April 10?",
  deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 3),
  totalYesPool: 5000000000000000000n,
  totalNoPool: 3000000000000000000n,
  resolved: false,
  outcome: false,
  creator: "0x1234567890abcdef1234567890abcdef12345678",
  createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
}

export function MarketDetailPage() {
  const { id } = useParams()
  const [position, setPosition] = useState<boolean>(true)
  const [amount, setAmount] = useState("")

  const market = MOCK_MARKET // TODO: fetch by id

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to Markets
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{market.question}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="success">Open</Badge>
          <span>Market #{id}</span>
          <span>&middot;</span>
          <span>Ends {new Date(Number(market.deadline) * 1000).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Pool visualization */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pool Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PoolBar yesPool={market.totalYesPool} noPool={market.totalNoPool} />
          </CardContent>
        </Card>

        {/* Bet form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Place Your Bet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={position ? "default" : "outline"}
                className={cn(
                  position && "bg-green-600 hover:bg-green-700 text-white"
                )}
                onClick={() => setPosition(true)}
              >
                Yes
              </Button>
              <Button
                variant={!position ? "default" : "outline"}
                className={cn(
                  !position && "bg-red-600 hover:bg-red-700 text-white"
                )}
                onClick={() => setPosition(false)}
              >
                No
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="bet-amount">Amount (ETH)</label>
              <Input
                id="bet-amount"
                type="number"
                placeholder="0.1"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position</span>
                <span className={position ? "text-green-600" : "text-red-500"}>
                  {position ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee</span>
                <span>2%</span>
              </div>
            </div>

            <Button className="w-full" disabled={!amount || Number(amount) <= 0}>
              Place Bet
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Top bettors will appear here with their .init usernames.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
