"use client"

import type React from "react"

import { useState } from "react"

interface Card3DProps {
  children: React.ReactNode
  className?: string
}

export function Card3D({ children, className = "" }: Card3DProps) {
  const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg)")

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((e.clientY - rect.top - centerY) / centerY) * 2
    const rotateY = -((e.clientX - rect.left - centerX) / centerX) * 2

    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`)
  }

  const handleMouseLeave = () => {
    setTransform("rotateX(0deg) rotateY(0deg)")
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform: transform,
        transition: "transform 150ms ease-out",
        transformStyle: "preserve-3d" as React.CSSProperties["perspective"],
      }}
    >
      {children}
    </div>
  )
}
