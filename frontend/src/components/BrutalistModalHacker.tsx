import { useEffect } from "react"

export function BrutalistModalHacker() {
  useEffect(() => {
    // We observe the body for the privy modal or interwoven modal injection
    const observer = new MutationObserver(() => {
      // Find the #privy-dialog or interwoven dialog
      // Interwovenkit injects a modal with various IDs, but Privy specifically uses #privy-dialog 
      // with a shadowRoot.
      const privyDialog = document.querySelector("#privy-dialog") as HTMLElement
      
      if (privyDialog && privyDialog.shadowRoot) {
        // Only inject once
        if (privyDialog.shadowRoot.querySelector("#brutalist-hack")) return

        const style = document.createElement("style")
        style.id = "brutalist-hack"
        style.textContent = `
          /* OVERRIDE PRIVY SHADOW DOM */
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
        privyDialog.shadowRoot.appendChild(style)
      }

      // Also let's hunt for any non-shadow DOM interwoven kit modals
      // based on the hashed classes that I found in styles.css
      const interwovenModals = document.querySelectorAll('[class*="_modal_"], [role="dialog"], #privy-dialog, [id^="headlessui-portal"]')
      
      let modalFound = false;
      let targetZIndex = "99998";

      interwovenModals.forEach((modal) => {
        if (modal.id.includes("headlessui") && !modal.querySelector('[role="dialog"]')) return;
        
        // Skip our own overlay
        if (modal.id === "brutalist-mega-overlay") return;
        
        modalFound = true;
        
        // Find the z-index of the modal
        const computedZ = window.getComputedStyle(modal).zIndex;
        if (computedZ && computedZ !== "auto") {
           // We want to be just below the modal
           targetZIndex = (parseInt(computedZ) - 1).toString();
        }
        
        // Apply our hacked class
        if (modal.classList.contains("brutalist-hacked")) return
        modal.classList.add("brutalist-hacked")
        
        const el = modal as HTMLElement
        el.style.setProperty("border-radius", "0px", "important")
        if (modal.getAttribute("role") === "dialog" || modal.className.includes("_modal_")) {
          el.style.setProperty("border", "2px solid #333", "important")
          el.style.setProperty("box-shadow", "8px 8px 0px 0px #CCFF00", "important")
        }
      })

      // Explicitly inject a mega overlay to the body to block everything!
      let overlay = document.getElementById("brutalist-mega-overlay");
      if (modalFound) {
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.id = "brutalist-mega-overlay";
          overlay.style.position = "fixed";
          overlay.style.inset = "0";
          overlay.style.width = "100vw";
          overlay.style.height = "100vh";
          overlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
          overlay.style.backdropFilter = "blur(8px) grayscale(100%)";
          overlay.style.pointerEvents = "auto";
          overlay.style.transition = "all 0.3s ease";
          document.body.appendChild(overlay);
        }
        overlay.style.zIndex = targetZIndex;
        document.body.style.overflow = "hidden";
      } else {
        if (overlay) {
          overlay.remove();
        }
        document.body.style.overflow = "auto";
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    // Also forcefully overwrite any privy css variables that might be attached to html/body
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
      
      /* Target the modal inner classes directly and FORCE them to change */
      [class*="_modal_"] {
        border-radius: 0px !important;
        border: 2px solid #333 !important;
        box-shadow: 8px 8px 0px 0px #CCFF00 !important;
        background-color: #0A0A0A !important;
        text-transform: uppercase !important;
        font-family: var(--font-mono) !important;
      }

      /* Brutalist intense backdrop and unfocus effect */
      [class*="_overlay_"], 
      [class*="_backdrop_"],
      [id^="headlessui-portal"] > div > div:first-child,
      body > [role="dialog"] > div:first-child {
        background-color: rgba(0, 0, 0, 0.9) !important;
        backdrop-filter: blur(8px) grayscale(100%) !important;
      }

      /* Dim and disable entire app background when modal is open */
      body.modal-open-brutalist #root {
        filter: blur(8px) grayscale(100%) !important;
        pointer-events: none !important;
        user-select: none !important;
        transition: filter 0.3s ease !important;
      }
      
      body.modal-open-brutalist {
        overflow: hidden !important;
      }

      #root {
        transition: all 0.3s ease;
      }

      /* Connect wallet button overrides */
      [class*="_modal_"] *, [role="dialog"] * {
        border-radius: 0px !important;
      }

      [class*="_modal_"] button, [class*="_modal_"] li, [class*="_modal_"] [role="button"], [class*="_modal_"] input,
      [class*="_button_"], [class*="_socialButton_"], [class*="_listItem_"] {
        border-radius: 0px !important;
        font-family: var(--font-mono) !important;
        text-transform: uppercase !important;
        border: 1px solid #333 !important;
        transition: all 0.1s !important;
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
      observer.disconnect()
      const el = document.getElementById("brutalist-max-override")
      if (el) el.remove()
    }
  }, [])

  return null
}
