import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
  direction?: "up" | "down" | "none"
}

export function FadeIn({ children, delay = 0, className, direction = "up" }: FadeInProps) {
  const y = direction === "up" ? 30 : direction === "down" ? -30 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
