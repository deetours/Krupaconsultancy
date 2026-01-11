"use client";

import React, { useEffect } from "react";
import { useMotionValue, useTransform } from "framer-motion";

/**
 * Hook to animate counting from one number to another
 * Returns a MotionValue that can be used with motion components or custom rendering
 */
export function useCountUp(
  target: number,
  duration: number = 2,
  delay: number = 0
) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = count;
      let animationFrameId: number;

      const animate = (startValue: number, endValue: number, durationMs: number) => {
        const startTime = Date.now();

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const frame = () => {
          const now = Date.now();
          const progress = Math.min((now - startTime) / durationMs, 1);
          const eased = easeOutCubic(progress);
          const value = startValue + (endValue - startValue) * eased;

          controls.set(value);

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(frame);
          }
        };

        animationFrameId = requestAnimationFrame(frame);
      };

      animate(0, target, duration * 1000);

      return () => cancelAnimationFrame(animationFrameId);
    }, delay);

    return () => clearTimeout(timeout);
  }, [target, duration, delay, count]);

  return rounded;
}

/**
 * Simple number display component for count-up animations
 * Use with Framer Motion's motion.span for animated display
 */
export const CountUpDisplay = React.memo(function CountUpDisplay({
  value,
  className = "",
  prefix = "",
  suffix = "",
}: {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  return React.createElement(
    "span",
    { className },
    prefix,
    Math.round(value),
    suffix
  );
});

CountUpDisplay.displayName = "CountUpDisplay";
