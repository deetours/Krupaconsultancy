"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  lines?: number;
  height?: string;
  className?: string;
  animated?: boolean;
}

/**
 * LoadingSkeleton Component
 * Displays animated skeleton lines with shimmer and breathing scale
 */
export function LoadingSkeleton({
  lines = 3,
  height = "h-4",
  className = "",
  animated = true,
}: LoadingSkeletonProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className={`${height} bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-full`}
          animate={
            animated
              ? {
                  scale: [0.98, 1.02, 0.98],
                  backgroundPosition: ["200% 0", "-200% 0"],
                }
              : {}
          }
          transition={
            animated
              ? {
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  backgroundPosition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }
              : {}
          }
          style={{
            backgroundSize: "200% 100%",
            width: `${80 + Math.random() * 15}%`,
          }}
        />
      ))}
    </div>
  );
}
