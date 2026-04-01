import { useState, useEffect } from "react"
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
import { LandingPage } from "@/pages/LandingPage"
import { MarketsPage } from "@/pages/MarketsPage"
import { MarketDetailPage } from "@/pages/MarketDetailPage"
import { CreateMarketPage } from "@/pages/CreateMarketPage"
import { PortfolioPage } from "@/pages/PortfolioPage"
import { Toaster } from "@/components/Toaster"

const wagmiConfig = createConfig({
  connectors: [initiaPrivyWalletConnector],
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
})

const queryClient = new QueryClient()

export default function App() {
  const [booting, setBooting] = useState(() => {
    // Only boot once per tab session
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
              <Routes>
                {/* Landing page — no layout chrome */}
                <Route index element={<LandingPage />} />

                {/* App pages — with nav header */}
                <Route element={<Layout />}>
                  <Route path="/markets" element={<MarketsPage />} />
                  <Route path="/markets/:id" element={<MarketDetailPage />} />
                  <Route path="/create" element={<CreateMarketPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          )}
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

