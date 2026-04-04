import { useEffect } from "react"

export function BrutalistModalHacker() {
  useEffect(() => {
    let privyShadowObserver: MutationObserver | null = null
    let iwkShadowObserver: MutationObserver | null = null

    // Check if a shadow root has any visible fixed-position element (modal/drawer open signal)
    const hasShadowModalOpen = (shadowRoot: ShadowRoot) => {
      const els = Array.from(shadowRoot.querySelectorAll('*')) as HTMLElement[]
      return els.some(el => {
        const s = window.getComputedStyle(el)
        return s.position === 'fixed' && el.offsetWidth > 50
      })
    }

    // Checks if Privy's shadow root currently has a visible dialog
    const isPrivyOpen = () => {
      const privyDialog = document.querySelector("#privy-dialog") as HTMLElement
      if (!privyDialog?.shadowRoot) return false
      return hasShadowModalOpen(privyDialog.shadowRoot)
    }

    // Checks if InterwovenKit's shadow root currently has a visible drawer/modal
    const isInterwovenOpen = () => {
      const iwk = document.querySelector('interwoven-kit') as HTMLElement
      if (!iwk?.shadowRoot) return false
      return hasShadowModalOpen(iwk.shadowRoot)
    }

    // Injects brutalist styles into Privy shadow root (idempotent)
    const injectPrivyStyles = (shadowRoot: ShadowRoot) => {
      if (shadowRoot.querySelector("#brutalist-hack")) return
      const style = document.createElement("style")
      style.id = "brutalist-hack"
      style.textContent = `
        * {
          border-radius: 0px !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
        }
        .privy-modal-content, [role="dialog"], [part="content"] {
          border-radius: 0px !important;
          border: 2px solid #333 !important;
          box-shadow: 8px 8px 0px 0px #CCFF00 !important;
          background-color: #0A0A0A !important;
          text-transform: uppercase !important;
        }
        button, input {
          border-radius: 0px !important;
          text-transform: uppercase !important;
          transition: all 0.1s !important;
          border: 1px solid #555 !important;
          background-color: #111 !important;
          color: #fff !important;
        }
        button:last-of-type {
          background-color: #CCFF00 !important;
          color: #000 !important;
          border-color: #CCFF00 !important;
          font-weight: 900 !important;
        }
        button:hover {
          background-color: #CCFF00 !important;
          color: #000 !important;
          border-color: #CCFF00 !important;
        }
        button:hover * {
          color: #000 !important;
        }
      `
      shadowRoot.appendChild(style)
    }

    const isElementVisible = (el: Element) => {
      const style = window.getComputedStyle(el as HTMLElement)
      return style.display !== "none" && style.visibility !== "hidden" && (el as HTMLElement).offsetWidth > 0
    }

    // Single source of truth: compute modal state and apply overlay
    const updateOverlayState = () => {
      const privyOpen = isPrivyOpen()

      // Check InterwovenKit backdrop/overlay elements in regular DOM
      const backdropEl = document.querySelector('[class*="_backdrop_"], [class*="_overlay_"]')
      const hasVisibleBackdrop = !!backdropEl && isElementVisible(backdropEl)

      // Detect InterwovenKit drawer: it renders as <interwoven-kit> custom element on body.
      // Its height is 0 because all content inside is position:fixed — so check children's dimensions.
      const IGNORED_IDS = new Set(["root", "brutalist-mega-overlay"])
      const IGNORED_TAGS = new Set(["script", "style", "link", "noscript", "meta"])
      const hasPortal = Array.from(document.body.children).some((el) => {
        if (IGNORED_TAGS.has(el.tagName.toLowerCase())) return false
        if (el.id && IGNORED_IDS.has(el.id)) return false
        // Normal portal: has height itself
        if ((el as HTMLElement).offsetHeight > 0) return true
        // Fixed-position portal (e.g. <interwoven-kit>): h=0 but children have dimensions
        return Array.from(el.children).some((child) => {
          const c = child as HTMLElement
          return c.offsetWidth > 0 || c.offsetHeight > 0
        })
      })

      const interwovenModals = document.querySelectorAll('[class*="_modal_"], [role="dialog"]')
      let hasVisibleModal = false
      let targetZIndex = "9998"

      interwovenModals.forEach((modal) => {
        if (modal.id === "brutalist-mega-overlay") return
        if (!isElementVisible(modal)) return
        hasVisibleModal = true
        const computedZ = window.getComputedStyle(modal as HTMLElement).zIndex
        if (computedZ && computedZ !== "auto") {
          targetZIndex = (parseInt(computedZ) - 1).toString()
        }
        if (!modal.classList.contains("brutalist-hacked")) {
          modal.classList.add("brutalist-hacked")
          const el = modal as HTMLElement
          el.style.setProperty("border-radius", "0px", "important")
          el.style.setProperty("border", "2px solid #333", "important")
          el.style.setProperty("box-shadow", "8px 8px 0px 0px #CCFF00", "important")
        }
      })


      const iwkOpen = isInterwovenOpen()
      const modalOpen = privyOpen || iwkOpen || hasVisibleBackdrop || hasPortal || hasVisibleModal

      let overlay = document.getElementById("brutalist-mega-overlay")
      if (modalOpen) {
        if (!overlay) {
          overlay = document.createElement("div")
          overlay.id = "brutalist-mega-overlay"
          overlay.style.position = "fixed"
          overlay.style.inset = "0"
          overlay.style.width = "100vw"
          overlay.style.height = "100vh"
          overlay.style.backgroundColor = "rgba(0, 0, 0, 0.75)"
          overlay.style.backdropFilter = "blur(8px) grayscale(100%)"
          overlay.style.pointerEvents = "auto"
          overlay.style.transition = "all 0.3s ease"
          overlay.style.cursor = "pointer"
          overlay.addEventListener("click", () => {
            // Try clicking IWK's own internal overlay (its built-in close handler)
            const iwk = document.querySelector("interwoven-kit") as HTMLElement
            const iwkOverlay = iwk?.shadowRoot?.querySelector('[class*="_overlay_"]') as HTMLElement
            if (iwkOverlay) {
              iwkOverlay.click()
              return
            }
            // Fallback: send Escape key (works with most modal libraries)
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))
          })
          document.body.appendChild(overlay)
        }
        overlay.style.zIndex = targetZIndex
        document.body.style.overflow = "hidden"
        document.body.classList.add("modal-open-brutalist")
      } else {
        overlay?.remove()
        document.body.style.overflow = "auto"
        document.body.classList.remove("modal-open-brutalist")
      }
    }

    const setupPrivyShadowObserver = (shadowRoot: ShadowRoot) => {
      if (privyShadowObserver) return
      privyShadowObserver = new MutationObserver(updateOverlayState)
      privyShadowObserver.observe(shadowRoot, { childList: true, subtree: true, attributes: true })
    }

    // Inject brutalist styles into InterwovenKit shadow root
    const injectIwkStyles = (shadowRoot: ShadowRoot) => {
      if (shadowRoot.querySelector("#brutalist-iwk-hack")) return
      const style = document.createElement("style")
      style.id = "brutalist-iwk-hack"
      style.textContent = `
        * {
          border-radius: 0px !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
        }
        button, [role="button"] {
          border-radius: 0px !important;
          text-transform: uppercase !important;
          transition: all 0.1s !important;
          border: 1px solid #555 !important;
        }
        button:hover, [role="button"]:hover {
          border-color: #CCFF00 !important;
          background-color: #1a1a1a !important;
        }
        input, select, textarea {
          border-radius: 0px !important;
          border: 1px solid #333 !important;
          background-color: #0A0A0A !important;
          color: #fff !important;
        }
        span, p, div, label, h1, h2, h3, h4, h5, h6, a {
          border: none !important;
          box-shadow: none !important;
          color: #fff !important;
        }
        h1, h2, h3, [class*="title"], [class*="header"] {
          color: #fff !important;
          font-weight: 900 !important;
        }
        [class*="description"], [class*="subtitle"], [class*="secondary"], [class*="label"] {
          color: #888 !important;
        }
        [class*="modal"], [class*="drawer"], [class*="dialog"] {
          border-radius: 0px !important;
          border: 2px solid #333 !important;
          box-shadow: 8px 8px 0px 0px #CCFF00 !important;
          background-color: #0A0A0A !important;
        }
        [class*="overlay"], [class*="backdrop"] {
          background-color: rgba(0, 0, 0, 0.85) !important;
          backdrop-filter: blur(4px) grayscale(100%) !important;
        }
      `
      shadowRoot.appendChild(style)
    }

    // Runtime fix: find lime-bg buttons and force black text on all children
    // Also fix modal container styling
    const fixLimeButtonText = (shadowRoot: ShadowRoot) => {
      const buttons = shadowRoot.querySelectorAll("button, [role='button']")
      buttons.forEach((btn) => {
        const bg = window.getComputedStyle(btn).backgroundColor
        // Check if bg is lime-ish (#CCFF00 = rgb(204, 255, 0))
        if (bg.includes("204") && bg.includes("255") && bg.includes("0")) {
          (btn as HTMLElement).style.setProperty("color", "#000", "important")
          btn.querySelectorAll("*").forEach((child) => {
            (child as HTMLElement).style.setProperty("color", "#000", "important")
          })
        }
      })

      // Find the main modal/panel container and add brutalist border
      const containers = shadowRoot.querySelectorAll("[class*='panel'], [class*='content'], [class*='container'], [class*='wrapper'], [role='dialog']")
      containers.forEach((el) => {
        const h = (el as HTMLElement).offsetHeight
        if (h > 200) {
          (el as HTMLElement).style.setProperty("border", "2px solid #333", "important")
          ;(el as HTMLElement).style.setProperty("box-shadow", "8px 8px 0px 0px #CCFF00", "important")
          ;(el as HTMLElement).style.setProperty("border-radius", "0px", "important")
        }
      })
    }

    const setupIwkShadowObserver = (shadowRoot: ShadowRoot) => {
      if (iwkShadowObserver) return
      injectIwkStyles(shadowRoot)
      fixLimeButtonText(shadowRoot)
      iwkShadowObserver = new MutationObserver(() => {
        injectIwkStyles(shadowRoot)
        fixLimeButtonText(shadowRoot)
        updateOverlayState()
      })
      iwkShadowObserver.observe(shadowRoot, { childList: true, subtree: true, attributes: true })
    }

    // Run immediately on mount in case elements are already in DOM
    const existingPrivy = document.querySelector("#privy-dialog") as HTMLElement
    if (existingPrivy?.shadowRoot) {
      injectPrivyStyles(existingPrivy.shadowRoot)
      setupPrivyShadowObserver(existingPrivy.shadowRoot)
    }
    const existingIwk = document.querySelector("interwoven-kit") as HTMLElement
    if (existingIwk?.shadowRoot) {
      setupIwkShadowObserver(existingIwk.shadowRoot)
    }

    // Main body observer — detects new shadow host elements appearing (childList only, no subtree)
    const observer = new MutationObserver(() => {
      const privyDialog = document.querySelector("#privy-dialog") as HTMLElement
      if (privyDialog?.shadowRoot) {
        injectPrivyStyles(privyDialog.shadowRoot)
        setupPrivyShadowObserver(privyDialog.shadowRoot)
      }
      const iwk = document.querySelector("interwoven-kit") as HTMLElement
      if (iwk?.shadowRoot) {
        setupIwkShadowObserver(iwk.shadowRoot)
      }
      updateOverlayState()
    })

    observer.observe(document.body, { childList: true })

    // Polling fallback — only active when a modal overlay is present
    let pollInterval: number | null = null
    const originalUpdate = updateOverlayState
    const wrappedUpdate = () => {
      originalUpdate()
      const overlayExists = !!document.getElementById("brutalist-mega-overlay")
      if (overlayExists && !pollInterval) {
        pollInterval = window.setInterval(originalUpdate, 500)
      } else if (!overlayExists && pollInterval) {
        window.clearInterval(pollInterval)
        pollInterval = null
      }
    }
    // Replace calls to use wrapped version for body observer
    observer.disconnect()
    const observer2 = new MutationObserver(() => {
      const privyDialog = document.querySelector("#privy-dialog") as HTMLElement
      if (privyDialog?.shadowRoot) {
        injectPrivyStyles(privyDialog.shadowRoot)
        setupPrivyShadowObserver(privyDialog.shadowRoot)
      }
      const iwk = document.querySelector("interwoven-kit") as HTMLElement
      if (iwk?.shadowRoot) {
        setupIwkShadowObserver(iwk.shadowRoot)
      }
      wrappedUpdate()
    })
    observer2.observe(document.body, { childList: true })

    // CSS variable overrides
    document.documentElement.style.setProperty("--privy-border-radius-md", "0px", "important")
    document.documentElement.style.setProperty("--privy-border-radius-lg", "0px", "important")

    const headStyle = document.createElement("style")
    headStyle.id = "brutalist-max-override"
    headStyle.textContent = `
      :root, :host, body, [data-theme="dark"], #initia-wrapper, [id^="headlessui-portal"] * {
        --border-radius: 0px !important;
        --drawer-width: 420px !important;
        --font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
        --monospace: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
        --gray-0: #f5f5f5 !important;
        --gray-6: #111111 !important;
        --gray-7: #0A0A0A !important;
        --gray-8: #0A0A0A !important;
        --gray-9: #000000 !important;
        --bg: #000000 !important;
        --button-bg: transparent !important;
        --button-bg-hover: #CCFF00 !important;
        --button-text-hover: #000000 !important;
        --input-border: #333333 !important;
        --input-border-focus: #CCFF00 !important;
        --border: #333333 !important;
        --component-shadow: 8px 8px 0px 0px #CCFF00 !important;
        --drawer-shadow: 8px 8px 0px 0px #CCFF00 !important;
        --success: #CCFF00 !important;
        --info: #CCFF00 !important;
      }

      [class*="_modal_"], [class*="_panel_"] {
        border-radius: 0px !important;
        border: 2px solid #333 !important;
        box-shadow: 8px 8px 0px 0px #CCFF00 !important;
        background-color: #0A0A0A !important;
        text-transform: uppercase !important;
        font-family: var(--font-mono) !important;
      }

      [class*="_overlay_"],
      [class*="_backdrop_"],
      [id^="headlessui-portal"] > div > div:first-child,
      body > [role="dialog"] > div:first-child {
        background-color: rgba(0, 0, 0, 0.9) !important;
        backdrop-filter: blur(8px) grayscale(100%) !important;
      }

      /* CSS :has() — zero-JS fallback for InterwovenKit (not Privy, which is shadow DOM) */
      body:has([class*="_backdrop_"]) #root,
      body:has([class*="_overlay_"]) #root,
      body:has([class*="_modal_"]) #root {
        filter: blur(8px) grayscale(100%) !important;
        pointer-events: none !important;
        user-select: none !important;
      }

      body:has([class*="_backdrop_"]),
      body:has([class*="_overlay_"]),
      body:has([class*="_modal_"]) {
        overflow: hidden !important;
      }

      /* JS-driven fallback (covers Privy) */
      body.modal-open-brutalist #root {
        filter: blur(8px) grayscale(100%) !important;
        pointer-events: none !important;
        user-select: none !important;
      }

      body.modal-open-brutalist {
        overflow: hidden !important;
      }

      #root {
        transition: filter 0.3s ease;
      }

      [class*="_modal_"] *, [role="dialog"] * {
        border-radius: 0px !important;
      }

      [class*="_modal_"] span, [class*="_modal_"] p, [class*="_modal_"] div,
      [class*="_modal_"] label, [class*="_modal_"] h1, [class*="_modal_"] h2,
      [class*="_modal_"] h3, [class*="_modal_"] a,
      [class*="_content_"] span, [class*="_content_"] p, [class*="_content_"] div {
        color: #fff !important;
      }

      [class*="_modal_"] button, [class*="_modal_"] li, [class*="_modal_"] [role="button"], [class*="_modal_"] input,
      [class*="_button_"], [class*="_socialButton_"], [class*="_listItem_"] {
        border-radius: 0px !important;
        font-family: var(--font-mono) !important;
        text-transform: uppercase !important;
        border: 1px solid #555 !important;
        background-color: #111 !important;
        color: #fff !important;
        transition: all 0.1s !important;
      }

      /* Lime bg buttons: force black text on children */
      [class*="_socialButton_"] * {
        color: #000 !important;
      }

      [class*="_modal_"] button:hover, [class*="_modal_"] li:hover,
      [class*="_button_"]:hover, [class*="_socialButton_"]:hover, [class*="_listItem_"]:hover {
        background-color: #CCFF00 !important;
        color: #000 !important;
        border-color: #CCFF00 !important;
        outline: none !important;
      }

      [class*="_modal_"] button:hover *, [class*="_modal_"] li:hover *,
      [class*="_socialButton_"]:hover *, [class*="_listItem_"]:hover * {
        color: #000 !important;
      }
    `
    if (!document.getElementById("brutalist-max-override")) {
      document.head.appendChild(headStyle)
    }

    return () => {
      observer2.disconnect()
      privyShadowObserver?.disconnect()
      iwkShadowObserver?.disconnect()
      if (pollInterval !== null) window.clearInterval(pollInterval)
      document.getElementById("brutalist-max-override")?.remove()
    }
  }, [])

  return null
}
