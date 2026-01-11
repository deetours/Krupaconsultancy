import type React from "react"
import type { ReactNode } from "react"

interface FormFieldProps {
  label: string
  id: string
  error?: string
  icon?: ReactNode
  children: React.ReactNode
}

export function FormField({ label, id, error, icon, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "13px",
          lineHeight: "20px",
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
        {children}
      </div>
      {error && (
        <span
          className="text-red-600 text-xs"
          style={{
            fontFamily: "var(--font-inter)",
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
