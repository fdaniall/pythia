import { useState, useEffect } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { ArrowRight, Menu, X } from "lucide-react"
import { Link } from "react-router-dom"

const navLinks = [
  { href: "#how-it-works", label: "Protocol" },
  { href: "#features", label: "Features" },
  { href: "#cta", label: "Initialize" },
]

export function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 50))

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  function scrollTo(href: string) {
    setMobileOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <motion.header
        className="fixed top-0 z-50 w-full transition-colors duration-200"
        style={{
          backgroundColor: scrolled ? "#000000" : "transparent",
          borderBottom: scrolled ? "1px solid #333333" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          {/* Logo */}
          <a href="#hero" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="group flex items-center gap-3">
            <div className="flex size-8 items-center justify-center border border-[#CCFF00] transition-transform group-hover:rotate-12 group-hover:bg-[#CCFF00] p-1 bg-black">
              <img src="/pythia-logo.svg" alt="Pythia Logo" className="size-full object-contain" />
            </div>
            <span className="font-technical text-2xl font-black uppercase tracking-widest text-white group-hover:text-[#CCFF00] transition-colors">
              PYTHIA
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="font-technical text-[13px] font-medium tracking-widest text-[#888] uppercase transition-colors hover:text-[#CCFF00]"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link to="/markets" className="btn-acid inline-flex h-10 items-center px-6 font-technical text-[13px] no-underline">
              Launch dApp
              <ArrowRight className="ml-2 size-4" strokeWidth={3} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex size-10 items-center justify-center border border-[#333] text-white transition-colors hover:bg-[#111] md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-[#000] border-t border-[#333] md:hidden pt-16">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="font-technical text-3xl font-bold uppercase text-white transition-colors hover:text-[#CCFF00]"
            >
              {link.label}
            </button>
          ))}
          <Link
            to="/markets"
            onClick={() => setMobileOpen(false)}
            className="btn-acid mt-8 inline-flex w-full max-w-xs h-14 items-center justify-center font-technical text-lg no-underline"
          >
            Launch dApp
            <ArrowRight className="ml-2 size-5" strokeWidth={3} />
          </Link>
        </div>
      )}
    </>
  )
}
