"use client"

import { motion } from "framer-motion"
import { useMousePosition, useElementMousePosition } from "@/hooks/use-mouse-position"
import { useRef } from "react"

interface ParallaxCardsProps {
  children: React.ReactNode
  intensity?: number
}

export function ParallaxCard({ children, intensity = 8 }: ParallaxCardsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const elementMousePos = useElementMousePosition(ref)

  // Convert normalized -1 to 1 to percentage offset
  const offsetY = (elementMousePos.y * intensity) % 100

  return (
    <motion.div
      ref={ref}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{
        y: offsetY,
        transition: { type: "spring", stiffness: 100, damping: 20 },
      }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      {children}
    </motion.div>
  )
}
