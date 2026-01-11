"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const proofPoints = [
  "Used by 1,200+ Indian businesses",
  "Last GST update: January 2026",
  "CA-reviewed calculations",
];

export const QuietProof = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 px-6 bg-[#FDFBF7]"
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Quiet, confident statements */}
        <div className="space-y-6">
          {proofPoints.map((point, i) => (
            <motion.p
              key={i}
              className="font-mono text-[11px] md:text-xs text-gray-400 tracking-[0.25em] uppercase"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: i * 0.3 }}
            >
              {point}
            </motion.p>
          ))}
        </div>

        {/* Subtle divider */}
        <motion.div
          className="mt-12 mx-auto w-12 h-px bg-gray-200"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        />
      </div>
    </section>
  );
};

export default QuietProof;
