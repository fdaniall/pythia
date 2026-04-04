/**
 * Move contract integration for Pythia Prediction Market
 *
 * Chain: initiation-2 (Initia L1 testnet)
 * Contract: 0xF83249D6AB09160493214DE15D7EC623CCB5063E::prediction_market
 *
 * Architecture:
 * - Writes: InterwovenKit's `requestTxBlock` with MsgExecuteJSON
 *   Type URL: /initia.move.v1.MsgExecuteJSON
 *   Args: JSON-stringified Move values (numbers as strings, bools as booleans, addresses as strings)
 *
 * - Reads: REST API POST to `initia/move/v1/view/json`
 *   Response: { data: "<json-stringified return value>", events: [], gas_used: "..." }
 *   Or use createMoveClient from @initia/utils for a cleaner wrapper
 *
 * - Testnet REST base URL: fetched from chain registry at runtime via InterwovenKit
 *   Fallback hardcoded: https://rest.testnet.initia.xyz
 */

// ── Constants ──────────────────────────────────────────────────────────────

/**
 * Module deployer address (also used as @pythia named address in Move).
 * - L1 testnet: 0xF83249D6AB09160493214DE15D7EC623CCB5063E
 * - Pythia rollup: 0x277c5eadcd5fe81988c46b762f3d024458b9fd7c
 */
export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS || "0xF83249D6AB09160493214DE15D7EC623CCB5063E"

export const MODULE_NAME = "prediction_market"

/** Full type URL for the CosmosSDK message used to call Move entry functions */
export const MSG_EXECUTE_JSON_TYPE_URL = "/initia.move.v1.MsgExecuteJSON"

/**
 * REST API base URL for view function calls.
 * - L1 testnet: https://rest.testnet.initia.xyz
 * - Pythia rollup (local): http://localhost:1317
 */
export const INITIA_REST_URL = import.meta.env.VITE_REST_URL || "https://rest.testnet.initia.xyz"

/** Native fee/bet token denom and decimals (uinit on L1, umin on rollup) */
export const UINIT_DENOM = import.meta.env.VITE_TOKEN_DENOM || "uinit"
export const UINIT_DECIMALS = 6

// ── Formatting helpers ─────────────────────────────────────────────────────

/** Format uinit (micro-INIT) as human-readable INIT string */
export function formatUinit(uinit: bigint, decimals = 2): string {
  return (Number(uinit) / 10 ** UINIT_DECIMALS).toFixed(decimals)
}

/** Format uinit as compact string (e.g. 1.2K) */
export function formatUinitCompact(uinit: bigint): string {
  const init = Number(uinit) / 10 ** UINIT_DECIMALS
  if (init >= 1000) return `${(init / 1000).toFixed(1)}K`
  return init.toFixed(1)
}

// ── Type definitions ────────────────────────────────────────────────────────

/** On-chain market data as returned by get_market view function */
export interface OnChainMarket {
  question: string
  deadline: string       // u64 returned as decimal string
  totalYesPool: string   // u64 returned as decimal string
  totalNoPool: string    // u64 returned as decimal string
  resolved: boolean
  winningOutcome: number // u8: 0 = YES, 1 = NO
  creator: string        // 0x-prefixed address
  createdAt: string      // u64 returned as decimal string
  bettorCount: string    // u64 returned as decimal string
}

/** On-chain bet data as returned by get_bet view function */
export interface OnChainBet {
  yesAmount: string   // u64 decimal string
  noAmount: string    // u64 decimal string
  claimed: boolean
}

// ── MsgExecuteJSON argument encoding ───────────────────────────────────────
//
// MsgExecuteJSON.args is string[] where each element is:
//   - Numbers (u8, u64, u128, etc.): JSON.stringify of a decimal string or number
//     e.g. u64(42) -> '"42"'  (note: quoted string, not raw number, for u64/u128)
//          u8(0)   -> '"0"'   or '0'  (both work; string is safer)
//   - Boolean: JSON.stringify(true) = "true"
//   - String (std::string::String): JSON.stringify("hello") = '"hello"'
//   - Address: JSON.stringify("0x...") = '"0x..."'
//
// The recommended pattern from Initia is:
//   args: [JSON.stringify(value)]
//
// IMPORTANT: u64 must be passed as a string (not number) because JS numbers
// lose precision above 2^53. Always use string or BigInt.toString().

