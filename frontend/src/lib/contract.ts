/**
 * Contract configuration for Pythia Prediction Market
 *
 * The contract is a Move module deployed on Initia L1 (initiation-2 testnet).
 * It is NOT an EVM contract — there is no ABI or EVM address.
 *
 * For Move contract integration, see:
 *   - src/lib/move.ts          — message builders + view function callers
 *   - src/hooks/useMoveContract.ts — React hooks wrapping InterwovenKit
 *
 * This file is kept for backward compatibility during migration and defines
 * the chain configuration used by wagmi (for wallet connection context).
 */

import { defineChain } from "viem"

// ── Move Contract Address ───────────────────────────────────────────────────
// This is the deployer address (@pythia named address in Move)
// The module is: 0xF83249D6AB09160493214DE15D7EC623CCB5063E::prediction_market
export { MODULE_ADDRESS as PREDICTION_MARKET_ADDRESS } from "@/lib/move"

// ── Chain: Initia L1 Testnet (initiation-2) ─────────────────────────────────
// InterwovenKit handles chain switching + wallet connection internally.
// Wagmi is used by InterwovenKit under the hood for EVM-compatible wallet support.
// The chain definition below is used only for wagmi config bootstrapping.
export const initiaAppchain = defineChain({
  id: 7658622, // initiation-2 EVM-equivalent chain ID (0x74C9AE)
  name: "Initia Testnet",
  nativeCurrency: { name: "INIT", symbol: "INIT", decimals: 6 },
  rpcUrls: {
    default: {
      http: ["https://json-rpc.testnet.initia.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Initia Scan",
      url: "https://scan.testnet.initia.xyz",
    },
  },
  testnet: true,
})

// ── Legacy ABI (no longer used) ─────────────────────────────────────────────
// The contract has been migrated from Solidity/MiniEVM to Move on Initia L1.
// This ABI is kept as a reference snapshot only — do not use for new code.
// All contract calls must go through useMoveContract.ts hooks.
export const PREDICTION_MARKET_ABI = [] as const
