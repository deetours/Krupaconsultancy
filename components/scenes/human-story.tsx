"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export const HumanStory = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section
      ref={ref}
      className="py-24 md:py-32 px-6 bg-white"
    >
      <div className="max-w-3xl mx-auto">
        {/* Section label */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="font-mono text-[11px] text-gray-400 tracking-[0.2em] uppercase">
            Real story
          </span>
        </motion.div>

        {/* The story card */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Avatar placeholder */}
          <motion.div
            className="mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-8 overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Placeholder initials - replace with real image */}
            <span className="text-2xl md:text-3xl font-light text-gray-400">PS</span>
          </motion.div>

          {/* Quote */}
          <motion.blockquote
            className="text-center"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <p
              className="text-xl md:text-2xl lg:text-3xl text-gray-800 font-light leading-relaxed"
              style={{ fontFamily: "var(--font-crimson)" }}
            >
              "Before Krupa, I spent{" "}
              <span className="text-gray-400 line-through decoration-1">3 weeks</span>{" "}
              every quarter on GST reconciliation.
              <br className="hidden md:block" />
              Now it takes{" "}
              <span className="text-emerald-600 font-medium">3 hours</span>."
            </p>
          </motion.blockquote>

          {/* Attribution */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="text-base font-medium text-gray-800">
              Priya Sharma
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Managing Partner, Sharma & Associates
            </p>
            <p className="font-mono text-[11px] text-gray-400 tracking-wider mt-2">
              200 clients managed
            </p>
          </motion.div>

          {/* Decorative quotes */}
          <div className="absolute -top-4 left-0 md:left-12 text-8xl text-gray-100 font-serif select-none pointer-events-none">
            "
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HumanStory;
