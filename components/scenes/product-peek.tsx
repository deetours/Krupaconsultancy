"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export const ProductPeek = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section
      ref={ref}
      className="py-24 md:py-32 px-6 bg-[#FDFBF7] overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="font-mono text-[11px] text-gray-400 tracking-[0.2em] uppercase">
            Your dashboard
          </span>
          <h2
            className="mt-4 text-3xl md:text-4xl text-gray-900 font-light"
            style={{ fontFamily: "var(--font-crimson)" }}
          >
            This is what calm looks like.
          </h2>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {/* Browser chrome */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Browser header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
              </div>
              <div className="flex-1 mx-4">
                <div className="w-64 h-6 bg-gray-100 rounded-md mx-auto flex items-center justify-center">
                  <span className="text-[10px] text-gray-400">app.krupa.ai/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6 md:p-8 lg:p-10 bg-linear-to-b from-white to-gray-50/50">
              {/* Top stats row */}
              <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
                {[
                  { label: "GST Payable (Today)", value: "₹42,380", status: "ready" },
                  { label: "ITC Available", value: "₹18,250", status: "matched" },
                  { label: "Pending Invoices", value: "3", status: "action" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="p-4 md:p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                  >
                    <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide mb-2">
                      {stat.label}
                    </p>
                    <p className="text-lg md:text-2xl font-semibold text-gray-800 font-mono">
                      {stat.value}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          stat.status === "ready"
                            ? "bg-emerald-500"
                            : stat.status === "matched"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span className="text-[9px] text-gray-400 uppercase tracking-wide">
                        {stat.status === "ready"
                          ? "Calculated"
                          : stat.status === "matched"
                          ? "All matched"
                          : "Needs review"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Status message */}
              <motion.div
                className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <p className="text-sm text-emerald-700 font-medium">
                  ✓ You're on track for this quarter
                </p>
                <p className="text-xs text-emerald-600/70 mt-1">
                  Next filing deadline: March 20, 2026
                </p>
              </motion.div>
            </div>
          </div>

          {/* Soft glow behind */}
          <div className="absolute -z-10 inset-0 translate-y-8 bg-linear-to-b from-gray-200/50 to-transparent rounded-xl blur-2xl" />
        </motion.div>

        {/* Caption */}
        <motion.p
          className="text-center mt-8 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          Open the app. See where you stand. Close the app.
        </motion.p>
      </div>
    </section>
  );
};

export default ProductPeek;
