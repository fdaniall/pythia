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
  bettorCount?: number
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

export type MarketCategory = "crypto" | "sports" | "politics" | "tech" | "culture" | "other"

const CATEGORY_KEYWORDS: Record<MarketCategory, string[]> = {
  crypto: ["btc", "eth", "bitcoin", "ethereum", "solana", "sol", "token", "defi", "nft", "crypto", "chain", "web3", "initia", "init", "price", "market cap", "halving", "airdrop", "memecoin", "doge", "pepe"],
  sports: ["football", "soccer", "nba", "nfl", "world cup", "champion", "league", "match", "game", "tournament", "finals", "win", "team", "player", "olympic", "ufc", "boxing", "f1", "formula"],
  politics: ["election", "president", "vote", "congress", "senate", "democrat", "republican", "trump", "biden", "law", "policy", "government", "regulation", "fed", "sec"],
  tech: ["ai", "apple", "google", "microsoft", "openai", "tesla", "spacex", "launch", "iphone", "android", "gpt", "model", "chip", "nvidia", "semiconductor"],
  culture: ["oscar", "grammy", "movie", "film", "album", "artist", "tiktok", "viral", "meme", "twitter", "elon", "celebrity", "music", "show", "series"],
  other: [],
}

export function categorizeMarket(question: string): MarketCategory {
  const q = question.toLowerCase()
  let bestCategory: MarketCategory = "other"
  let bestScore = 0

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [MarketCategory, string[]][]) {
    const score = keywords.filter((kw) => q.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }
  return bestCategory
}

export const CATEGORY_CONFIG: Record<MarketCategory, { label: string; color: string }> = {
  crypto: { label: "CRYPTO", color: "#CCFF00" },
  sports: { label: "SPORTS", color: "#00BFFF" },
  politics: { label: "POLITICS", color: "#FF6B35" },
  tech: { label: "TECH", color: "#A855F7" },
  culture: { label: "CULTURE", color: "#FF2A8A" },
  other: { label: "OTHER", color: "#888" },
}
