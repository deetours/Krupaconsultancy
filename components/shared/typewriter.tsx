"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface TypewriterProps {
  text: string
  speed?: number
  className?: string
  delay?: number
}

export function Typewriter({ text, speed = 50, className = "", delay = 0 }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    if (displayedText.length >= text.length) return

    const timeout = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1))
    }, speed)

    return () => clearTimeout(timeout)
  }, [displayedText, text, speed])

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {displayedText}
      {displayedText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-5 bg-black ml-1"
        />
      )}
    </motion.div>
  )
}
