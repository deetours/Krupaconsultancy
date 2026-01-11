"use client"

import { motion } from "framer-motion"
import { useInView } from "@/hooks/use-in-view"

interface CharacterFadeProps {
  text: string
  delay?: number
  staggerDelay?: number
  className?: string
}

export function CharacterFade({
  text,
  delay = 0,
  staggerDelay = 0.02,
  className = "",
}: CharacterFadeProps) {
  const [ref, inView] = useInView({ triggerOnce: true })
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
    hidden: { opacity: 0, y: 4 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <motion.div
      ref={ref}
      className={`inline ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {characters.map((char, idx) => (
        <motion.span
          key={`${char}-${idx}`}
          variants={charVariants}
          className="inline-block"
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  )
}
