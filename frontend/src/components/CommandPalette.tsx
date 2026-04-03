import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ArrowRight, TerminalSquare, FileText, PlusCircle, BarChart3, Command } from "lucide-react"
import { useMoveAllMarkets } from "@/hooks/useMoveContract"
import { cn } from "@/lib/utils"

const STATIC_ROUTES = [
  { label: "Markets", path: "/markets", icon: TerminalSquare },
  { label: "Create Market", path: "/create", icon: PlusCircle },
  { label: "Portfolio", path: "/portfolio", icon: BarChart3 },
  { label: "Documentation", path: "/docs", icon: FileText },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { data: onChainMarkets } = useMoveAllMarkets()

  // Cmd+K / Ctrl+K to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("")
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const markets = onChainMarkets ?? []
  const filteredMarkets = query.length > 0
    ? markets.filter((m) =>
        m.question.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : []

  const filteredRoutes = STATIC_ROUTES.filter((r) =>
    r.label.toLowerCase().includes(query.toLowerCase())
  )

  const allResults = [
    ...filteredRoutes.map((r) => ({ type: "route" as const, ...r })),
    ...filteredMarkets.map((m) => ({
      type: "market" as const,
      label: m.question,
      path: `/markets/${m.id}`,
      icon: ArrowRight,
    })),
  ]

  const goTo = useCallback(
    (path: string) => {
      navigate(path)
      setOpen(false)
    },
    [navigate]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, allResults.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && allResults[activeIndex]) {
      goTo(allResults[activeIndex].path)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div role="dialog" aria-modal="true" aria-label="Search markets and pages" className="fixed left-1/2 top-[20%] z-[201] w-full max-w-lg -translate-x-1/2 border-2 border-[#CCFF00] bg-black shadow-[8px_8px_0px_0px_#CCFF00] mx-4 sm:mx-0" style={{ maxWidth: "calc(100vw - 2rem)" }}>
        {/* Input */}
        <div className="flex items-center gap-3 border-b-2 border-[#333] px-4 py-3">
          <Search className="size-5 shrink-0 text-[#CCFF00]" strokeWidth={2.5} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search markets, pages..."
            className="flex-1 bg-transparent font-technical text-[14px] font-bold uppercase tracking-widest text-white placeholder:text-[#555] outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 border border-[#333] px-2 py-0.5 font-mono text-[10px] text-[#555]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto">
          {query.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-technical text-[12px] text-[#555] uppercase tracking-widest">
                Type to search markets and pages
              </p>
            </div>
          ) : allResults.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-technical text-[12px] text-[#555] uppercase tracking-widest">
                No results for "{query}"
              </p>
            </div>
          ) : (
            <div className="py-2">
              {allResults.map((result, i) => {
                const Icon = result.icon
                return (
                  <button
                    key={result.path}
                    type="button"
                    onClick={() => goTo(result.path)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      i === activeIndex
                        ? "bg-[#CCFF00] text-black"
                        : "text-[#888] hover:bg-[#111]"
                    )}
                  >
                    <Icon
                      className={cn("size-4 shrink-0", i === activeIndex ? "text-black" : "text-[#555]")}
                      strokeWidth={2.5}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-technical text-[12px] font-bold uppercase tracking-widest truncate",
                          i === activeIndex ? "text-black" : "text-white"
                        )}
                      >
                        {result.label}
                      </p>
                      {result.type === "market" && (
                        <p className={cn("font-technical text-[10px] uppercase", i === activeIndex ? "text-black/60" : "text-[#555]")}>
                          Market
                        </p>
                      )}
                    </div>
                    <ArrowRight
                      className={cn("size-3 shrink-0", i === activeIndex ? "text-black" : "text-[#333]")}
                      strokeWidth={3}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-[#333] px-4 py-2">
          <div className="flex items-center gap-3 font-technical text-[10px] text-[#444] uppercase tracking-widest">
            <span className="flex items-center gap-1"><kbd className="border border-[#333] px-1">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="border border-[#333] px-1">↵</kbd> Open</span>
          </div>
          <div className="flex items-center gap-1 font-technical text-[10px] text-[#444] uppercase">
            <Command className="size-3" />
            <span>+K</span>
          </div>
        </div>
      </div>
    </>
  )
}
