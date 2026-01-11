"use client"

import { motion } from "framer-motion"

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
}

export function SplitText({ text, className = "", delay = 0, staggerDelay = 0.03 }: SplitTextProps) {
  const characters = text.split("")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  }

  const charVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <motion.div
      className={`inline ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {characters.map((char, idx) => (
        <motion.span
          key={`${char}-${idx}`}
          variants={charVariants}
          className="inline-block"
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 12,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  )
}
