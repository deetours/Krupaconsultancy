"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export const GentleExit = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section
      ref={ref}
      className="py-24 md:py-32 px-6 bg-[#FDFBF7]"
    >
      <div className="max-w-xl mx-auto text-center">
        {/* Main message */}
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl text-gray-900 font-light mb-8"
          style={{ fontFamily: "var(--font-crimson)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Ready when you are.
        </motion.h2>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/login">
            <motion.button
              className="px-8 py-4 text-base font-medium text-gray-800 border-2 border-gray-800 rounded-full hover:bg-gray-800 hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Trial
            </motion.button>
          </Link>
        </motion.div>

        {/* Secondary links */}
        <motion.div
          className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <span>or explore:</span>
          <Link href="/about" className="hover:text-gray-600 transition-colors underline underline-offset-4">
            About
          </Link>
          <span className="text-gray-200">·</span>
          <Link href="/contact" className="hover:text-gray-600 transition-colors underline underline-offset-4">
            Contact
          </Link>
        </motion.div>

        {/* Reassurance */}
        <motion.p
          className="mt-12 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          No credit card required · Free for 14 days · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
};

export default GentleExit;
