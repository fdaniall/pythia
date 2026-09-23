import { useRef, useEffect, useState } from "react"
import type { ReactNode, CSSProperties } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
  direction?: "up" | "down" | "none"
}

export function FadeIn({ children, delay = 0, className, direction = "up" }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [noMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )

  useEffect(() => {
    // Reduced motion renders with no animation styles, so visibility is irrelevant
    if (noMotion) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { rootMargin: "-50px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [noMotion])

  const y = direction === "up" ? 30 : direction === "down" ? -30 : 0

  const style: CSSProperties = noMotion
    ? {}
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        willChange: visible ? "auto" : "opacity, transform",
      }

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  )
}
