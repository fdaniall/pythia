import { useState, useMemo } from "react"
import { MarketCard } from "@/components/MarketCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, TrendingUp, Users, Coins, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { formatEther } from "viem"
import type { Market } from "@/types/market"
import { getMarketStatus } from "@/types/market"

const MOCK_MARKETS: Market[] = [
  {
    id: 0,
    question: "Will BTC hit $100K by April 10?",
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 3),
    totalYesPool: 5000000000000000000n,
    totalNoPool: 3000000000000000000n,
    resolved: false,
    outcome: false,
    creator: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
    bettorCount: 24,
  },
  {
    id: 1,
    question: "Will ETH flip BTC market cap in 2026?",
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
    totalYesPool: 1000000000000000000n,
    totalNoPool: 8000000000000000000n,
    resolved: false,
    outcome: false,
    creator: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 7200),
    bettorCount: 41,
  },
  {
    id: 2,
    question: "Will Initia reach 1M daily transactions by May?",
    deadline: BigInt(Math.floor(Date.now() / 1000) - 3600),
    totalYesPool: 2000000000000000000n,
    totalNoPool: 2000000000000000000n,
    resolved: true,
    outcome: true,
    creator: "0x1111111111111111111111111111111111111111",
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 7),
    bettorCount: 18,
  },
  {
    id: 3,
    question: "Will Solana have a major outage before June 2026?",
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 60),
    totalYesPool: 3500000000000000000n,
    totalNoPool: 1500000000000000000n,
    resolved: false,
    outcome: false,
    creator: "0x2222222222222222222222222222222222222222",
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 2),
    bettorCount: 33,
  },
  {
    id: 4,
    question: "Will the US approve a spot ETH ETF by Q2 2026?",
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 45),
    totalYesPool: 7000000000000000000n,
    totalNoPool: 4000000000000000000n,
    resolved: false,
    outcome: false,
    creator: "0x3333333333333333333333333333333333333333",
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 5),
    bettorCount: 67,
  },
  {
    id: 5,
    question: "Will Vitalik release a new EIP this month?",
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 1),
    totalYesPool: 800000000000000000n,
    totalNoPool: 1200000000000000000n,
    resolved: false,
    outcome: false,
    creator: "0x4444444444444444444444444444444444444444",
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 3600 * 6),
    bettorCount: 12,
  },
  {
    id: 6,
    question: "Will total crypto market cap exceed $5T by year end?",
    deadline: BigInt(Math.floor(Date.now() / 1000) - 86400 * 2),
    totalYesPool: 4000000000000000000n,
    totalNoPool: 6000000000000000000n,
    resolved: true,
    outcome: false,
    creator: "0x5555555555555555555555555555555555555555",
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 14),
    bettorCount: 52,
  },
  {
    id: 7,
    question: "Will Initia mainnet launch before April 15?",
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 14),
    totalYesPool: 6000000000000000000n,
    totalNoPool: 2000000000000000000n,
    resolved: false,
    outcome: false,
    creator: "0x6666666666666666666666666666666666666666",
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 3),
    bettorCount: 45,
  },
]

type FilterTab = "all" | "open" | "closed" | "resolved"

const tabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All Markets" },
  { value: "open", label: "Live" },
  { value: "closed", label: "Closed" },
  { value: "resolved", label: "Resolved" },
]

export function MarketsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return MOCK_MARKETS.filter((m) => {
      if (activeTab !== "all" && getMarketStatus(m) !== activeTab) return false
      if (search && !m.question.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [activeTab, search])

  // Aggregate stats
  const totalVolume = MOCK_MARKETS.reduce((acc, m) => acc + m.totalYesPool + m.totalNoPool, 0n)
  const totalBettors = MOCK_MARKETS.reduce((acc, m) => acc + (m.bettorCount ?? 0), 0)
  const openCount = MOCK_MARKETS.filter((m) => getMarketStatus(m) === "open").length

  return (
    <div className="space-y-6">
      {/* Stats banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card flex items-center gap-3 rounded-xl p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-oracle/10">
            <Eye className="size-4 text-oracle" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Markets</p>
            <p className="text-lg font-semibold text-foreground">{MOCK_MARKETS.length}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 rounded-xl p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-yes/10">
            <TrendingUp className="size-4 text-yes" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Live Now</p>
            <p className="text-lg font-semibold text-yes">{openCount}</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 rounded-xl p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gold/10">
            <Coins className="size-4 text-gold" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Volume</p>
            <p className="text-lg font-semibold text-gold">{parseFloat(formatEther(totalVolume)).toFixed(0)} ETH</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 rounded-xl p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-oracle-soft/10">
            <Users className="size-4 text-oracle-soft" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Bettors</p>
            <p className="text-lg font-semibold text-foreground">{totalBettors}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter + Create */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div role="tablist" className="flex gap-1 rounded-xl bg-[rgba(155,109,255,0.04)] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                activeTab === tab.value
                  ? "bg-oracle/15 text-oracle"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-dim" />
            <Input
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-52 border-oracle/10 bg-[rgba(155,109,255,0.04)] pl-8 text-sm placeholder:text-dim focus-visible:ring-oracle/30"
            />
          </div>

          {/* Create CTA */}
          <Link to="/create">
            <Button
              size="sm"
              className="btn-shimmer gap-1.5 bg-gradient-to-r from-oracle to-oracle-deep text-white hover:shadow-[0_0_20px_rgba(155,109,255,0.3)]"
            >
              <Plus className="size-3.5" />
              Create
            </Button>
          </Link>
        </div>
      </div>

      {/* Market grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-oracle/10">
            <Search className="size-5 text-oracle" />
          </div>
          <p className="text-sm text-muted-foreground">No markets found. Try a different filter or search.</p>
        </div>
      )}
    </div>
  )
}
