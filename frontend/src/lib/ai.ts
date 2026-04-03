/**
 * AI Market Creation — uses Groq API (llama-3.3-70b-versatile) to generate
 * market parameters from natural language input.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export interface AIMarketSuggestion {
  question: string
  category: string
  deadlineDays: number
  resolutionCriteria: string
  tags: string[]
}

const SYSTEM_PROMPT = `You are a prediction market creation assistant for Pythia Protocol.
Given a user's idea or topic, generate a well-structured binary prediction market.

Rules:
- Question MUST be answerable with YES or NO
- Question must be specific, unambiguous, and time-bound
- Include a clear resolution criteria
- Suggest a reasonable deadline (in days from now)
- Categorize into one of: crypto, sports, politics, tech, culture, other
- Add 2-3 relevant tags

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "question": "Will BTC reach $100,000 by June 30, 2026?",
  "category": "crypto",
  "deadlineDays": 88,
  "resolutionCriteria": "Resolves YES if Bitcoin (BTC) price on CoinGecko reaches or exceeds $100,000 USD at any point before June 30, 2026 23:59 UTC.",
  "tags": ["bitcoin", "price", "milestone"]
}`

export async function generateMarketWithAI(
  userInput: string,
): Promise<AIMarketSuggestion> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error("VITE_GROQ_API_KEY not set in .env")

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `User idea: "${userInput}"` },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    throw new Error("AI generation failed. Please try again.")
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error("No response from AI")

  const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
  return JSON.parse(jsonStr) as AIMarketSuggestion
}

/**
 * Fetch current crypto price from CoinGecko (free, no API key).
 * Used for auto-resolution of crypto price markets.
 */
export async function fetchCryptoPrice(coinId: string): Promise<number> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`)
  const data = await response.json()
  return data[coinId]?.usd ?? 0
}

/**
 * Parse a crypto price market question to extract coin and target price.
 * Returns null if the question doesn't match a crypto price pattern.
 *
 * Matches patterns like:
 * - "Will BTC hit $100K by April 10?"
 * - "Will ETH reach $5,000 by June?"
 * - "Will SOL go above $200?"
 */
export function parseCryptoPriceMarket(question: string): {
  coinId: string
  coinSymbol: string
  targetPrice: number
} | null {
  const coinMap: Record<string, string> = {
    btc: "bitcoin",
    bitcoin: "bitcoin",
    eth: "ethereum",
    ethereum: "ethereum",
    sol: "solana",
    solana: "solana",
    init: "initia",
    initia: "initia",
    doge: "dogecoin",
    dogecoin: "dogecoin",
    avax: "avalanche-2",
    bnb: "binancecoin",
    xrp: "ripple",
    ada: "cardano",
    dot: "polkadot",
    matic: "matic-network",
    atom: "cosmos",
    near: "near",
    apt: "aptos",
    sui: "sui",
    arb: "arbitrum",
    op: "optimism",
  }

  const q = question.toLowerCase()

  // Find coin mention
  let coinId: string | null = null
  let coinSymbol = ""
  for (const [key, id] of Object.entries(coinMap)) {
    if (q.includes(key)) {
      coinId = id
      coinSymbol = key.toUpperCase()
      break
    }
  }
  if (!coinId) return null

  // Find price target — match $100K, $100,000, $5000, etc.
  const priceMatch = q.match(/\$\s*([\d,]+(?:\.\d+)?)\s*([kmb])?/i)
  if (!priceMatch) return null

  let price = parseFloat(priceMatch[1].replace(/,/g, ""))
  const suffix = priceMatch[2]?.toLowerCase()
  if (suffix === "k") price *= 1000
  if (suffix === "m") price *= 1_000_000
  if (suffix === "b") price *= 1_000_000_000

  return { coinId, coinSymbol, targetPrice: price }
}
