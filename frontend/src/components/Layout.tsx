import { Link, Outlet, useLocation } from "react-router-dom"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Eye, Plus, BarChart3, Wallet } from "lucide-react"

const navItems = [
  { path: "/markets", label: "Markets", icon: Eye },
  { path: "/create", label: "Create", icon: Plus },
  { path: "/portfolio", label: "Portfolio", icon: BarChart3 },
]

function truncateAddress(addr: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function StarField() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${2 + Math.random() * 4}s`,
    size: Math.random() > 0.7 ? 3 : 2,
  }))

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            ["--delay" as string]: star.delay,
            ["--duration" as string]: star.duration,
          }}
        />
      ))}
    </div>
  )
}

export function Layout() {
  const location = useLocation()
  const { address, username, isConnected, openConnect, openWallet, disconnect } = useInterwovenKit()

  return (
    <div className="bg-oracle-glow relative min-h-screen">
      {/* Noise texture */}
      <div className="noise-overlay" />

      {/* Star particles */}
      <StarField />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[rgba(155,109,255,0.08)] bg-[rgba(7,5,15,0.8)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-oracle/10">
              <Eye className="size-4 text-oracle" />
            </div>
            <span className="font-oracle text-oracle-gradient text-xl italic">
              Pythia
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-1.5 text-[#7B6F94] transition-all",
                      isActive && "bg-oracle/10 text-oracle font-semibold"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Wallet */}
          {isConnected ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={openWallet}
                className="gap-1.5 text-oracle-soft"
              >
                <Wallet className="size-3.5" />
                {username ? `${username}.init` : truncateAddress(address)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="border-oracle/20 text-[#7B6F94] hover:border-oracle/40 hover:text-foreground"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="btn-shimmer bg-gradient-to-r from-oracle to-oracle-deep text-white hover:shadow-[0_0_20px_rgba(155,109,255,0.3)]"
              onClick={openConnect}
            >
              <Wallet className="size-3.5" />
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
