import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground">
          Your bets and winnings across all markets.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to see your betting history.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
