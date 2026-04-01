import { useEffect } from "react"
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

function App() {
  useEffect(() => {
    injectStyles(InterwovenKitStyles)
  }, [])

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
          <BrowserRouter>
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
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export default App
