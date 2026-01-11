"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMousePosition, useElementMousePosition } from "@/hooks/use-mouse-position";

/**
 * CursorFollower Component
 * Renders a 20px circle that follows the mouse with spring physics
 * Magnetizes on interactive elements and hides on touch devices
 */
export function CursorFollower() {
  const { x, y, mounted } = useMousePosition();
  const [isTouch, setIsTouch] = React.useState(false);
  const [isOverInteractive, setIsOverInteractive] = React.useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Detect touch devices
  useEffect(() => {
    const isTouchDevice = () => {
      return (
        (typeof window !== "undefined" &&
          ("ontouchstart" in window ||
            (navigator && navigator.maxTouchPoints > 0))) ||
        false
      );
    };

    setIsTouch(isTouchDevice());

    // Listen for touch events
    const handleTouchStart = () => setIsTouch(true);
    const handleMouseMove = () => setIsTouch(false);

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Detect interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target?.tagName === "BUTTON" ||
        target?.tagName === "A" ||
        target?.closest("button") ||
        target?.closest("a") ||
        target?.closest("[role='button']") ||
        target?.classList.contains("interactive");

      setIsOverInteractive(!!isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted || isTouch) {
    return null;
  }

  return (
    <motion.div
      ref={cursorRef}
      className="pointer-events-none fixed z-50"
      style={{
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        className="border border-black rounded-full"
        animate={{
          width: isOverInteractive ? 40 : 20,
          height: isOverInteractive ? 40 : 20,
          backgroundColor: isOverInteractive ? "rgba(0, 0, 0, 0.1)" : "transparent",
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 10,
          },
        }}
      />
    </motion.div>
  );
}
