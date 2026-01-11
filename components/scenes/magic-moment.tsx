"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Check, FileText, IndianRupee, Building2, Receipt } from "lucide-react";

const extractedData = [
  { label: "GSTIN", value: "27AADCB2230M1Z5", icon: Building2, color: "#2D5A3D" },
  { label: "Invoice Total", value: "₹45,250.00", icon: IndianRupee, color: "#2D5A3D" },
  { label: "CGST (9%)", value: "₹3,645.00", icon: Receipt, color: "#2D5A3D" },
  { label: "SGST (9%)", value: "₹3,645.00", icon: Receipt, color: "#2D5A3D" },
];

export const MagicMoment = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [stage, setStage] = useState(0); // 0: messy, 1: processing, 2: extracted

  useEffect(() => {
    if (isInView) {
      // Auto-progress through stages
      const timer1 = setTimeout(() => setStage(1), 800);
      const timer2 = setTimeout(() => setStage(2), 2200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isInView]);

  return (
    <section
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[#FDFBF7] relative overflow-hidden"
    >
      {/* Section label */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <span className="font-mono text-[11px] text-gray-400 tracking-[0.2em] uppercase">
          The Magic
        </span>
        <h2
          className="mt-4 text-3xl sm:text-4xl md:text-5xl text-gray-900 font-light"
          style={{ fontFamily: "var(--font-crimson)" }}
        >
          Drop any invoice. We handle the rest.
        </h2>
      </motion.div>

      {/* Invoice transformation card */}
      <motion.div
        className="relative w-full max-w-lg mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* The invoice card */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          animate={{
            boxShadow: stage === 2 
              ? "0 25px 50px -12px rgba(45, 90, 61, 0.15)" 
              : "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ duration: 0.6 }}
        >
          {/* Invoice header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Invoice_March_2026.pdf</p>
              <p className="text-xs text-gray-400">Uploaded just now</p>
            </div>
            <AnimatePresence mode="wait">
              {stage === 1 && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-3 py-1 bg-amber-50 rounded-full"
                >
                  <span className="text-xs text-amber-600 font-medium">Processing...</span>
                </motion.div>
              )}
              {stage === 2 && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Invoice content area */}
          <div className="p-6 relative min-h-70">
            {/* Messy invoice preview (blurred) */}
            <motion.div
              className="absolute inset-6 bg-gray-50 rounded-lg overflow-hidden"
              animate={{
                opacity: stage === 0 ? 1 : 0,
                filter: stage === 0 ? "blur(0px)" : "blur(8px)",
              }}
              transition={{ duration: 0.6 }}
            >
              {/* Fake invoice lines */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="mt-6 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-2 bg-gray-200 rounded flex-1" />
                      <div className="h-2 bg-gray-200 rounded w-16" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="h-3 bg-gray-200 rounded w-1/3 ml-auto" />
                </div>
              </div>
            </motion.div>

            {/* Processing animation */}
            <AnimatePresence>
              {stage === 1 && (
                <motion.div
                  className="absolute inset-6 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-16 h-16 border-4 border-gray-200 border-t-emerald-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extracted data (final state) */}
            <AnimatePresence>
              {stage === 2 && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {extractedData.map((item, i) => (
                    <motion.div
                      key={item.label}
                      className="flex items-center gap-4 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.12 }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {item.label}
                        </p>
                        <p className="text-lg font-semibold text-gray-800 font-mono">
                          {item.value}
                        </p>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.12 + 0.3, type: "spring", stiffness: 300 }}
                      >
                        <Check className="w-5 h-5 text-emerald-500" />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Caption below card */}
        <motion.p
          className="text-center mt-8 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={stage === 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Every number extracted. Every rule checked.
          <br />
          <span className="text-gray-400">In under 3 seconds.</span>
        </motion.p>
      </motion.div>

      {/* Replay button */}
      <motion.button
        className="mt-8 px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        onClick={() => setStage(0)}
        initial={{ opacity: 0 }}
        animate={stage === 2 ? { opacity: 1 } : { opacity: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        ↻ Watch again
      </motion.button>
    </section>
  );
};

export default MagicMoment;
