import { Link, Outlet, useLocation } from "react-router-dom"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { path: "/", label: "Markets" },
  { path: "/create", label: "Create" },
  { path: "/portfolio", label: "Portfolio" },
]

function truncateAddress(addr: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function Layout() {
  const location = useLocation()
  const { address, username, isConnected, openConnect, openWallet, disconnect } = useInterwovenKit()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-primary">Pythia</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    location.pathname === item.path && "font-semibold"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={openWallet}>
                {username ? `${username}.init` : truncateAddress(address)}
              </Button>
              <Button variant="outline" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={openConnect}>
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
