"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/animation-utils";

/**
 * Hook to get animation variants based on reduced motion preference
 * Returns spring/ease objects or simplified versions if reduced motion is enabled
 */
export function useAnimationVariants() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    setIsReducedMotion(prefersReducedMotion());
  }, []);

  if (isReducedMotion) {
    return {
      // Reduced motion variants (fade-only, no springs)
      fadeInUp: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
      },
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
      },
      scaleUp: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
      },
      slideInRight: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
      },
      slideInLeft: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
      },
      staggerContainer: {
        animate: { transition: { staggerChildren: 0 } },
      },
      magneticHover: {},
      tiltHover: {},
      liftHover: {},
    };
  }

  // Full motion variants
  return {
    fadeInUp: {
      initial: { y: 16, opacity: 0 },
      animate: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" },
      },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.4 } },
    },
    scaleUp: {
      initial: { scale: 0.95, opacity: 0 },
      animate: {
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 120, damping: 12 },
      },
    },
    slideInRight: {
      initial: { x: 100, opacity: 0 },
      animate: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 80, damping: 15 },
      },
    },
    slideInLeft: {
      initial: { x: -100, opacity: 0 },
      animate: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 80, damping: 15 },
      },
    },
    staggerContainer: {
      animate: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
    },
    magneticHover: {
      whileHover: {
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 },
      },
    },
    tiltHover: {
      whileHover: {
        rotateX: -2,
        rotateY: -2,
        transition: { type: "spring", stiffness: 300, damping: 10 },
      },
    },
    liftHover: {
      whileHover: {
        y: -4,
        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
        transition: { type: "spring", stiffness: 300, damping: 10 },
      },
    },
  };
}
