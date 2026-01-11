"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";

interface DashboardOverviewProps {
  gsPayable?: string;
  itcAvailable?: string;
  month?: string;
  currentAction?: {
    title: string;
    description?: string;
    actionLabel?: string;
  } | null;
  className?: string;
}

export function DashboardOverview({
  gsPayable = "₹2.4L",
  itcAvailable = "₹1.8L",
  month = "January",
  currentAction = null,
  className = "",
}: DashboardOverviewProps) {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section
      ref={ref}
      className={`min-h-[50vh] flex items-center px-6 md:px-12 py-24 bg-[#FDFBF7] ${className}`}
    >
      <div className="max-w-3xl mx-auto w-full text-center">
        {/* Breathing space */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p
            className="text-lg text-gray-500 leading-relaxed"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Your {month} GST looks good.
          </p>
        </motion.div>

        {/* Key numbers - presented without fanfare */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="space-y-4 mb-12"
        >
          <div>
            <p className="text-sm text-gray-500 mb-1" style={{ fontFamily: "var(--font-inter)" }}>
              Estimated GST payable
            </p>
            <p
              className="text-4xl md:text-5xl font-light text-gray-900"
              style={{ fontFamily: "var(--font-crimson)" }}
            >
              {gsPayable}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1" style={{ fontFamily: "var(--font-inter)" }}>
              ITC available
            </p>
            <p
              className="text-4xl md:text-5xl font-light text-gray-900"
              style={{ fontFamily: "var(--font-crimson)" }}
            >
              {itcAvailable}
            </p>
          </div>
        </motion.div>

        {/* Current action or reassurance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {currentAction ? (
            <div className="space-y-6">
              <p
                className="text-lg md:text-xl text-gray-700"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {currentAction.title}
              </p>
              {currentAction.description && (
                <p className="text-gray-600" style={{ fontFamily: "var(--font-inter)" }}>
                  {currentAction.description}
                </p>
              )}
              {currentAction.actionLabel && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="px-8 py-3 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {currentAction.actionLabel}
                </motion.button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p
                className="text-lg md:text-xl text-gray-700"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                No action needed right now.
              </p>
              <p className="text-gray-600" style={{ fontFamily: "var(--font-inter)" }}>
                We'll email you if something needs your attention.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default DashboardOverview;
