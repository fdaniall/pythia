export const PREDICTION_MARKET_ADDRESS = "0x" as `0x${string}` // TODO: set after deployment

export const PREDICTION_MARKET_ABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createMarket",
    inputs: [
      { name: "question", type: "string", internalType: "string" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "marketId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "placeBet",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
      { name: "position", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "resolveMarket",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
      { name: "outcome", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimWinnings",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getMarket",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct PredictionMarket.Market",
        components: [
          { name: "question", type: "string", internalType: "string" },
          { name: "deadline", type: "uint256", internalType: "uint256" },
          { name: "totalYesPool", type: "uint256", internalType: "uint256" },
          { name: "totalNoPool", type: "uint256", internalType: "uint256" },
          { name: "resolved", type: "bool", internalType: "bool" },
          { name: "outcome", type: "bool", internalType: "bool" },
          { name: "creator", type: "address", internalType: "address" },
          { name: "createdAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBet",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
      { name: "bettor", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct PredictionMarket.Bet",
        components: [
          { name: "yesAmount", type: "uint256", internalType: "uint256" },
          { name: "noAmount", type: "uint256", internalType: "uint256" },
          { name: "claimed", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarketBettors",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "", type: "address[]", internalType: "address[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculatePayout",
    inputs: [
      { name: "marketId", type: "uint256", internalType: "uint256" },
      { name: "bettor", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "marketCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "platformFeeBps",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "MarketCreated",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "question", type: "string", indexed: false, internalType: "string" },
      { name: "deadline", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "creator", type: "address", indexed: false, internalType: "address" },
    ],
  },
  {
    type: "event",
    name: "BetPlaced",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "bettor", type: "address", indexed: true, internalType: "address" },
      { name: "position", type: "bool", indexed: false, internalType: "bool" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
  },
  {
    type: "event",
    name: "MarketResolved",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "outcome", type: "bool", indexed: false, internalType: "bool" },
    ],
  },
  {
    type: "event",
    name: "WinningsClaimed",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "bettor", type: "address", indexed: true, internalType: "address" },
      { name: "payout", type: "uint256", indexed: false, internalType: "uint256" },
    ],
  },
] as const
