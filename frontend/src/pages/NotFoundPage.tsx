import { useNavigate } from "react-router-dom"
import { useDocTitle } from "@/hooks/useDocTitle"
import { useEffect, useState, useRef, useCallback } from "react"

const ASCII_SKULL = `
    ██████╗ ██╗  ██╗ ██████╗ ██╗  ██╗
    ██╔══██╗██║  ██║██╔═████╗██║  ██║
    ██████╔╝███████║██║██╔██║███████║
    ╚════██╗╚════██║████╔╝██║╚════██║
    ██████╔╝     ██║╚██████╔╝     ██║
    ╚═════╝      ╚═╝ ╚═════╝      ╚═╝
`.trimStart()

const CRASH_LOG = [
  { text: "PYTHIA KERNEL v1.0.0", color: "#555" },
  { text: "LOADING ROUTE MODULE...", color: "#CCFF00" },
  { text: `GET ${typeof window !== "undefined" ? window.location.pathname : "/"}`, color: "#888" },
  { text: "ERR: SEGMENT FAULT IN ROUTE_RESOLVER", color: "#FF2A2A" },
  { text: "ERR: NO HANDLER REGISTERED FOR PATH", color: "#FF2A2A" },
  { text: "ERR: STACK TRACE CORRUPTED", color: "#FF2A2A" },
  { text: "DUMPING CORE... [████████████████] 100%", color: "#555" },
  { text: "ATTEMPTING RECOVERY...", color: "#CCFF00" },
  { text: "RECOVERY FAILED. MANUAL INTERVENTION REQUIRED.", color: "#FF2A2A" },
  { text: "", color: "#555" },
  { text: "TYPE A COMMAND OR PRESS [ENTER] TO RETURN TO SAFETY.", color: "#CCFF00" },
]

const GLITCH_CHARS = "▓▒░█▄▀■□▪▫◊◈◇◆●○"

function useTypewriter(lines: typeof CRASH_LOG, speed = 30) {
  const [visibleLines, setVisibleLines] = useState<typeof CRASH_LOG>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (currentLine >= lines.length) {
      setDone(true)
      return
    }

    const line = lines[currentLine]

    if (line.text === "") {
      // Empty line — just push and move on
      setVisibleLines((prev) => [...prev, line])
      setCurrentLine((l) => l + 1)
      setCurrentChar(0)
      return
    }

    if (currentChar === 0) {
      setVisibleLines((prev) => [...prev, { text: "", color: line.color }])
    }

    if (currentChar < line.text.length) {
      const id = setTimeout(() => {
        setVisibleLines((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            text: line.text.slice(0, currentChar + 1),
            color: line.color,
          }
          return copy
        })
        setCurrentChar((c) => c + 1)
      }, speed)
      return () => clearTimeout(id)
    } else {
      // Line done — small pause then next
      const id = setTimeout(() => {
        setCurrentLine((l) => l + 1)
        setCurrentChar(0)
      }, 200)
      return () => clearTimeout(id)
    }
  }, [currentLine, currentChar, lines, speed])

  return { visibleLines, done }
}

function GlitchBar() {
  const [chars, setChars] = useState("")

  useEffect(() => {
    const id = setInterval(() => {
      const len = 30 + Math.floor(Math.random() * 50)
      setChars(
        Array.from({ length: len }, () =>
          GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        ).join("")
      )
    }, 100)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="overflow-hidden whitespace-nowrap font-mono text-[10px] text-[#CCFF00]/10 select-none pointer-events-none">
      {chars}
    </div>
  )
}

export function NotFoundPage() {
  useDocTitle("404")
  const navigate = useNavigate()
  const { visibleLines, done } = useTypewriter(CRASH_LOG, 20)
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Auto-scroll terminal
  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight })
  }, [visibleLines])

  // Focus input when typewriter finishes
  useEffect(() => {
    if (done) inputRef.current?.focus()
  }, [done])

  const handleCommand = useCallback(() => {
    const cmd = input.trim().toLowerCase()
    if (cmd === "" || cmd === "markets" || cmd === "home" || cmd === "back") {
      navigate("/markets")
    } else if (cmd === "docs" || cmd === "help") {
      navigate("/docs")
    } else if (cmd === "create") {
      navigate("/create")
    } else if (cmd === "portfolio") {
      navigate("/portfolio")
    } else {
      navigate("/markets")
    }
  }, [input, navigate])

  return (
    <div
      className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.03]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)",
        }}
      />

      {/* Glitch bars */}
      <div className="absolute top-4 left-0 right-0 space-y-1 opacity-40">
        <GlitchBar />
        <GlitchBar />
      </div>

      {/* ASCII art */}
      <pre className="mb-6 font-mono text-[clamp(8px,1.8vw,14px)] leading-tight text-[#FF2A2A] select-none text-center whitespace-pre">
        {ASCII_SKULL}
      </pre>

      {/* Error badge */}
      <div className="mb-8 border-2 border-[#FF2A2A] px-6 py-2 animate-pulse">
        <span className="font-technical text-[clamp(12px,2vw,16px)] font-black uppercase tracking-[0.3em] text-[#FF2A2A]">
          FATAL EXCEPTION: ROUTE_NOT_FOUND
        </span>
      </div>

      {/* Terminal */}
      <div className="w-full max-w-2xl border-2 border-[#333] bg-[#050505]">
        {/* Terminal title bar */}
        <div className="flex items-center justify-between border-b border-[#333] px-4 py-2 bg-[#0a0a0a]">
          <div className="flex items-center gap-2">
            <div className="size-2.5 bg-[#FF2A2A]" />
            <div className="size-2.5 bg-[#555]" />
            <div className="size-2.5 bg-[#555]" />
          </div>
          <span className="font-mono text-[10px] text-[#555] uppercase">pythia://crash-dump</span>
          <div className="w-12" />
        </div>

        {/* Terminal body */}
        <div
          ref={terminalRef}
          className="h-[280px] overflow-y-auto p-4 font-mono text-[12px] leading-[1.8] scrollbar-none"
        >
          {visibleLines.map((line, i) => (
            <div key={i}>
              <span className="text-[#333] mr-2 select-none">{line.text ? ">" : ""}</span>
              <span style={{ color: line.color }}>{line.text}</span>
            </div>
          ))}

          {/* Input line */}
          {done && (
            <div className="flex items-center mt-1">
              <span className="text-[#CCFF00] mr-2 select-none">$</span>
              <span className="text-[#CCFF00]">{input}</span>
              <span className="animate-pulse text-[#CCFF00] ml-0.5">█</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCommand()
                }}
                className="sr-only"
                aria-label="Terminal command input"
                autoComplete="off"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hint below terminal */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 font-technical text-[10px] uppercase tracking-widest text-[#333]">
        <span>
          <kbd className="border border-[#333] px-1.5 py-0.5 text-[#555]">ENTER</kbd> Return to markets
        </span>
        <span className="text-[#222]">&middot;</span>
        <span>
          Type <span className="text-[#555]">docs</span>, <span className="text-[#555]">create</span>, or <span className="text-[#555]">portfolio</span>
        </span>
      </div>

      {/* Decorative bottom glitch */}
      <div className="absolute bottom-4 left-0 right-0 space-y-1 opacity-40">
        <GlitchBar />
      </div>
    </div>
  )
}
