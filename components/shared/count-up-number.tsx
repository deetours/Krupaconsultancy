"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { useEffect } from "react"

interface CountUpNumberProps {
  target: number | string
  duration?: number
  delay?: number
  className?: string
}

export function CountUpNumber({ target, duration = 2, delay = 0, className = "" }: CountUpNumberProps) {
  // Extract numeric value from target (e.g., "98%" -> 98)
  const numValue = typeof target === "string" ? parseInt(target) : target
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = motionValue.set(numValue, {
      type: "spring",
      duration,
      stiffness: 50,
      damping: 20,
    })
  }, [motionValue, numValue, duration])

  return (
    <motion.span className={className}>
      <motion.span>{rounded}</motion.span>
      {typeof target === "string" && target.includes("%") && "%"}
      {typeof target === "string" && target.includes("+") && "+"}
    </motion.span>
  )
}
