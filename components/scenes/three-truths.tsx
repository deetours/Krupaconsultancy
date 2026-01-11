"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Brain, CheckCircle } from "lucide-react";

const truths = [
  {
    icon: Upload,
    number: "01",
    text: "Drop your invoices. Any format.",
    subtext: "PDFs, images, Excel, WhatsApp forwards",
  },
  {
    icon: Brain,
    number: "02",
    text: "We extract every number. Every rule checked.",
    subtext: "GSTIN validation, tax calculations, ITC matching",
  },
  {
    icon: CheckCircle,
    number: "03",
    text: "Your CA gets a clean file. You get peace.",
    subtext: "GSTR-1 ready, 3B auto-populated, exportable",
  },
];

export const ThreeTruths = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section
      ref={ref}
      className="py-24 md:py-32 px-6 bg-white"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="font-mono text-[11px] text-gray-400 tracking-[0.2em] uppercase">
            How it works
          </span>
          <h2
            className="mt-4 text-3xl md:text-4xl text-gray-900 font-light"
            style={{ fontFamily: "var(--font-crimson)" }}
          >
            Three steps. Zero confusion.
          </h2>
        </motion.div>

        {/* The three truths */}
        <div className="space-y-12 md:space-y-16">
          {truths.map((truth, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-6 md:gap-8"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.2 }}
            >
              {/* Number + Icon */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                <span className="font-mono text-[10px] text-gray-300 tracking-widest">
                  {truth.number}
                </span>
                <motion.div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-50 flex items-center justify-center"
                  whileHover={{ scale: 1.05, backgroundColor: "#F0FDF4" }}
                  transition={{ duration: 0.3 }}
                >
                  <truth.icon className="w-6 h-6 md:w-7 md:h-7 text-gray-600" />
                </motion.div>
              </div>

              {/* Text content */}
              <div className="pt-6">
                <h3
                  className="text-xl md:text-2xl lg:text-3xl text-gray-800 font-light leading-snug"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {truth.text}
                </h3>
                <p className="mt-2 text-sm md:text-base text-gray-400">
                  {truth.subtext}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connecting line (desktop only) */}
        <motion.div
          className="hidden md:block absolute left-18 top-45 w-px bg-linear-to-b from-gray-100 via-gray-200 to-gray-100"
          style={{ height: "calc(100% - 360px)" }}
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.5 }}
        />
      </div>
    </section>
  );
};

export default ThreeTruths;
