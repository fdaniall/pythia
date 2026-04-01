import { useState, useEffect, lazy, Suspense } from "react"
import { BootLoader } from "@/components/BootLoader"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createConfig, http, WagmiProvider } from "wagmi"
import { mainnet } from "wagmi/chains"
import {
  InterwovenKitProvider,
  TESTNET,
  initiaPrivyWalletConnector,
  injectStyles,
} from "@initia/interwovenkit-react"
import InterwovenKitStyles from "@initia/interwovenkit-react/styles.js"
import { Layout } from "@/components/Layout"
import { BrutalistModalHacker } from "@/components/BrutalistModalHacker"
import { Toaster } from "@/components/Toaster"

const LandingPage = lazy(() => import("@/pages/LandingPage").then(m => ({ default: m.LandingPage })))
const MarketsPage = lazy(() => import("@/pages/MarketsPage").then(m => ({ default: m.MarketsPage })))
const MarketDetailPage = lazy(() => import("@/pages/MarketDetailPage").then(m => ({ default: m.MarketDetailPage })))
const CreateMarketPage = lazy(() => import("@/pages/CreateMarketPage").then(m => ({ default: m.CreateMarketPage })))
const PortfolioPage = lazy(() => import("@/pages/PortfolioPage").then(m => ({ default: m.PortfolioPage })))

const wagmiConfig = createConfig({
  connectors: [initiaPrivyWalletConnector],
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
})

const queryClient = new QueryClient()

function RouteLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-3 bg-[#CCFF00] animate-pulse" />
        <p className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#888]">
          LOADING MODULE...
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [booting, setBooting] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("pythia_booted")
    }
    return true
  })

  useEffect(() => {
    injectStyles(InterwovenKitStyles)
  }, [])

  const handleBootComplete = () => {
    sessionStorage.setItem("pythia_booted", "true")
    setBooting(false)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider
          defaultChainId={TESTNET.defaultChainId}
          registryUrl={TESTNET.registryUrl}
          routerApiUrl={TESTNET.routerApiUrl}
          glyphUrl={TESTNET.glyphUrl}
          usernamesModuleAddress={TESTNET.usernamesModuleAddress}
          lockStakeModuleAddress={TESTNET.lockStakeModuleAddress}
          minityUrl={TESTNET.minityUrl}
          dexUrl={TESTNET.dexUrl}
          vipUrl={TESTNET.vipUrl}
          theme="dark"
        >
          {booting && <BootLoader onComplete={handleBootComplete} />}
          {!booting && (
            <BrowserRouter>
              <BrutalistModalHacker />
              <Toaster position="bottom-right" />
              <Suspense fallback={<RouteLoader />}>
                <Routes>
                  <Route index element={<LandingPage />} />
                  <Route element={<Layout />}>
                    <Route path="/markets" element={<MarketsPage />} />
                    <Route path="/markets/:id" element={<MarketDetailPage />} />
                    <Route path="/create" element={<CreateMarketPage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          )}
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
