"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const ArrivalScene = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none grain-texture" />
      
      {/* Soft gradient orb in background */}
      <motion.div
        className="absolute w-200 h-200 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #E8DFD0 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 3, ease: "easeOut" }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Small trust badge */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="relative w-2 h-2 bg-emerald-500 rounded-full">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-40" />
          </div>
          <span className="font-mono text-[11px] text-gray-400 tracking-[0.2em] uppercase">
            Trusted by 1,200+ businesses
          </span>
        </motion.div>

        {/* Main headline - calm, reassuring */}
        <motion.h1
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-tight tracking-tight"
          style={{ fontFamily: "var(--font-crimson)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
        >
          Your GST,
          <br />
          <span className="relative inline-block">
            without stress
            {/* Breathing dot animation */}
            <motion.span
              className="inline-block text-emerald-600 ml-1"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              .
            </motion.span>
          </span>
        </motion.h1>

        {/* Subtle subtext - appears later */}
        <motion.p
          className="mt-8 text-lg md:text-xl text-gray-500 font-light max-w-md mx-auto"
          style={{ fontFamily: "var(--font-inter)" }}
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1.5, delay: 1.8 }}
        >
          Compliance that runs itself.
        </motion.p>
      </div>

      {/* Scroll indicator - very subtle */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 3 }}
      >
        <span className="font-mono text-[10px] text-gray-300 tracking-widest uppercase">
          Scroll slowly
        </span>
        <motion.div
          className="w-px h-8 bg-linear-to-b from-gray-300 to-transparent"
          animate={{ scaleY: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
};

export default ArrivalScene;
