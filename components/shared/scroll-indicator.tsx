"use client"

import { motion } from "framer-motion"

export function ScrollIndicator() {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <p className="text-xs text-gray-500 uppercase tracking-wider">Scroll to explore</p>
      <motion.div
        className="w-6 h-10 border-2 border-gray-300 rounded-full flex items-start justify-center p-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="w-1 h-2 bg-gray-400 rounded-full"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  )
}
