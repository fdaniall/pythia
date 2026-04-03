import { useEffect, lazy, Suspense, Component } from "react"
import type { ReactNode, ErrorInfo } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createConfig, http, WagmiProvider } from "wagmi"
import { mainnet } from "wagmi/chains"
import { defineChain } from "viem"

const initiaAppchain = defineChain({
  id: 7658622,
  name: "Initia Testnet",
  nativeCurrency: { name: "INIT", symbol: "INIT", decimals: 6 },
  rpcUrls: { default: { http: ["https://json-rpc.testnet.initia.xyz"] } },
  blockExplorers: { default: { name: "Initia Scan", url: "https://scan.testnet.initia.xyz" } },
  testnet: true,
})
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
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage").then(m => ({ default: m.LeaderboardPage })))
const DocsPage = lazy(() => import("@/pages/DocsPage").then(m => ({ default: m.DocsPage })))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })))

const wagmiConfig = createConfig({
  connectors: [initiaPrivyWalletConnector],
  // mainnet included as fallback; initiaAppchain is the primary chain
  chains: [mainnet, initiaAppchain],
  transports: {
    [mainnet.id]: http(),
    [initiaAppchain.id]: http("https://json-rpc.testnet.initia.xyz"),
  },
})

const queryClient = new QueryClient()

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Pythia ErrorBoundary:", error, info.componentStack)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          <div className="text-center space-y-4 px-4">
            <div className="border-2 border-[#FF2A2A] px-8 py-3 inline-block">
              <span className="font-mono text-4xl font-black text-[#FF2A2A]">FATAL</span>
            </div>
            <p className="font-mono text-sm text-[#888] uppercase">Something went wrong. Please reload.</p>
            <button
              onClick={() => window.location.reload()}
              className="border-2 border-[#CCFF00] bg-[#CCFF00] text-black px-6 py-2 font-mono text-sm font-bold uppercase"
            >
              RELOAD
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function RouteLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex size-12 items-center justify-center border-2 border-[#CCFF00]">
          <div className="size-3 bg-[#CCFF00] animate-pulse" />
          <div className="absolute inset-0 border-2 border-[#CCFF00] animate-ping opacity-20" />
        </div>
        <p className="font-technical text-[12px] font-bold uppercase tracking-widest text-[#888]">
          LOADING MODULE...
        </p>
      </div>
    </div>
  )
}

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
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
            <ScrollToTop />
            <BrutalistModalHacker />
            <Toaster position="bottom-right" />
            <ErrorBoundary>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route index element={<LandingPage />} />
                <Route element={<Layout />}>
                  <Route path="/markets" element={<MarketsPage />} />
                  <Route path="/markets/:id" element={<MarketDetailPage />} />
                  <Route path="/create" element={<CreateMarketPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/docs" element={<DocsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
