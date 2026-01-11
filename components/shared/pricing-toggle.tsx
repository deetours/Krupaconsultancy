"use client"

import { useState } from "react"

interface PricingToggleProps {
  onToggle: (isAnnual: boolean) => void
}

export function PricingToggle({ onToggle }: PricingToggleProps) {
  const [isAnnual, setIsAnnual] = useState(false)

  const handleToggle = () => {
    setIsAnnual(!isAnnual)
    onToggle(!isAnnual)
  }

  return (
    <button onClick={handleToggle} className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
      <span
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "14px",
          color: !isAnnual ? "#000" : "#666",
        }}
      >
        Monthly
      </span>
      <div className="relative w-12 h-6 bg-black rounded-full transition-all duration-200 flex items-center px-1">
        <div
          className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
          style={{
            transform: isAnnual ? "translateX(24px)" : "translateX(0)",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "14px",
          color: isAnnual ? "#000" : "#666",
        }}
      >
        Annual
      </span>
    </button>
  )
}
