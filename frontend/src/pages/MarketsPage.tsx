import { useState, useMemo, useEffect } from "react"
import { useDocTitle } from "@/hooks/useDocTitle"
import { MarketCard } from "@/components/MarketCard"
import { FadeIn } from "@/components/FadeIn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, TrendingUp, Users, Coins, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { getMarketStatus } from "@/types/market"
import { useMoveAllMarkets } from "@/hooks/useMoveContract"
import { UINIT_DECIMALS } from "@/lib/move"


type FilterTab = "all" | "open" | "closed" | "resolved"

const tabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All Markets" },
  { value: "open", label: "Live" },
  { value: "closed", label: "Closed" },
  { value: "resolved", label: "Resolved" },
]

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

/** Format uinit amount as human-readable INIT string */
function formatUinitCompact(uinit: bigint): string {
  const init = Number(uinit) / 10 ** UINIT_DECIMALS
  if (init >= 1000) return `${(init / 1000).toFixed(1)}K`
  return init.toFixed(1)
}

export function MarketsPage() {
  useDocTitle("Markets")
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  // Fetch real on-chain markets
  const { data: onChainMarkets, isLoading, error } = useMoveAllMarkets()
  const markets = onChainMarkets ?? []

  const filtered = useMemo(() => {
    return markets.filter((m) => {
      if (activeTab !== "all" && getMarketStatus(m) !== activeTab) return false
      if (debouncedSearch && !m.question.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
      return true
    })
  }, [markets, activeTab, debouncedSearch])

  const totalVolume = useMemo(
    () => markets.reduce((acc, m) => acc + m.totalYesPool + m.totalNoPool, 0n),
    [markets],
  )
  const totalBettors = useMemo(
    () => markets.reduce((acc, m) => acc + (m.bettorCount ?? 0), 0),
    [markets],
  )
  const openCount = useMemo(
    () => markets.filter((m) => getMarketStatus(m) === "open").length,
    [markets],
  )

  return (
    <div className="space-y-8">
      {/* Page header */}
      <FadeIn>
        <div className="space-y-3 mb-4">
          <div className="inline-flex items-center gap-2 border border-[#333] bg-black px-3 py-1">
            <Eye className="size-3 text-[#CCFF00]" />
            <span className="font-technical text-[10px] font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
              Market Index
            </span>
          </div>
          <h1 className="font-sans text-[clamp(40px,6vw,72px)] font-black uppercase leading-[0.9] tracking-tighter text-white">
            GLOBAL <span className="text-[#CCFF00]">LIQUIDITY.</span>
          </h1>
          <p className="font-technical text-[14px] leading-[1.6] text-[#888] uppercase max-w-[500px]">
            Pick a question you have a strong opinion on. Bet YES or NO. Win the pool if you're right.
          </p>
        </div>
      </FadeIn>

      {/* Stats banner */}
      <FadeIn delay={0.05}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="size-4 text-[#888]" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">TOTAL MARKETS</p>
          </div>
          <p className="font-sans text-3xl font-black text-white">
            {isLoading ? "—" : markets.length}
          </p>
        </div>
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">LIVE NOW</p>
          </div>
          <p className="font-sans text-3xl font-black text-[#CCFF00]">
            {isLoading ? "—" : openCount}
          </p>
        </div>
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="size-4 text-white" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">VOLUME</p>
          </div>
          <p className="font-sans text-3xl font-black text-white">
            {isLoading ? "—" : formatUinitCompact(totalVolume)}{" "}
            <span className="text-xl text-[#555]">INIT</span>
          </p>
        </div>
        <div className="brutalist-card bg-black p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-4 text-[#888]" strokeWidth={2.5} />
            <p className="font-technical text-[10px] font-bold tracking-widest uppercase text-[#888]">TOTAL BETTORS</p>
          </div>
          <p className="font-sans text-3xl font-black text-white">
            {isLoading ? "—" : totalBettors}
          </p>
        </div>
      </div>
      </FadeIn>

      {/* Error state */}
      {error && (
        <div className="border border-[#FF2A2A]/30 bg-[#FF2A2A]/5 p-4">
          <p className="font-technical text-[11px] uppercase tracking-widest text-[#FF2A2A]">
            CHAIN CONNECTION ERROR — retrying...
          </p>
        </div>
      )}

      {/* Search + Filter + Create */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-y border-[#333] py-4 bg-black/50">
        <div role="tablist" className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "border-[2px] px-4 py-1.5 font-technical text-[12px] font-bold uppercase tracking-wider transition-all",
                activeTab === tab.value
                  ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                  : "border-[#333] bg-transparent text-[#888] hover:border-[#CCFF00] hover:text-[#CCFF00]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#888]" strokeWidth={2.5} />
            <Input
              placeholder="SEARCH_MARKETS..."
              aria-label="Search markets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full sm:w-64 rounded-none border-[2px] border-[#333] bg-black pl-10 font-technical text-[12px] font-bold uppercase text-white placeholder:text-[#555] focus-visible:border-[#CCFF00] focus-visible:ring-0"
            />
          </div>
          <Link to="/create">
            <Button className="btn-acid h-10 px-5 font-technical text-[12px]">
              <Plus className="mr-2 size-4" strokeWidth={2.5} />
              CREATE MARKET
            </Button>
          </Link>
        </div>
      </div>

      {/* Market grid */}
      <div className="min-h-[400px]">
        {isLoading ? (
          /* Skeleton loader */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="brutalist-card bg-black p-6 animate-pulse"
                style={{ height: "220px" }}
              >
                <div className="h-4 bg-[#1a1a1a] mb-3 w-3/4" />
                <div className="h-3 bg-[#1a1a1a] mb-2 w-1/2" />
                <div className="h-3 bg-[#1a1a1a] w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((market, i) => (
              <FadeIn key={market.id} delay={Math.min(i * 0.05, 0.3)}>
                <MarketCard market={market} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="brutalist-card col-span-full flex flex-col items-center justify-center bg-black py-24 text-center">
            <div className="mb-4 flex size-16 items-center justify-center border-2 border-[#333] bg-black">
              <Search className="size-6 text-[#555]" />
            </div>
            <p className="font-technical text-[14px] font-bold uppercase tracking-widest text-[#888]">
              {markets.length === 0 ? "NO MARKETS CREATED YET." : "NO MARKETS MATCH YOUR SEARCH."}
            </p>
            <p className="mt-2 font-technical text-[12px] uppercase tracking-widest text-[#555]">
              {markets.length === 0
                ? <>Be the first — <Link to="/create" className="text-[#CCFF00] underline">create a market now</Link>.</>
                : <>Try a different filter or <Link to="/create" className="text-[#CCFF00] underline">create a new market</Link>.</>
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
