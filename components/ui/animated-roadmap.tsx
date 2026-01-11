"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

// Define the type for a single milestone
interface Milestone {
  id: number
  name: string
  status: "complete" | "in-progress" | "pending"
  position: {
    top?: string
    left?: string
    right?: string
    bottom?: string
  }
}

// Define the props for the AnimatedRoadmap component
interface AnimatedRoadmapProps extends React.HTMLAttributes<HTMLDivElement> {
  milestones: Milestone[]
  mapImageSrc: string
}

// Sub-component for a single milestone marker
const MilestoneMarker = ({ milestone }: { milestone: Milestone }) => {
  const statusClasses = {
    complete: "bg-green-500 border-green-700",
    "in-progress": "bg-blue-500 border-blue-700 animate-pulse",
    pending: "bg-gray-300 border-gray-400",
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: milestone.id * 0.15, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.8 }}
      className="absolute flex items-center gap-4"
      style={milestone.position}
    >
      <div className="relative flex h-8 w-8 items-center justify-center">
        <div
          className={cn(
            "absolute h-3 w-3 rounded-full border-2",
            statusClasses[milestone.status]
          )}
        />
        <div className="absolute h-full w-full rounded-full bg-black/5" />
      </div>
      <motion.div
        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:shadow-md transition-shadow"
        whileHover={{ scale: 1.05 }}
      >
        {milestone.name}
      </motion.div>
    </motion.div>
  )
}

// Main AnimatedRoadmap component
const AnimatedRoadmap = React.forwardRef<HTMLDivElement, AnimatedRoadmapProps>(
  ({ className, milestones, mapImageSrc, ...props }, ref) => {
    const targetRef = React.useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
      target: targetRef,
      offset: ["start end", "end start"],
    })

    // Animate the path drawing based on scroll progress
    const pathLength = useTransform(scrollYProgress, [0.15, 0.7], [0, 1])

    return (
      <div
        ref={targetRef}
        className={cn("relative w-full max-w-6xl mx-auto py-24 px-8", className)}
        {...props}
      >
        {/* Background map image */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="absolute inset-0 top-10 pointer-events-none"
        >
          <img
            src={mapImageSrc}
            alt="Product roadmap background"
            className="h-full w-full object-cover opacity-20 rounded-lg"
          />
        </motion.div>

        {/* SVG path for animation */}
        <div className="relative h-96 md:h-125">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid slice"
            className="absolute top-0 left-0"
          >
            <motion.path
              d="M 50 350 Q 200 50 400 200 T 750 100"
              fill="none"
              stroke="hsl(0 0% 0%)"
              strokeWidth="3"
              strokeDasharray="10 5"
              strokeLinecap="round"
              style={{ pathLength }}
              opacity={0.3}
            />
          </svg>

          {/* Render each milestone */}
          {milestones.map((milestone) => (
            <MilestoneMarker key={milestone.id} milestone={milestone} />
          ))}
        </div>
      </div>
    )
  }
)

AnimatedRoadmap.displayName = "AnimatedRoadmap"

export { AnimatedRoadmap }
