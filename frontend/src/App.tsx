import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { InterwovenKitProvider, TESTNET } from "@initia/interwovenkit-react"
import { Layout } from "@/components/Layout"
import { MarketsPage } from "@/pages/MarketsPage"
import { MarketDetailPage } from "@/pages/MarketDetailPage"
import { CreateMarketPage } from "@/pages/CreateMarketPage"
import { PortfolioPage } from "@/pages/PortfolioPage"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<MarketsPage />} />
              <Route path="/markets/:id" element={<MarketDetailPage />} />
              <Route path="/create" element={<CreateMarketPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </InterwovenKitProvider>
    </QueryClientProvider>
  )
}

export default App
