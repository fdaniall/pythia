export interface Market {
  id: number
  question: string
  deadline: bigint
  totalYesPool: bigint
  totalNoPool: bigint
  resolved: boolean
  outcome: boolean
  creator: string
  createdAt: bigint
}

export interface Bet {
  yesAmount: bigint
  noAmount: bigint
  claimed: boolean
}

export type MarketStatus = "open" | "closed" | "resolved"

export function getMarketStatus(market: Market): MarketStatus {
  if (market.resolved) return "resolved"
  if (BigInt(Date.now()) / 1000n >= market.deadline) return "closed"
  return "open"
}
