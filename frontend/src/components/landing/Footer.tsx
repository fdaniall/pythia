export function Footer() {
  return (
    <footer className="w-full bg-black border-t-2 border-[#333]">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        {/* Main row */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center border border-[#CCFF00] p-1 bg-black">
                <img src="/pythia-logo.svg" alt="Pythia Logo" className="size-full object-contain" />
              </div>
              <span className="font-technical text-2xl font-black tracking-widest uppercase text-white">
                PYTHIA
              </span>
            </div>
            <p className="font-technical text-[13px] leading-[1.6] text-[#888] max-w-sm uppercase">
              ZERO-BULLSHIT PREDICTION MARKETS. EXECUTE TRADES ON-CHAIN.
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="text-[#888] transition-colors duration-200 hover:text-[#CCFF00]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-[#888] transition-colors duration-200 hover:text-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-[#333] pt-6 font-technical text-[11px] uppercase tracking-widest text-[#555]">
          <p>
            &copy; 2026 PYTHIA. PROTOCOL V1.
          </p>
          <p className="mt-2 md:mt-0">
            SECURED BY INITIA
          </p>
        </div>
      </div>
    </footer>
  )
}
