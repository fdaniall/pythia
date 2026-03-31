import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  BarChart3, Wallet, Trophy, TrendingUp, TrendingDown,
  ArrowRight, Clock, CheckCircle,
} from "lucide-react"

const MOCK_BETS = [
  {
    id: 0,
    question: "Will BTC hit $100K by April 10?",
    position: "Yes" as const,
    amount: "1.5 ETH",
    potentialPayout: "2.4 ETH",
    status: "active" as const,
    deadline: "3d 12h left",
  },
  {
    id: 4,
    question: "Will the US approve a spot ETH ETF by Q2 2026?",
    position: "Yes" as const,
    amount: "2.0 ETH",
    potentialPayout: "3.1 ETH",
    status: "active" as const,
    deadline: "45d left",
  },
  {
    id: 7,
    question: "Will Initia mainnet launch before April 15?",
    position: "No" as const,
    amount: "0.5 ETH",
    potentialPayout: "2.0 ETH",
    status: "active" as const,
    deadline: "14d left",
  },
  {
    id: 2,
    question: "Will Initia reach 1M daily transactions by May?",
    position: "Yes" as const,
    amount: "0.8 ETH",
    potentialPayout: "1.6 ETH",
    status: "won" as const,
    deadline: "Resolved",
  },
  {
    id: 6,
    question: "Will total crypto market cap exceed $5T by year end?",
    position: "Yes" as const,
    amount: "1.0 ETH",
    potentialPayout: "0 ETH",
    status: "lost" as const,
    deadline: "Resolved",
  },
]

const statusConfig = {
  active: { label: "Active", color: "text-oracle", bg: "bg-oracle/10", icon: Clock },
  won: { label: "Won", color: "text-yes", bg: "bg-yes/10", icon: Trophy },
  lost: { label: "Lost", color: "text-no", bg: "bg-no/10", icon: TrendingDown },
}

export function PortfolioPage() {
  const activeBets = MOCK_BETS.filter((b) => b.status === "active")
  const wonBets = MOCK_BETS.filter((b) => b.status === "won")
  const lostBets = MOCK_BETS.filter((b) => b.status === "lost")
  const totalWinnings = "1.6"
  const winRate = wonBets.length > 0
    ? Math.round((wonBets.length / (wonBets.length + lostBets.length)) * 100)
    : 0

  return (
    <div className="space-y-6">
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
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="glass-card flex items-center gap-3 rounded-xl p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-oracle/10">
            <TrendingUp className="size-4 text-oracle" />
          </div>
          <div>
            <p className="text-xs text-[#7B6F94]">Active Bets</p>
            <p className="text-lg font-semibold text-foreground">{activeBets.length}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 rounded-xl p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gold/10">
            <Trophy className="size-4 text-gold" />
          </div>
          <div>
            <p className="text-xs text-[#7B6F94]">Total Winnings</p>
            <p className="text-lg font-semibold text-gold">{totalWinnings} ETH</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 rounded-xl p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-yes/10">
            <CheckCircle className="size-4 text-yes" />
          </div>
          <div>
            <p className="text-xs text-[#7B6F94]">Win Rate</p>
            <p className="text-lg font-semibold text-yes">{winRate}%</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 rounded-xl p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-oracle-soft/10">
            <Wallet className="size-4 text-oracle-soft" />
          </div>
          <div>
            <p className="text-xs text-[#7B6F94]">Total Wagered</p>
            <p className="text-lg font-semibold text-foreground">5.8 ETH</p>
          </div>
        </div>
      </div>

      {/* Bets list */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Your Bets</h2>
        <div className="space-y-3">
          {MOCK_BETS.map((bet) => {
            const config = statusConfig[bet.status]
            const StatusIcon = config.icon
            return (
              <Link
                key={`${bet.id}-${bet.position}`}
                to={`/markets/${bet.id}`}
                className="group flex items-center justify-between rounded-lg bg-[rgba(155,109,255,0.03)] px-4 py-3 transition-all hover:bg-[rgba(155,109,255,0.06)]"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-oracle-soft">
                      {bet.question}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#7B6F94]">
                    <Badge
                      variant={bet.position === "Yes" ? "success" : "destructive"}
                      className="text-[10px]"
                    >
                      {bet.position}
                    </Badge>
                    <span>{bet.amount}</span>
                    <span className="text-[#44395A]">&middot;</span>
                    <span>{bet.deadline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={cn("text-sm font-semibold", config.color)}>
                      {bet.status === "won" ? `+${bet.potentialPayout}` : bet.status === "lost" ? `-${bet.amount}` : bet.potentialPayout}
                    </p>
                    <div className="flex items-center justify-end gap-1">
                      <StatusIcon className={cn("size-3", config.color)} />
                      <span className={cn("text-[10px] font-medium", config.color)}>{config.label}</span>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-[#44395A] transition-colors group-hover:text-oracle" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
