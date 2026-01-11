"use client"

import { useEffect, useState } from "react"

export function AnimatedLogo() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div
      style={{
        fontFamily: "var(--font-crimson)",
        fontSize: "32px",
        lineHeight: "40px",
        fontWeight: 500,
        opacity: isLoaded ? 1 : 0.95,
        transform: isLoaded ? "scale(1)" : "scale(0.95)",
        transition: "all 600ms ease-out",
      }}
    >
      Krupa
    </div>
  )
}
