import { useEffect } from "react"

export function useDocTitle(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} | PYTHIA` : "PYTHIA — Prediction Markets on Initia"
    return () => { document.title = prev }
  }, [title])
}