/**
 * Encodes a u64 value as a MsgExecuteJSON arg string.
 * u64 values must be quoted strings to avoid JS precision loss.
 */
export function encodeU64(value: bigint | number | string): string {
  return JSON.stringify(value.toString())
}

/**
 * Encodes a u8 value as a MsgExecuteJSON arg string.
 */
export function encodeU8(value: number): string {
  return JSON.stringify(value)
}

/**
 * Encodes a boolean as a MsgExecuteJSON arg string.
 */
export function encodeBool(value: boolean): string {
  return JSON.stringify(value)
}

/**
 * Encodes a std::string::String as a MsgExecuteJSON arg string.
 */
export function encodeString(value: string): string {
  return JSON.stringify(value)
}

/**
 * Converts a bech32 address (init1...) to hex (0x...) format.
 * Move view functions require hex addresses, not bech32.
 */
export function bech32ToHex(bech32Addr: string): string {
  if (bech32Addr.startsWith("0x")) return bech32Addr
  // bech32 decode: strip prefix "init", decode data bytes
  const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
  const sepIdx = bech32Addr.lastIndexOf("1")
  const data = bech32Addr.slice(sepIdx + 1, -6) // strip prefix + checksum (6 chars)
  // Convert 5-bit groups to 8-bit bytes
  const values = Array.from(data).map((c) => CHARSET.indexOf(c))
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const v of values) {
    value = (value << 5) | v
    bits += 5
    if (bits >= 8) {
      bits -= 8
      bytes.push((value >> bits) & 0xff)
    }
  }
  return "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Encodes a Move address as a MsgExecuteJSON arg string.
 * Converts bech32 (init1...) to hex (0x...) format for Move compatibility.
 */
export function encodeAddress(value: string): string {
  return JSON.stringify(bech32ToHex(value))
}

// ── Message constructors ────────────────────────────────────────────────────

/**
 * Builds the EncodeObject for create_market entry function.
 *
 * Move signature:
 *   public entry fun create_market(creator: &signer, question: String, deadline: u64)
 *
 * @param sender  - The caller's Cosmos address (bech32 or hex)
 * @param question - Market question string
 * @param deadlineUnixSec - UNIX timestamp in seconds for market deadline
 */
export function buildCreateMarketMsg(
  sender: string,
  question: string,
  deadlineUnixSec: bigint | number,
) {
  return {
    typeUrl: MSG_EXECUTE_JSON_TYPE_URL,
    value: {
      sender,
      moduleAddress: MODULE_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: "create_market",
      typeArgs: [],
      args: [
        encodeString(question),
        encodeU64(BigInt(deadlineUnixSec)),
      ],
    },
  }
}

/**
 * Builds the EncodeObject for place_bet entry function.
 *
 * Move signature:
 *   public entry fun place_bet(bettor: &signer, market_id: u64, outcome: u8, amount: u64)
 *
 * outcome: 0 = YES, 1 = NO
 * amount: in uinit (micro-INIT), 6 decimals. 1 INIT = 1_000_000 uinit.
 *
 * @param sender    - The caller's Cosmos address
 * @param marketId  - The market ID (0-indexed)
 * @param outcome   - 0 for YES, 1 for NO
 * @param amountUinit - Amount in uinit (6 decimals)
 */
export function buildPlaceBetMsg(
  sender: string,
  marketId: bigint | number,
  outcome: 0 | 1,
  amountUinit: bigint,
) {
  return {
    typeUrl: MSG_EXECUTE_JSON_TYPE_URL,
    value: {
      sender,
      moduleAddress: MODULE_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: "place_bet",
      typeArgs: [],
      args: [
        encodeU64(BigInt(marketId)),
        encodeU8(outcome),
        encodeU64(amountUinit),
      ],
    },
  }
}

/**
 * Builds the EncodeObject for claim_winnings entry function.
 *
 * Move signature:
 *   public entry fun claim_winnings(bettor: &signer, market_id: u64)
 *
 * @param sender    - The caller's Cosmos address
 * @param marketId  - The market ID
 */
export function buildClaimWinningsMsg(
  sender: string,
  marketId: bigint | number,
) {
  return {
    typeUrl: MSG_EXECUTE_JSON_TYPE_URL,
    value: {
      sender,
      moduleAddress: MODULE_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: "claim_winnings",
      typeArgs: [],
      args: [
        encodeU64(BigInt(marketId)),
      ],
    },
  }
}

