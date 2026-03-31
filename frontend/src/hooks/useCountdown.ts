import { useState, useEffect } from "react"

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
  label: string
}

export function useCountdown(deadline: bigint): Countdown {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const target = Number(deadline) * 1000
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, label: "Expired" }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (days === 0) parts.push(`${seconds}s`)

  return { days, hours, minutes, seconds, expired: false, label: parts.join(" ") }
}
