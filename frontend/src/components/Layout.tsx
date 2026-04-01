import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useInterwovenKit } from "@initia/interwovenkit-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TerminalSquare, Plus, BarChart3, Wallet, Menu, X, BookOpen, ArrowUp, Search } from "lucide-react"
import { TerminalStream } from "@/components/TerminalStream"
import { CommandPalette } from "@/components/CommandPalette"

const navItems = [
  { path: "/markets", label: "MARKETS", icon: TerminalSquare },
  { path: "/create", label: "INITIALIZE", icon: Plus },
  { path: "/portfolio", label: "PORTFOLIO", icon: BarChart3 },
  { path: "/docs", label: "DOCS", icon: BookOpen },
]

function truncateAddress(addr: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function Layout() {
  const location = useLocation()
  const { address, username, isConnected, openConnect, openWallet, disconnect } = useInterwovenKit()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="bg-technical-grid relative flex min-h-screen flex-col text-white overflow-hidden">
      <TerminalStream />
      <CommandPalette />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-[#333] bg-black">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex size-8 items-center justify-center border border-[#CCFF00] transition-transform group-hover:rotate-12 group-hover:bg-[#CCFF00] glitch-hover p-1 bg-black">
              <img src="/pythia-logo.svg" alt="Pythia Logo" className="size-full object-contain" />
            </div>
            <span className="font-technical text-2xl font-black uppercase tracking-widest text-white group-hover:text-[#CCFF00] transition-colors glitch-hover hidden sm:inline">
              PYTHIA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2 font-technical text-[13px] font-bold tracking-widest uppercase transition-all border-[1.5px] glitch-hover no-underline",
                    isActive
                      ? "bg-[#CCFF00] text-black border-[#CCFF00]"
                      : "bg-transparent text-[#888] border-transparent hover:border-[#333] hover:text-white"
                  )}
                >
                  <Icon className="size-4" strokeWidth={2.5} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Cmd+K trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="hidden md:flex items-center gap-2 border border-[#333] px-3 py-1.5 text-[#555] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-all"
          >
            <Search className="size-3.5" strokeWidth={2.5} />
            <span className="font-technical text-[10px] font-bold uppercase tracking-widest">Search</span>
            <kbd className="ml-1 border border-[#333] px-1.5 py-0.5 font-mono text-[9px] text-[#555]">⌘K</kbd>
          </button>

          {/* Desktop Wallet + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={openWallet}
                  className="flex items-center gap-2 border-[2px] border-[#333] px-4 py-2 font-technical text-[13px] font-bold uppercase transition-all hover:border-[#CCFF00] hover:text-[#CCFF00]"
                >
                  <Wallet className="size-4" strokeWidth={2.5} />
                  {username ? `${username}.init` : truncateAddress(address)}
                </button>
                <button
                  onClick={disconnect}
                  className="font-technical text-[12px] font-bold uppercase text-[#888] hover:text-[#FF2A2A] underline decoration-transparent hover:decoration-current transition-all"
                >
                  [DISCONNECT]
                </button>
              </div>
            ) : (
              <Button
                className="btn-acid h-10 px-6 font-technical text-[13px] glitch-hover hidden sm:inline-flex"
                onClick={openConnect}
              >
                <Wallet className="size-4 mr-2" strokeWidth={2.5} />
                CONNECT WALLET
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex size-10 items-center justify-center border border-[#333] text-white transition-colors hover:bg-[#111] md:hidden"
              aria-label="Navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="border-t border-[#333] bg-black px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 font-technical text-[14px] font-bold tracking-widest uppercase transition-all border-[1.5px] no-underline",
                      isActive
                        ? "bg-[#CCFF00] text-black border-[#CCFF00]"
                        : "bg-transparent text-[#888] border-transparent hover:border-[#333] hover:text-white"
                    )}
                  >
                    <Icon className="size-5" strokeWidth={2.5} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-4 border-t border-[#333] pt-4">
              {isConnected ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { openWallet(); setMobileOpen(false) }}
                    className="flex items-center gap-2 border-[2px] border-[#333] px-4 py-3 font-technical text-[13px] font-bold uppercase transition-all hover:border-[#CCFF00] hover:text-[#CCFF00]"
                  >
                    <Wallet className="size-4" strokeWidth={2.5} />
                    {username ? `${username}.init` : truncateAddress(address)}
                  </button>
                  <button
                    onClick={() => { disconnect(); setMobileOpen(false) }}
                    className="font-technical text-[12px] font-bold uppercase text-[#888] hover:text-[#FF2A2A] py-2"
                  >
                    [DISCONNECT]
                  </button>
                </div>
              ) : (
                <Button
                  className="btn-acid h-12 w-full font-technical text-[13px]"
                  onClick={() => { openConnect(); setMobileOpen(false) }}
                >
                  <Wallet className="size-4 mr-2" strokeWidth={2.5} />
                  CONNECT WALLET
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-[#333] bg-black mt-auto">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-8">
            <div>
              <Link to="/" className="mb-3 flex items-center gap-3 group">
                <div className="flex size-7 items-center justify-center border border-[#CCFF00] p-1 bg-black transition-transform group-hover:rotate-12">
                  <img src="/pythia-logo.svg" alt="" className="size-full object-contain" />
                </div>
                <span className="font-technical text-xl font-black uppercase tracking-widest text-white group-hover:text-[#CCFF00] transition-colors">
                  PYTHIA
                </span>
              </Link>
              <p className="font-technical text-[12px] leading-[1.6] text-[#555] uppercase max-w-sm">
                Zero-BS prediction markets. Native on Initia.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="font-technical text-[11px] font-bold uppercase tracking-widest text-[#555] hover:text-[#CCFF00] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#333] pt-6 gap-3">
            <p className="font-technical text-[10px] uppercase tracking-widest text-[#444]">
              &copy; 2026 Pythia Protocol v1
            </p>
            <div className="flex items-center gap-4">
              <span className="font-technical text-[10px] uppercase tracking-widest text-[#444]">
                Secured by Initia
              </span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex size-8 items-center justify-center border border-[#333] text-[#555] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-all"
                aria-label="Scroll to top"
              >
                <ArrowUp className="size-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
