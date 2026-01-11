"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const worries = [
  {
    question: "My invoices are messy images?",
    answer: "We've processed 50,000 of them. Blurry photos, scanned PDFs, WhatsApp forwards — our AI handles it all.",
  },
  {
    question: "GST rules change tomorrow?",
    answer: "We update within 24 hours. Always. Every calculation shows which rule version it uses.",
  },
  {
    question: "My CA wants to verify everything?",
    answer: "They can. Every calculation is explained with source, formula, and timestamp. Nothing is a black box.",
  },
  {
    question: "What if I need to undo something?",
    answer: "Nothing is irreversible. Every action can be reviewed, corrected, or rolled back.",
  },
];

export const CommonWorries = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      className="py-24 md:py-32 px-6 bg-white"
    >
      <div className="max-w-2xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="text-2xl md:text-3xl text-gray-900 font-light"
            style={{ fontFamily: "var(--font-crimson)" }}
          >
            "But what if..."
          </h2>
        </motion.div>

        {/* Worries list */}
        <div className="space-y-1">
          {worries.map((worry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <button
                className="w-full text-left py-5 flex items-start justify-between gap-4 group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="text-base md:text-lg text-gray-700 group-hover:text-gray-900 transition-colors">
                  → {worry.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 mt-1"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pl-6 text-gray-500 leading-relaxed">
                      {worry.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {i < worries.length - 1 && (
                <div className="h-px bg-gray-100" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommonWorries;
