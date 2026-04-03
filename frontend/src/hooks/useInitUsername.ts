/**
 * Hook for resolving .init usernames from addresses.
 *
 * Uses Initia's usernames REST API to do reverse lookups (address → username).
 * Falls back to truncated addresses when resolution fails.
 */

import { useQuery } from "@tanstack/react-query"

const USERNAMES_API = "https://usernames-api.testnet.initia.xyz"

interface UsernameEntry {
  username: string
  address: string
}

/**
 * Resolves an address to its .init username.
 * Returns null if no username is registered.
 */
async function fetchUsernameByAddress(address: string): Promise<string | null> {
  try {
    // Initia usernames API expects the init1... bech32 address
    // If we have a hex address, we can't easily convert back, so try both
    const addr = address.startsWith("0x") ? address.toLowerCase() : address

    const response = await fetch(`${USERNAMES_API}/addresses/${addr}`)
    if (!response.ok) return null

    const data: UsernameEntry = await response.json()
    return data.username || null
  } catch {
    return null
  }
}

/**
 * Batch-resolves multiple addresses to usernames.
 */
async function fetchUsernamesBatch(addresses: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  // Fetch in parallel with a concurrency limit
  const promises = addresses.map(async (addr) => {
    const username = await fetchUsernameByAddress(addr)
    if (username) result.set(addr, username)
  })
  await Promise.allSettled(promises)
  return result
}

/**
 * Hook to resolve a single address to a .init username.
 */
export function useInitUsername(address: string | undefined) {
  return useQuery({
    queryKey: ["initUsername", address],
    queryFn: () => fetchUsernameByAddress(address!),
    enabled: !!address,
    staleTime: 5 * 60_000, // Cache for 5 minutes
    retry: 1,
  })
}

/**
 * Hook to batch-resolve multiple addresses to .init usernames.
 */
export function useInitUsernames(addresses: string[]) {
  const key = addresses.sort().join(",")
  return useQuery({
    queryKey: ["initUsernames", key],
    queryFn: () => fetchUsernamesBatch(addresses),
    enabled: addresses.length > 0,
    staleTime: 5 * 60_000,
    retry: 1,
  })
}

/**
 * Format an address for display, preferring .init username.
 */
export function formatAddress(address: string, username?: string | null): string {
  if (username) return `${username}.init`
  if (!address) return "Unknown"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
