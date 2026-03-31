import { MarketCard } from "@/components/MarketCard"
import { Eye } from "lucide-react"
import type { Market } from "@/types/market"

// Mock data for development — will be replaced with on-chain reads
const MOCK_MARKETS: Market[] = [
  {
    id: 0,
    question: "Will BTC hit $100K by April 10?",
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 3),
    totalYesPool: 5000000000000000000n, // 5 ETH
    totalNoPool: 3000000000000000000n,  // 3 ETH
    resolved: false,
    outcome: false,
    creator: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400),
  },
  {
    id: 1,
    question: "Will ETH flip BTC market cap in 2026?",
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
    totalYesPool: 1000000000000000000n, // 1 ETH
    totalNoPool: 8000000000000000000n,  // 8 ETH
    resolved: false,
    outcome: false,
    creator: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 7200),
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
  },
]

export function MarketsPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Eye className="size-5 text-oracle" />
          <h1 className="font-oracle text-oracle-gradient text-3xl italic">
            Markets
          </h1>
        </div>
        <p className="text-[#7B6F94]">
          Predict outcomes, bet with conviction. The oracle sees all.
        </p>
      </div>

      {/* Market grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {MOCK_MARKETS.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  )
}