/**
 * Builds the EncodeObject for resolve_market entry function (admin only).
 *
 * Move signature:
 *   public entry fun resolve_market(admin: &signer, market_id: u64, winning_outcome: u8)
 *
 * winning_outcome: 0 = YES wins, 1 = NO wins
 *
 * @param sender         - The admin's Cosmos address
 * @param marketId       - The market ID
 * @param winningOutcome - 0 for YES, 1 for NO
 */
export function buildResolveMarketMsg(
  sender: string,
  marketId: bigint | number,
  winningOutcome: 0 | 1,
) {
  return {
    typeUrl: MSG_EXECUTE_JSON_TYPE_URL,
    value: {
      sender,
      moduleAddress: MODULE_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: "resolve_market",
      typeArgs: [],
      args: [
        encodeU64(BigInt(marketId)),
        encodeU8(winningOutcome),
      ],
    },
  }
}

/**
 * Builds the EncodeObject for cancel_market entry function (admin only).
 */
export function buildCancelMarketMsg(
  sender: string,
  marketId: bigint | number,
) {
  return {
    typeUrl: MSG_EXECUTE_JSON_TYPE_URL,
    value: {
      sender,
      moduleAddress: MODULE_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: "cancel_market",
      typeArgs: [],
      args: [encodeU64(BigInt(marketId))],
    },
  }
}

/**
 * Builds the EncodeObject for propose_admin entry function (admin only).
 */
export function buildProposeAdminMsg(
  sender: string,
  newAdmin: string,
) {
  return {
    typeUrl: MSG_EXECUTE_JSON_TYPE_URL,
    value: {
      sender,
      moduleAddress: MODULE_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: "propose_admin",
      typeArgs: [],
      args: [encodeAddress(newAdmin)],
    },
  }
}

/**
 * Builds the EncodeObject for accept_admin entry function.
 */
export function buildAcceptAdminMsg(sender: string) {
  return {
    typeUrl: MSG_EXECUTE_JSON_TYPE_URL,
    value: {
      sender,
      moduleAddress: MODULE_ADDRESS,
      moduleName: MODULE_NAME,
      functionName: "accept_admin",
      typeArgs: [],
      args: [],
    },
  }
}

// ── View function REST API calls ────────────────────────────────────────────
//
// REST endpoint: POST {restUrl}/initia/move/v1/view/json
// Body: { address, module_name, function_name, type_args, args }
// Response: { data: "<json string>", events: [...], gas_used: "..." }
//
// The `data` field contains a JSON-stringified representation of the Move return value.
// For multi-return functions, it's a JSON array.
// For single values, it's the direct JSON value.

export interface ViewJsonBody {
  address: string
  module_name: string
  function_name: string
  type_args: string[]
  args: string[]
}

export interface ViewJsonResponse {
  data: string
  events: unknown[]
  gas_used: string
}

/**
 * Calls a Move #[view] function via the Initia REST API.
 * Uses the JSON variant (recommended over the BCS variant).
 *
 * @param restUrl     - Base REST URL (e.g. "https://rest.testnet.initia.xyz")
 * @param body        - The view function parameters
 * @returns Parsed return value (type parameter T)
 */
export async function callViewFunction<T = unknown>(
  restUrl: string,
  body: ViewJsonBody,
): Promise<T> {
  const url = `${restUrl.replace(/\/$/, "")}/initia/move/v1/view/json`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`View function call failed [${response.status}]: ${text}`)
  }

  const json: ViewJsonResponse = await response.json()
  return JSON.parse(json.data) as T
}

// ── Typed view helpers ──────────────────────────────────────────────────────

/**
 * Fetches the total number of markets created on-chain.
 *
 * Calls: get_market_count(): u64
 * Returns: decimal string representing the count
 */
export async function fetchMarketCount(restUrl: string): Promise<string> {
  return callViewFunction<string>(restUrl, {
    address: MODULE_ADDRESS,
    module_name: MODULE_NAME,
    function_name: "get_market_count",
    type_args: [],
    args: [],
  })
}

/**
 * Fetches data for a single market by ID.
 *
 * Calls: get_market(market_id: u64): (String, u64, u64, u64, bool, u8, address, u64, u64)
 *
 * Move returns a tuple; the REST API returns it as a JSON array:
 *   [question, deadline, totalYesPool, totalNoPool, resolved, winningOutcome, creator, createdAt, bettorCount]
 */
