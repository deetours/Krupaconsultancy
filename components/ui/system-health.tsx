"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";

interface SystemHealthProps {
  autoProcessed?: number;
  needsAttention?: number;
  className?: string;
}

export function SystemHealth({
  autoProcessed = 156,
  needsAttention = 3,
  className = "",
}: SystemHealthProps) {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section
      ref={ref}
      className={`min-h-[50vh] flex items-center px-6 md:px-12 py-24 bg-white ${className}`}
    >
      <div className="max-w-3xl mx-auto w-full text-center">
        {/* Celebration first */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8 }}
        >
          <p
            className="text-lg text-gray-600 mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            This week
          </p>
          <div className="space-y-6">
            <div>
              <p
                className="text-6xl md:text-7xl font-light text-gray-900 mb-2"
                style={{ fontFamily: "var(--font-crimson)" }}
              >
                {autoProcessed}
              </p>
              <p
                className="text-lg text-gray-600"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                invoices processed automatically
              </p>
            </div>
          </div>
        </motion.div>

        {/* Attention items as secondary info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 pt-16 border-t border-gray-200"
        >
          <p
            className="text-base text-gray-600 mb-3"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {needsAttention} {needsAttention === 1 ? "item" : "items"} need your attention
          </p>
          <p
            className="text-sm text-gray-500"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            (Scroll down to review)
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default SystemHealth;
