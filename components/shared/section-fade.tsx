"use client"

import type React from "react"
import { motion } from "framer-motion"

import { useInView } from "@/hooks/use-in-view"

interface SectionFadeProps {
  children: React.ReactNode
  delay?: number
  className?: string
  stagger?: boolean
  direction?: "up" | "down" | "left" | "right"
}

export function SectionFade({
  children,
  delay = 0,
  className = "",
  stagger = false,
  direction = "up",
}: SectionFadeProps) {
  const [ref, isVisible] = useInView({ threshold: 0.15, triggerOnce: true })

  const directionMap = {
    up: { y: 16, x: 0 },
    down: { y: -16, x: 0 },
    left: { y: 0, x: 16 },
    right: { y: 0, x: -16 },
  }

  const initial = { ...directionMap[direction], opacity: 0 }
  const animate = { y: 0, x: 0, opacity: 1 }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={isVisible ? animate : initial}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 15,
        delay,
      }}
    >
      {stagger && Array.isArray(children) ? (
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
                delayChildren: delay,
              },
            },
          }}
        >
          {React.Children.map(children, (child) => (
            <motion.div
              variants={{
                hidden: { ...initial },
                visible: animate,
              }}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  )
}
