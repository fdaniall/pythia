import { useDocTitle } from "@/hooks/useDocTitle"
import { FadeIn } from "@/components/FadeIn"
import { Link } from "react-router-dom"
import {
  BookOpen, HelpCircle, Coins, Trophy, Zap, Shield,
  ArrowRight, TerminalSquare, Layers, Globe, ChevronDown
} from "lucide-react"
import { useState } from "react"

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-2 border-[#333] bg-black transition-colors hover:border-[#CCFF00]/30">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <span className="font-sans text-[16px] font-bold uppercase text-white pr-4">{q}</span>
        <ChevronDown
          className={`size-5 shrink-0 text-[#CCFF00] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>
      {open && (
        <div className="border-t border-[#333] px-5 pb-5 pt-4">
          <p className="font-technical text-[14px] leading-[1.7] text-[#888]">{a}</p>
        </div>
      )}
    </div>
  )
}

export function DocsPage() {
  useDocTitle("Documentation")

  return (
    <div className="space-y-16 pb-12">
      {/* Hero header */}
      <FadeIn>
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 border border-[#333] bg-black px-3 py-1">
            <BookOpen className="size-3 text-[#CCFF00]" />
            <span className="font-technical text-[10px] font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
              Documentation
            </span>
          </div>
          <h1 className="font-sans text-[clamp(40px,6vw,72px)] font-black uppercase leading-[0.9] tracking-tighter text-white">
            THE <span className="text-[#CCFF00]">PROTOCOL.</span>
          </h1>
          <p className="font-technical text-[14px] leading-[1.6] text-[#888] uppercase max-w-[600px]">
            Everything you need to know about Pythia — the zero-BS prediction market protocol native to Initia.
          </p>
        </div>
      </FadeIn>

      {/* Table of Contents */}
      <FadeIn delay={0.05}>
        <nav className="brutalist-card bg-black p-6">
          <h2 className="mb-4 font-technical text-[12px] font-bold uppercase tracking-widest text-[#CCFF00] border-b border-[#333] pb-3">
            // TABLE OF CONTENTS
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "#what-is-pythia", label: "01 — What is Pythia" },
              { href: "#how-it-works", label: "02 — How It Works" },
              { href: "#market-mechanics", label: "03 — Market Mechanics" },
              { href: "#features", label: "04 — Features" },
              { href: "#why-initia", label: "05 — Why Initia" },
              { href: "#architecture", label: "06 — Architecture" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 border border-[#333] px-4 py-3 font-technical text-[12px] font-bold uppercase tracking-widest text-[#888] transition-all hover:border-[#CCFF00] hover:text-[#CCFF00] hover:bg-[#CCFF00]/5"
              >
                <ArrowRight className="size-3" strokeWidth={3} />
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </FadeIn>

      {/* Section 1 — What is Pythia */}
      <FadeIn delay={0.1}>
        <section id="what-is-pythia" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-[#333] pb-4">
            <div className="flex size-10 items-center justify-center bg-[#CCFF00]">
              <Zap className="size-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">Section 01</span>
              <h2 className="font-sans text-[clamp(24px,3vw,36px)] font-black uppercase tracking-tighter text-white">
                What is Pythia
              </h2>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="font-technical text-[14px] leading-[1.8] text-[#888]">
                Pythia is a permissionless prediction market protocol built natively on Initia's interwoven architecture. It lets anyone create binary outcome markets, stake positions, and earn rewards — all fully on-chain with zero intermediaries.
              </p>
              <p className="font-technical text-[14px] leading-[1.8] text-[#888]">
                Named after the Oracle of Delphi, Pythia transforms collective conviction into price signals. Unlike traditional prediction markets that rely on centralized order books, Pythia uses a parimutuel pool model where odds are determined purely by the distribution of bets.
              </p>
              <p className="font-technical text-[14px] leading-[1.8] text-[#888]">
                The protocol is built natively on Initia L1 using Move smart contracts and InterwovenKit for seamless cross-chain deposits. Users from any supported chain can participate without bridging.
              </p>
            </div>

            <div className="space-y-4">
              <div className="brutalist-card bg-[#050505] p-5 space-y-3">
                <h3 className="font-technical text-[12px] font-bold uppercase tracking-widest text-white">Key Features</h3>
                {[
                  "Permissionless market creation — anyone can create a prediction pool",
                  "Parimutuel odds — no market makers, no order books, pure pool mechanics",
                  "Cross-chain deposits via Interwoven Bridge — fund bets from any chain",
                  "Auto-signing — execute bets without repetitive wallet popups",
                  ".init usernames — social identity on leaderboards and market pages",
                  "Market categories — auto-tagged by keyword (Crypto, Sports, Politics, Tech, Culture)",
                  "Leaderboard — global rankings by volume and win rate, fully on-chain",
                  "2% platform fee — taken only from winning payouts",
                ].map((feature, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="font-technical text-[#CCFF00] font-black text-[12px] mt-0.5">[{i + 1}]</span>
                    <span className="font-technical text-[13px] text-[#888] leading-[1.6]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Section 2 — How It Works */}
      <FadeIn delay={0.1}>
        <section id="how-it-works" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-[#333] pb-4">
            <div className="flex size-10 items-center justify-center bg-[#CCFF00]">
              <HelpCircle className="size-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">Section 02</span>
              <h2 className="font-sans text-[clamp(24px,3vw,36px)] font-black uppercase tracking-tighter text-white">
                How It Works
              </h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: HelpCircle,
                title: "Create",
                subtitle: "Deploy a Market",
                description: "Define a binary question (YES/NO outcome) and set a deadline. The smart contract deploys an isolated liquidity pool with two sides. Anyone can create a market — no approval needed.",
                detail: "The question must be resolvable to an absolute TRUE or FALSE. Ambiguous conditions will fail during oracle resolution.",
              },
              {
                step: "02",
                icon: Coins,
                title: "Bet",
                subtitle: "Take a Position",
                description: "Choose YES or NO and deposit INIT tokens into the pool. Your share of the winning pool determines your payout. The more conviction on one side, the better the odds on the other.",
                detail: "Deposits are accepted from any Initia-supported chain via InterwovenKit. Enable 1-tap signing to skip wallet confirmations.",
              },
              {
                step: "03",
                icon: Trophy,
                title: "Claim",
                subtitle: "Collect Winnings",
                description: "When the deadline passes, the market creator or oracle resolves the outcome. If your position wins, you claim your proportional share of the entire pool minus the 2% platform fee.",
                detail: "Losers forfeit their entire stake. The winning pool is distributed proportionally — bigger bets earn bigger shares.",
              },
            ].map((item, i) => (
              <div key={item.step} className="brutalist-card bg-black p-6 flex flex-col h-full group">
                <div className="mb-6 flex justify-between items-start">
                  <div className="flex size-12 items-center justify-center bg-[#CCFF00] transition-transform group-hover:rotate-12">
                    <item.icon size={24} className="text-black" strokeWidth={2.5} />
                  </div>
                  <span className="font-technical text-3xl font-black text-[#333] group-hover:text-white transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">
                    {item.subtitle}
                  </span>
                </div>
                <h3 className="mb-3 font-sans text-[22px] font-black uppercase tracking-tighter text-white">
                  {item.title}
                </h3>
                <p className="mb-4 font-technical text-[13px] leading-[1.7] text-[#888] flex-1">
                  {item.description}
                </p>

                {/* Visual connector line between steps */}
                {i < 2 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="size-6 text-[#333]" strokeWidth={2} />
                  </div>
                )}

                <div className="border-t border-[#333] pt-4 mt-auto">
                  <p className="font-technical text-[11px] leading-[1.6] text-[#555] italic">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Section 3 — Market Mechanics */}
      <FadeIn delay={0.1}>
        <section id="market-mechanics" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-[#333] pb-4">
            <div className="flex size-10 items-center justify-center bg-[#CCFF00]">
              <Coins className="size-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">Section 03</span>
              <h2 className="font-sans text-[clamp(24px,3vw,36px)] font-black uppercase tracking-tighter text-white">
                Market Mechanics
              </h2>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Parimutuel Model */}
            <div className="brutalist-card bg-black p-6 space-y-5">
              <h3 className="font-technical text-[14px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-3">
                Parimutuel Pool Model
              </h3>
              <p className="font-technical text-[13px] leading-[1.7] text-[#888]">
                Pythia uses a parimutuel betting model — the same system used in horse racing and some sports betting. All bets are pooled together, and payouts are calculated based on the final pool distribution.
              </p>
              <div className="bg-[#050505] border border-[#333] p-4 space-y-3">
                <p className="font-technical text-[11px] font-bold uppercase tracking-widest text-[#CCFF00]">
                  // PAYOUT FORMULA
                </p>
                <div className="font-mono text-[14px] text-white leading-[2] space-y-1">
                  <p>gross = (your_bet * total_pool) / winning_pool</p>
                  <p>fee = gross * 0.02</p>
                  <p className="text-[#CCFF00] font-bold">payout = gross - fee</p>
                </div>
              </div>
              <p className="font-technical text-[13px] leading-[1.7] text-[#888]">
                This means odds are dynamic — they shift as more bets come in. Early conviction on the correct side yields higher returns. There are no fixed odds, no market makers, and no counterparty risk.
              </p>
            </div>

            {/* Worked Example */}
            <div className="brutalist-card bg-black p-6 space-y-5">
              <h3 className="font-technical text-[14px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-3">
                Worked Example
              </h3>
              <div className="space-y-4">
                <div className="bg-[#050505] border border-[#333] p-4">
                  <p className="font-technical text-[11px] font-bold uppercase tracking-widest text-[#CCFF00] mb-3">
                    // SCENARIO
                  </p>
                  <div className="space-y-2 font-technical text-[13px] text-[#888]">
                    <p>Market: "Will BTC hit $100K by April 10?"</p>
                    <p>YES pool: <span className="text-[#CCFF00] font-bold">8.0 INIT</span></p>
                    <p>NO pool: <span className="text-[#FF2A2A] font-bold">2.0 INIT</span></p>
                    <p>Total pool: <span className="text-white font-bold">10.0 INIT</span></p>
                  </div>
                </div>

                <div className="bg-[#050505] border border-[#CCFF00]/20 p-4">
                  <p className="font-technical text-[11px] font-bold uppercase tracking-widest text-[#CCFF00] mb-3">
                    // YOU BET 1.0 INIT ON YES
                  </p>
                  <div className="space-y-2 font-technical text-[13px] text-[#888]">
                    <p>New YES pool: 9.0 INIT &middot; New total: 11.0 INIT</p>
                    <p>Your share of YES: 1.0 / 9.0 = <span className="text-white font-bold">11.1%</span></p>
                    <p>If YES wins: 11.0 * 11.1% = <span className="text-white font-bold">1.222 INIT gross</span></p>
                    <p>Fee (2%): 0.024 INIT</p>
                    <p>Net payout: <span className="text-[#CCFF00] font-bold">1.198 INIT</span> (+0.198 profit)</p>
                    <p>Multiplier: <span className="text-[#CCFF00] font-bold">1.20x</span></p>
                  </div>
                </div>

                <div className="bg-[#050505] border border-[#FF2A2A]/20 p-4">
                  <p className="font-technical text-[11px] font-bold uppercase tracking-widest text-[#FF2A2A] mb-3">
                    // COMPARE: 1.0 INIT ON NO (CONTRARIAN)
                  </p>
                  <div className="space-y-2 font-technical text-[13px] text-[#888]">
                    <p>New NO pool: 3.0 INIT &middot; New total: 11.0 INIT</p>
                    <p>Your share of NO: 1.0 / 3.0 = <span className="text-white font-bold">33.3%</span></p>
                    <p>If NO wins: 11.0 * 33.3% = <span className="text-white font-bold">3.667 INIT gross</span></p>
                    <p>Net payout: <span className="text-[#CCFF00] font-bold">3.593 INIT</span> (+2.593 profit)</p>
                    <p>Multiplier: <span className="text-[#CCFF00] font-bold">3.59x</span></p>
                  </div>
                </div>

                <p className="font-technical text-[12px] leading-[1.7] text-[#555] italic">
                  Contrarian bets carry higher risk but significantly better odds. The pool mechanics naturally incentivize information discovery.
                </p>
              </div>
            </div>
          </div>

          {/* Fee Structure */}
          <div className="brutalist-card bg-black p-6">
            <h3 className="font-technical text-[14px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-3 mb-5">
              Fee Structure
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-[#333] bg-[#050505] p-4 text-center">
                <p className="font-sans text-3xl font-black text-[#CCFF00]">2%</p>
                <p className="mt-2 font-technical text-[11px] font-bold uppercase tracking-widest text-[#888]">Platform Fee</p>
                <p className="mt-1 font-technical text-[10px] text-[#555]">Deducted from winning payouts only</p>
              </div>
              <div className="border border-[#333] bg-[#050505] p-4 text-center">
                <p className="font-sans text-3xl font-black text-white">0</p>
                <p className="mt-2 font-technical text-[11px] font-bold uppercase tracking-widest text-[#888]">Market Creation Fee</p>
                <p className="mt-1 font-technical text-[10px] text-[#555]">Free to create any market</p>
              </div>
              <div className="border border-[#333] bg-[#050505] p-4 text-center">
                <p className="font-sans text-3xl font-black text-white">0</p>
                <p className="mt-2 font-technical text-[11px] font-bold uppercase tracking-widest text-[#888]">Deposit Fee</p>
                <p className="mt-1 font-technical text-[10px] text-[#555]">Only gas fees for on-chain tx</p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Section 4 — Platform Features */}
      <FadeIn delay={0.1}>
        <section id="features" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-[#333] pb-4">
            <div className="flex size-10 items-center justify-center bg-[#CCFF00]">
              <Zap className="size-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">Section 04</span>
              <h2 className="font-sans text-[clamp(24px,3vw,36px)] font-black uppercase tracking-tighter text-white">
                Platform Features
              </h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Auto-Signing",
                desc: "Connect via Email or Socials, enable a Ghost Wallet session, and place unlimited bets without wallet popups. Powered by Initia's authz grants.",
                badge: "INITIA NATIVE",
                color: "#CCFF00",
              },
              {
                title: "Interwoven Bridge",
                desc: "Deposit INIT from any connected chain directly from the bet form. When balance is low, a bridge CTA appears automatically.",
                badge: "INITIA NATIVE",
                color: "#CCFF00",
              },
              {
                title: ".init Usernames",
                desc: "Leaderboard and market pages resolve on-chain addresses to human-readable .init usernames (e.g. alice.init).",
                badge: "INITIA NATIVE",
                color: "#CCFF00",
              },
              {
                title: "Leaderboard",
                desc: "Global rankings of top predictors by volume and win rate. Real data from on-chain bettor lists — no indexer needed.",
                badge: "NEW",
                color: "#00BFFF",
              },
              {
                title: "Market Categories",
                desc: "Markets are auto-categorized by keyword analysis into Crypto, Sports, Politics, Tech, and Culture. Filter by category on the browse page.",
                badge: "NEW",
                color: "#00BFFF",
              },
              {
                title: "Admin Resolution",
                desc: "Inline resolve panel visible only to the contract admin. Pick YES or NO outcome directly from the market detail page — no CLI needed.",
                badge: "NEW",
                color: "#00BFFF",
              },
              {
                title: "Share to X",
                desc: "One-click share to Twitter/X with pre-filled market question and link. Also supports native share API and clipboard copy.",
                badge: "NEW",
                color: "#00BFFF",
              },
              {
                title: "Market Cancellation",
                desc: "Admin can cancel any unresolved market. All bettors receive full refunds automatically from the on-chain vault.",
                badge: "NEW",
                color: "#00BFFF",
              },
              {
                title: "Two-Step Ownership",
                desc: "Admin transfer requires proposal + acceptance. Prevents accidental lockout from typos in the new admin address.",
                badge: "NEW",
                color: "#00BFFF",
              },
              {
                title: "Payout Calculator",
                desc: "Live preview of potential returns as you adjust your bet amount. Shows gross, net, fee, profit, and multiplier in real-time.",
                badge: "CORE",
                color: "#888",
              },
              {
                title: "Command Palette",
                desc: "Press Cmd+K to search markets and navigate pages instantly. Keyboard-first UX for power users.",
                badge: "UX",
                color: "#888",
              },
            ].map((item) => (
              <div key={item.title} className="border-2 border-[#333] bg-[#050505] p-5 space-y-3 hover:border-[#CCFF00]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-technical text-[13px] font-bold uppercase tracking-widest text-white">{item.title}</h3>
                  <span
                    className="font-technical text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border"
                    style={{ color: item.color, borderColor: `${item.color}40` }}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="font-technical text-[12px] leading-[1.7] text-[#888]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Section 5 — Why Only Initia */}
      <FadeIn delay={0.1}>
        <section id="why-initia" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-[#333] pb-4">
            <div className="flex size-10 items-center justify-center bg-[#CCFF00]">
              <Globe className="size-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">Section 05</span>
              <h2 className="font-sans text-[clamp(24px,3vw,36px)] font-black uppercase tracking-tighter text-white">
                Why Only Initia
              </h2>
            </div>
          </div>

          <p className="font-technical text-[14px] leading-[1.8] text-[#888] max-w-[700px]">
            Pythia is not a generic prediction market ported to another chain. Three capabilities make it impossible to replicate on Ethereum, Solana, or any single-chain L1.
          </p>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="brutalist-card bg-black p-6 space-y-4 border-[#CCFF00]/30">
              <div className="flex items-center gap-2 border-b border-[#333] pb-3">
                <Zap className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
                <h3 className="font-technical text-[13px] font-bold uppercase tracking-widest text-white">Zero-Friction Betting</h3>
              </div>
              <p className="font-technical text-[12px] leading-[1.7] text-[#888]">
                Prediction markets live or die on speed of conviction. When odds shift, users need to bet NOW. Initia's Ghost Wallet auto-signing lets users connect via Email or Socials, enable a one-time session, and place unlimited bets without wallet popups. On Ethereum, that's a MetaMask confirmation per bet. On Solana, a Phantom approval each time. Initia's authz-based Ghost Wallet eliminates this entirely.
              </p>
              <div className="border border-[#333] bg-[#050505] p-3 text-center">
                <p className="font-sans text-2xl font-black text-[#CCFF00]">0</p>
                <p className="font-technical text-[10px] uppercase tracking-widest text-[#555]">Wallet popups per session</p>
              </div>
            </div>

            <div className="brutalist-card bg-black p-6 space-y-4 border-[#CCFF00]/30">
              <div className="flex items-center gap-2 border-b border-[#333] pb-3">
                <Globe className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
                <h3 className="font-technical text-[13px] font-bold uppercase tracking-widest text-white">Universal Liquidity</h3>
              </div>
              <p className="font-technical text-[12px] leading-[1.7] text-[#888]">
                Deeper pools = better odds = more users. Initia's Interwoven Bridge means anyone on Celestia, Cosmos, or any connected chain can deposit and bet in one click. On Polymarket, you bridge ETH to Polygon, swap to USDC, then deposit — 3 transactions across 2 chains. Initia collapses this to 1 click.
              </p>
              <div className="border border-[#333] bg-[#050505] p-3 text-center">
                <p className="font-sans text-2xl font-black text-[#CCFF00]">1</p>
                <p className="font-technical text-[10px] uppercase tracking-widest text-[#555]">Click to deposit from any chain</p>
              </div>
            </div>

            <div className="brutalist-card bg-black p-6 space-y-4 border-[#CCFF00]/30">
              <div className="flex items-center gap-2 border-b border-[#333] pb-3">
                <Trophy className="size-4 text-[#CCFF00]" strokeWidth={2.5} />
                <h3 className="font-technical text-[13px] font-bold uppercase tracking-widest text-white">Social Prediction Layer</h3>
              </div>
              <p className="font-technical text-[12px] leading-[1.7] text-[#888]">
                Prediction markets are inherently social — you're betting against other people's beliefs. .init usernames turn anonymous addresses into identities. When oracle.init is #1 with 78% win rate, you pay attention. This social layer doesn't exist on any other chain's prediction market.
              </p>
              <div className="border border-[#333] bg-[#050505] p-3 text-center">
                <p className="font-sans text-2xl font-black text-[#CCFF00]">.init</p>
                <p className="font-technical text-[10px] uppercase tracking-widest text-[#555]">Built-in reputation system</p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Section 6 — Architecture */}
      <FadeIn delay={0.1}>
        <section id="architecture" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-[#333] pb-4">
            <div className="flex size-10 items-center justify-center bg-[#CCFF00]">
              <Layers className="size-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">Section 06</span>
              <h2 className="font-sans text-[clamp(24px,3vw,36px)] font-black uppercase tracking-tighter text-white">
                Architecture
              </h2>
            </div>
          </div>

          {/* Stack diagram */}
          <div className="brutalist-card bg-black p-6 space-y-4">
            <h3 className="font-technical text-[14px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-3">
              Technology Stack
            </h3>

            <div className="space-y-3">
              {[
                {
                  layer: "Frontend",
                  icon: Globe,
                  tech: "React 19 + Vite + TailwindCSS v4",
                  desc: "Brutalist-designed SPA with real-time pool visualization, countdown timers, and responsive bet interface.",
                },
                {
                  layer: "Wallet & Auth",
                  icon: Shield,
                  tech: "InterwovenKit + Privy",
                  desc: "Cross-chain wallet connection with social login support. 1-tap signing enables frictionless betting without repeated confirmations.",
                },
                {
                  layer: "Smart Contract",
                  icon: TerminalSquare,
                  tech: "Move on Initia L1 (MoveVM)",
                  desc: "prediction_market module handling full market lifecycle — creation, betting, resolution, and payout claims. Parimutuel logic computed on-chain with Fungible Asset model.",
                },
                {
                  layer: "Settlement",
                  icon: Layers,
                  tech: "Initia L1",
                  desc: "Contract deployed natively on Initia L1. Leverages Initia's interwoven architecture for cross-chain deposits and fast finality.",
                },
              ].map((item) => (
                <div key={item.layer} className="flex gap-4 border border-[#333] bg-[#050505] p-4 items-start">
                  <div className="flex size-10 shrink-0 items-center justify-center border border-[#CCFF00] bg-[#CCFF00]/10">
                    <item.icon className="size-5 text-[#CCFF00]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-technical text-[12px] font-bold uppercase tracking-widest text-white">{item.layer}</span>
                      <span className="font-technical text-[10px] text-[#555]">{item.tech}</span>
                    </div>
                    <p className="font-technical text-[12px] leading-[1.6] text-[#888]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contract Functions */}
          <div className="brutalist-card bg-black p-6 space-y-4">
            <h3 className="font-technical text-[14px] font-bold uppercase tracking-widest text-white border-b border-[#333] pb-3">
              Contract Interface
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { fn: "create_market(question, deadline)", desc: "Create a new binary prediction pool" },
                { fn: "place_bet(market_id, outcome, amount)", desc: "Bet YES (0) or NO (1) with INIT" },
                { fn: "resolve_market(market_id, winning_outcome)", desc: "Settle the market (admin only)" },
                { fn: "cancel_market(market_id)", desc: "Cancel market & refund all bettors (admin)" },
                { fn: "claim_winnings(market_id)", desc: "Withdraw proportional payout" },
                { fn: "propose_admin(new_admin)", desc: "Step 1: propose new admin (admin only)" },
                { fn: "accept_admin()", desc: "Step 2: accept admin role (proposed addr only)" },
                { fn: "get_market(market_id)", desc: "Read market state (view)" },
                { fn: "get_bettors(market_id)", desc: "List all bettor addresses (view)" },
                { fn: "calculate_payout(market_id, bettor)", desc: "Preview potential payout (view)" },
              ].map((item) => (
                <div key={item.fn} className="border border-[#333] bg-[#050505] p-3">
                  <code className="font-mono text-[12px] text-[#CCFF00] break-all">{item.fn}</code>
                  <p className="mt-1 font-technical text-[10px] text-[#555] uppercase">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* FAQ */}
      <FadeIn delay={0.1}>
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-[#333] pb-4">
            <div className="flex size-10 items-center justify-center bg-[#CCFF00]">
              <HelpCircle className="size-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-technical text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">FAQ</span>
              <h2 className="font-sans text-[clamp(24px,3vw,36px)] font-black uppercase tracking-tighter text-white">
                Common Questions
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            <FAQItem
              q="Who resolves the markets?"
              a="Currently, the contract admin resolves markets via an inline resolution panel on the market detail page. Once the betting deadline passes, the admin selects the winning outcome (YES or NO) and payouts become claimable. In future versions, Pythia will integrate an optimistic oracle for decentralized, trustless resolution."
            />
            <FAQItem
              q="Can I cancel or withdraw my bet?"
              a="Individual bets cannot be withdrawn — once placed, they are locked until resolution. However, the admin can cancel an entire market if it becomes invalid or unanswerable. When a market is cancelled, all bettors receive full refunds automatically."
            />
            <FAQItem
              q="What happens if nobody bets on the losing side?"
              a="If all bets are on one side (e.g. 100% YES, 0% NO), the winners split the pool proportionally but gain no profit since there are no opposing bets to win from. The protocol fee is still deducted. This is an edge case that naturally resolves as odds become extremely favorable for the other side."
            />
            <FAQItem
              q="What chains can I deposit from?"
              a="Pythia uses Initia's InterwovenKit, which supports deposits from any chain in the Initia ecosystem. Connect your wallet, and cross-chain routing is handled automatically — no manual bridging required."
            />
            <FAQItem
              q="Is the contract audited?"
              a="Pythia is currently in hackathon/testnet phase. The smart contract has not been formally audited. Do not deposit funds you cannot afford to lose. A full audit will be conducted before any mainnet deployment."
            />
          </div>
        </section>
      </FadeIn>

      {/* CTA */}
      <FadeIn delay={0.1}>
        <div className="brutalist-card bg-black p-8 text-center space-y-6">
          <h2 className="font-sans text-[clamp(24px,4vw,40px)] font-black uppercase tracking-tighter text-white">
            Ready to <span className="text-[#CCFF00]">predict?</span>
          </h2>
          <p className="font-technical text-[14px] text-[#888] uppercase max-w-[400px] mx-auto">
            Browse live markets or create your own prediction pool.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/markets"
              className="btn-acid inline-flex h-12 items-center px-6 font-technical text-[14px] no-underline"
            >
              Browse Markets
              <ArrowRight className="ml-2 size-4" strokeWidth={3} />
            </Link>
            <Link
              to="/create"
              className="inline-flex h-12 items-center px-6 border-2 border-[#333] font-technical text-[14px] font-bold uppercase tracking-widest text-white hover:border-[#CCFF00] hover:text-[#CCFF00] transition-all no-underline"
            >
              Create Market
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
