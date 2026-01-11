"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";

const words = [
  { text: "We read your invoices.", delay: 0 },
  { text: "We do the math.", delay: 0.8 },
  { text: "You stay compliant.", delay: 1.6 },
];

export const ReassuranceBlock = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section 
      ref={ref}
      className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 bg-white relative"
    >
      {/* The three reassuring statements */}
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {words.map((word, i) => (
          <motion.p
            key={i}
            className="text-2xl sm:text-3xl md:text-4xl text-gray-800 font-light leading-relaxed"
            style={{ fontFamily: "var(--font-inter)" }}
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: word.delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {word.text}
          </motion.p>
        ))}
      </div>

      {/* Decorative line */}
      <motion.div
        className="mt-16 w-px h-16 bg-linear-to-b from-gray-200 to-transparent"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={isInView ? { scaleY: 1, opacity: 1 } : {}}
        transition={{ duration: 1, delay: 2.5, ease: "easeOut" }}
        style={{ transformOrigin: "top" }}
      />

      {/* Continue prompt */}
      <motion.div
        className="mt-6 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 3 }}
      >
        <span className="text-sm text-gray-400 font-light">
          See how it works
        </span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-gray-300" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ReassuranceBlock;
