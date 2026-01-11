"use client";

import React from "react";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/use-count-up";

interface ConfidenceBarProps {
  score: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
  duration?: number;
}

/**
 * ConfidenceBar Component
 * Displays a confidence score with spring-animated fill,
 * gradient growing edge, and count-up number animation
 */
export function ConfidenceBar({
  score,
  max = 100,
  className = "",
  showLabel = true,
  animated = true,
  duration = 1,
}: ConfidenceBarProps) {
  const percentage = (score / max) * 100;
  const displayValue = useCountUp(score, duration);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Bar container */}
      <div className="relative h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        {/* Animated fill */}
        <motion.div
          className="h-full bg-black relative"
          animate={{ width: `${percentage}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: animated ? duration : 0,
          }}
        >
          {/* Gradient growing edge effect */}
          <div className="absolute right-0 top-0 h-full w-4 bg-linear-to-r from-black to-black/0" />
        </motion.div>
      </div>

      {/* Label with count-up number */}
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>Confidence</span>
          <motion.span
            key={score}
            className="font-semibold text-gray-900"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span>{displayValue}</motion.span>%
          </motion.span>
        </div>
      )}
    </div>
  );
}
