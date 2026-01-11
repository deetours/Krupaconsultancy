"use client"

import type React from "react"
import { motion } from "framer-motion"

interface ButtonLoadingProps {
  isLoading?: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function ButtonLoading({
  isLoading = false,
  disabled = false,
  children,
  className = "",
  onClick,
}: ButtonLoadingProps) {
  return (
    <button
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`px-8 py-3 bg-black text-white rounded font-medium transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        fontFamily: "var(--font-inter)",
        fontSize: "16px",
        lineHeight: "24px",
      }}
    >
      {isLoading ? (
        <div className="flex items-center gap-1">
          <span>Sending</span>
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          >
            .
          </motion.span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
