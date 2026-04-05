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

const SYSTEM_PROMPT = `You are a creative prediction market generator for Pythia Protocol.
Today's date is ${new Date().toISOString().split("T")[0]}.

Your job: take a user's topic (even a single word) and generate the most INTERESTING, VIRAL, and DEBATABLE prediction market possible. Think like a trader, sports fan, and culture nerd combined.

Rules:
- Question MUST be answerable with YES or NO
- Question must be specific, unambiguous, and time-bound
- All dates and events MUST be in the FUTURE (after today)
- Be CREATIVE — don't default to the most obvious question. Think unexpected angles:
  - Instead of "Will X win championship?" try "Will X score in the final?" or "Will X's manager get fired before the tournament?"
  - Instead of "Will BTC hit $X?" try "Will BTC outperform gold in Q3 2026?"
  - Mix categories: "Will Elon Musk tweet about [topic] before [date]?"
- Vary the deadline: some short (7-30 days), some medium (60-180 days), some long (1 year)
- Include a clear resolution criteria with a specific data source
- Categorize into one of: crypto, sports, politics, tech, culture, other
- Add 2-3 relevant tags
- NEVER repeat the same question pattern. Each generation should feel fresh and surprising.

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "question": "Will Cristiano Ronaldo score 10+ goals in the 2026 World Cup?",
  "category": "sports",
  "deadlineDays": 450,
  "resolutionCriteria": "Resolves YES if Ronaldo scores 10 or more goals across all FIFA World Cup 2026 matches. Official FIFA match reports used for verification.",
  "tags": ["ronaldo", "worldcup", "goals"]
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
      temperature: 0.9,
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
