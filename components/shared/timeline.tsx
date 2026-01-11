"use client"

import { motion } from "framer-motion"
import { useInView } from "@/hooks/use-in-view"

interface TimelineItem {
  year: string
  title: string
  description: string
}

interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
    },
  }

  const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
    },
  }

  const dotVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
    },
  }

  return (
    <motion.div
      ref={ref}
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
          className="flex gap-8"
        >
          {/* Timeline line and dot */}
            <div className="relative w-12 flex flex-col items-center shrink-0">
            {/* Vertical line */}
            {i < items.length - 1 && (
              <motion.div
                className="absolute top-8 left-1/2 w-0.5 h-20 bg-gray-300 -translate-x-1/2 origin-top"
                variants={lineVariants}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}
            {/* Dot */}
            <motion.div
              className="w-3 h-3 rounded-full bg-black shrink-0 relative z-10"
              variants={dotVariants}
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="pt-1 pb-8">
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "13px",
                lineHeight: "20px",
                fontWeight: 500,
                color: "#666666",
              }}
            >
              {item.year}
            </p>
            <h3
              style={{
                fontFamily: "var(--font-crimson)",
                fontSize: "24px",
                lineHeight: "32px",
                fontWeight: 500,
                marginTop: "8px",
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                lineHeight: "24px",
                color: "#666666",
                marginTop: "8px",
              }}
            >
              {item.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
