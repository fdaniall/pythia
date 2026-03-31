import { BarChart3, Wallet, Trophy, TrendingUp } from "lucide-react"

export function PortfolioPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="size-5 text-oracle" />
          <h1 className="font-oracle text-oracle-gradient text-3xl italic">
            Portfolio
          </h1>
        </div>
        <p className="text-[#7B6F94]">
          Your bets and winnings across all markets.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-xl p-5">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="size-4 text-oracle" />
            <p className="text-xs text-[#7B6F94]">Active Bets</p>
          </div>
          <p className="font-oracle text-2xl italic text-foreground">--</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="size-4 text-gold" />
            <p className="text-xs text-[#7B6F94]">Total Winnings</p>
          </div>
          <p className="font-oracle text-2xl italic text-gold">-- ETH</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="mb-2 flex items-center gap-2">
            <Wallet className="size-4 text-yes" />
            <p className="text-xs text-[#7B6F94]">Win Rate</p>
          </div>
          <p className="font-oracle text-2xl italic text-yes">--%</p>
        </div>
      </div>

      {/* Bets list */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Your Bets</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-oracle/10">
            <Wallet className="size-5 text-oracle" />
          </div>
          <p className="text-sm text-[#7B6F94]">
            Connect your wallet to see your betting history.
          </p>
        </div>
      </div>
    </div>
  )
}
