"use client"

import type React from "react"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface CopyButtonProps {
  text: string
  children?: React.ReactNode
}

export function CopyButton({ text, children }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded hover:border-gray-400 transition-colors"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {children || (copied ? "Copied!" : "Copy")}
      </button>
      {copied && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap"
          style={{
            animation: "slideDown 200ms ease-out",
          }}
        >
          Copied!
        </div>
      )}
    </div>
  )
}
