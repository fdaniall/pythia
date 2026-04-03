/**
 * Legacy EVM contract hooks — DEPRECATED
 *
 * The Pythia prediction market has been migrated from Solidity/MiniEVM
 * to a Move module on Initia L1 (initiation-2).
 *
 * All new code should use the hooks from `useMoveContract.ts` instead.
 * This file re-exports the Move equivalents for backward compatibility.
 */

export {
  useMoveMarketCount as useMarketCount,
  useMoveMarket as useMarket,
  useMoveAllMarkets as useAllMarkets,
  useMoveUserBet as useUserBet,
  useMoveCalculatePayout as useCalculatePayout,
  useMoveCreateMarket as useCreateMarket,
  useMovePlaceBet as usePlaceBet,
  useMoveClaimWinnings as useClaimWinnings,
  useMoveResolveMarket as useResolveMarket,
} from "@/hooks/useMoveContract"
