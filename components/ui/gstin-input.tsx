"use client"

import type React from "react"

import { useState } from "react"

interface GSTINInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export function GSTINInput({ value, onChange, error }: GSTINInputProps) {
  const [isValid, setIsValid] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, 15)
    onChange(val)
    setIsValid(GSTIN_PATTERN.test(val))
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold">GSTIN</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="22AAAAA0000A1Z5"
          maxLength={15}
          className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all ${
            error ? "border-black" : value && isValid ? "border-black" : "border-gray-border"
          }`}
        />
        {value && isValid && (
          <svg
            className="absolute right-3 top-3 w-5 h-5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {error && <p className="text-xs text-black">Error: {error}</p>}
    </div>
  )
}
