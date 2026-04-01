import { Link } from "react-router-dom"
import { FadeIn } from "@/components/FadeIn"
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
  active: { label: "ACTIVE", color: "text-[#CCFF00]", icon: Clock },
  won: { label: "WON", color: "text-white", icon: Trophy },
  lost: { label: "LOST", color: "text-[#FF2A2A]", icon: TrendingDown },
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
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="space-y-3 mb-4">
          <div className="inline-flex items-center gap-2 border border-[#333] bg-black px-3 py-1">
            <BarChart3 className="size-3 text-[#CCFF00]" />
            <span className="font-technical text-[10px] font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
              User Portfolio
            </span>
          </div>
          <h1 className="font-sans text-[clamp(40px,6vw,72px)] font-black uppercase leading-[0.9] tracking-tighter text-white">
            YOUR <span className="text-[#CCFF00]">POSITIONS.</span>
          </h1>
          <p className="font-technical text-[14px] leading-[1.6] text-[#888] uppercase max-w-[500px]">
            Track active bets and historical performance on-chain.
          </p>
        </div>
      </FadeIn>

      {/* Stats overview */}
      <FadeIn delay={0.1}>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-[#888]" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">ACTIVE BETS</p>
          </div>
          <p className="font-sans text-3xl font-black text-white">{activeBets.length}</p>
        </div>
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">TOTAL WINNINGS</p>
          </div>
          <p className="font-sans text-3xl font-black text-[#CCFF00]">{totalWinnings} <span className="text-xl text-black">ETH</span></p>
        </div>
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-4 text-white" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">WIN RATE</p>
          </div>
          <p className="font-sans text-3xl font-black text-white">{winRate}%</p>
        </div>
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="size-4 text-[#888]" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">TOTAL WAGERED</p>
          </div>
          <p className="font-sans text-3xl font-black text-white">5.8 <span className="text-xl text-[#555]">ETH</span></p>
        </div>
      </div>
      </FadeIn>

      {/* Bets list */}
      <FadeIn delay={0.15}>
      <div className="brutalist-card bg-black p-6">
        <div className="mb-6 flex items-center justify-between border-b border-[#333] pb-4 bg-black">
          <h2 className="font-technical text-[14px] font-bold tracking-widest uppercase text-white">Execution Log</h2>
        </div>
        <div className="space-y-4">
          {MOCK_BETS.map((bet) => {
            const config = statusConfig[bet.status]
            const StatusIcon = config.icon
            return (
              <Link
                key={`${bet.id}-${bet.position}`}
                to={`/markets/${bet.id}`}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#333] bg-[#050505] p-4 transition-all hover:border-[#CCFF00] hover:bg-[#111]"
              >
                <div className="flex-1 space-y-2">
                  <h3 className="font-sans text-[18px] font-black uppercase leading-tight text-white group-hover:text-[#CCFF00]">
                    {bet.question}
                  </h3>
                  <div className="flex items-center gap-3 font-technical text-[11px] font-bold uppercase tracking-widest text-[#888]">
                    <span className={cn(
                      "px-2 py-0.5 border", 
                      bet.position === "Yes" ? "bg-[#CCFF00] text-black border-[#CCFF00]" : "bg-[#FF2A2A] text-white border-[#FF2A2A]"
                    )}>
                      {bet.position}
                    </span>
                    <span className="text-white">{bet.amount}</span>
                    <span className="text-[#333]">&middot;</span>
                    <span>{bet.deadline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right flex flex-col gap-1">
                    <p className={cn("font-sans text-[18px] font-black uppercase text-white")}>
                      {bet.status === "won" ? `+${bet.potentialPayout}` : bet.status === "lost" ? `-${bet.amount}` : bet.potentialPayout}
                    </p>
                    <div className="flex items-center justify-end gap-1.5">
                      <StatusIcon className={cn("size-3", config.color)} strokeWidth={3} />
                      <span className={cn("font-technical text-[10px] font-bold tracking-widest uppercase", config.color)}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="size-5 text-[#555] transition-colors group-hover:text-[#CCFF00] hidden md:block" strokeWidth={2.5} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      </FadeIn>
    </div>
  )
}
