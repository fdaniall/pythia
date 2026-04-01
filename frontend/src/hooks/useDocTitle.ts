import { useEffect } from "react"

export function useDocTitle(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} | Pythia` : "Pythia"
    return () => { document.title = prev }
  }, [title])
}