export async function fetchMarket(
  restUrl: string,
  marketId: bigint | number,
): Promise<OnChainMarket> {
  const raw = await callViewFunction<[string, string, string, string, boolean, number, string, string, string]>(
    restUrl,
    {
      address: MODULE_ADDRESS,
      module_name: MODULE_NAME,
      function_name: "get_market",
      type_args: [],
      args: [encodeU64(BigInt(marketId))],
    },
  )

  // Move tuple → structured object
  return {
    question: raw[0],
    deadline: raw[1],
    totalYesPool: raw[2],
    totalNoPool: raw[3],
    resolved: raw[4],
    winningOutcome: raw[5],
    creator: raw[6],
    createdAt: raw[7],
    bettorCount: raw[8],
  }
}

/**
 * Fetches a user's bet on a specific market.
 *
 * Calls: get_bet(market_id: u64, bettor: address): (u64, u64, bool)
 * Returns: [yesAmount, noAmount, claimed]
 */
export async function fetchBet(
  restUrl: string,
  marketId: bigint | number,
  bettorAddress: string,
): Promise<OnChainBet> {
  const raw = await callViewFunction<[string, string, boolean]>(restUrl, {
    address: MODULE_ADDRESS,
    module_name: MODULE_NAME,
    function_name: "get_bet",
    type_args: [],
    args: [
      encodeU64(BigInt(marketId)),
      encodeAddress(bettorAddress),
    ],
  })

  return {
    yesAmount: raw[0],
    noAmount: raw[1],
    claimed: raw[2],
  }
}

/**
 * Calculates the payout for a bettor on a resolved market.
 *
 * Calls: calculate_payout(market_id: u64, bettor: address): u64
 * Returns: decimal string of payout amount in uinit
 */
export async function fetchCalculatePayout(
  restUrl: string,
  marketId: bigint | number,
  bettorAddress: string,
): Promise<string> {
  return callViewFunction<string>(restUrl, {
    address: MODULE_ADDRESS,
    module_name: MODULE_NAME,
    function_name: "calculate_payout",
    type_args: [],
    args: [
      encodeU64(BigInt(marketId)),
      encodeAddress(bettorAddress),
    ],
  })
}

/**
 * Fetches the platform fee in basis points.
 *
 * Calls: get_platform_fee_bps(): u64
 * Returns: decimal string (e.g. "200" = 2%)
 */
export async function fetchPlatformFeeBps(restUrl: string): Promise<string> {
  return callViewFunction<string>(restUrl, {
    address: MODULE_ADDRESS,
    module_name: MODULE_NAME,
    function_name: "get_platform_fee_bps",
    type_args: [],
    args: [],
  })
}

/**
 * Fetches the list of bettor addresses for a given market.
 *
 * Calls: get_bettors(market_id: u64): vector<address>
 * Returns: array of hex addresses
 */
export async function fetchBettors(
  restUrl: string,
  marketId: bigint | number,
): Promise<string[]> {
  return callViewFunction<string[]>(restUrl, {
    address: MODULE_ADDRESS,
    module_name: MODULE_NAME,
    function_name: "get_bettors",
    type_args: [],
    args: [encodeU64(BigInt(marketId))],
  })
}

/**
 * Fetches the contract admin address.
 *
 * Calls: get_admin(): address
 */
export async function fetchAdmin(restUrl: string): Promise<string> {
  return callViewFunction<string>(restUrl, {
    address: MODULE_ADDRESS,
    module_name: MODULE_NAME,
    function_name: "get_admin",
    type_args: [],
    args: [],
  })
}

// ── Balance fetcher ───────────────────────────────────────────────────────

/**
 * Fetches the uinit balance of an address on Initia L1.
 * Uses the Cosmos bank module REST endpoint.
 */
export async function fetchBalance(restUrl: string, address: string): Promise<bigint> {
  const url = `${restUrl.replace(/\/$/, "")}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${UINIT_DENOM}`
  const response = await fetch(url)
  if (!response.ok) return 0n
  const json = await response.json()
  return BigInt(json.balance?.amount ?? "0")
}

// ── Gas configuration ──────────────────────────────────────────────────────
//
// InterwovenKit's requestTxBlock accepts a TxRequest with optional gas fields.
// If gas is not specified, it will estimate automatically.
// For Move calls, provide a reasonable default to avoid estimation failures.

export const DEFAULT_GAS = 300_000
export const DEFAULT_GAS_ADJUSTMENT = 1.4
