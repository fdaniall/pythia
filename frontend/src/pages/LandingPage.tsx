import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Stats } from "@/components/landing/Stats"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Features } from "@/components/landing/Features"
import { CTA } from "@/components/landing/CTA"
import { Footer } from "@/components/landing/Footer"

export function LandingPage() {
  return (
    <div className="bg-oracle-glow relative min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </div>
  )
}
