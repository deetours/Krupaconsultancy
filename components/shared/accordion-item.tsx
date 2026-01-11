"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface AccordionItemProps {
  question: string
  answer: string
}

export function AccordionItem({ question, answer }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 py-6">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between gap-4 text-left hover:bg-gray-50 -mx-3 px-3 py-2 rounded transition-colors">
        <h3
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "18px",
            lineHeight: "28px",
            fontWeight: 500,
          }}
        >
          {question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          overflow: "hidden",
          marginTop: isOpen ? "16px" : "0px",
        }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ delay: isOpen ? 0.1 : 0, duration: 0.3 }}
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "15px",
            lineHeight: "24px",
            color: "#666666",
          }}
        >
          {answer}
        </motion.p>
      </motion.div>
    </div>
  )
}
