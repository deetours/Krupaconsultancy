"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import {
  BeliefScene,
  OriginStory,
} from "@/components/scenes";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Grain texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-50">
        <div className="grain-texture" />
      </div>

      {/* Scene 1: Arrival - Tone Setter */}
      <AboutArrival />

      {/* Scene 2: Belief - What We Stand For */}
      <BeliefScene />

      {/* Scene 3: Perspective - Origin Story */}
      <OriginStory />

      {/* Scene 4: Proof of Character */}
      <CharacterProof />

      {/* Scene 5: Invitation - Human CTA */}
      <AboutInvitation />

      {/* Simple Footer */}
      <footer className="bg-[#FDFBF7] border-t border-gray-200/50 py-12 px-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">
          © 2026 Krupa Consultancy
        </p>
      </footer>
    </main>
  );
}

// Scene 1: About-specific Arrival
function AboutArrival() {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section
      ref={ref}
      className="min-h-[80vh] flex flex-col items-center justify-center px-6 md:px-12 py-24 relative"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Breathing dot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex justify-center mb-12"
        >
          <div className="relative">
            <div className="w-2 h-2 bg-gray-800 rounded-full" />
            <div className="absolute inset-0 w-2 h-2 bg-gray-800 rounded-full animate-ping opacity-20" />
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-8 leading-tight"
          style={{ fontFamily: "var(--font-crimson)" }}
        >
          We build tools for CAs who care.
        </motion.h1>

        {/* Supporting line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Not to replace your judgment. To free your time.
        </motion.p>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-gray-400"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Scene 4: Character Proof - Single powerful quote about working relationship
function CharacterProof() {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section
      ref={ref}
      className="min-h-[60vh] flex items-center justify-center px-6 md:px-12 py-24 md:py-32 bg-[#FDFBF7]"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="block font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-12"
        >
          What it's like to work with us
        </motion.span>

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-10"
        >
          <p
            className="text-xl md:text-2xl lg:text-3xl text-gray-800 leading-relaxed"
            style={{ fontFamily: "var(--font-crimson)" }}
          >
            "What surprised me wasn't the automation. It was how they handled our weird edge cases. They'd call and actually listen."
          </p>
        </motion.blockquote>

        {/* Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-1"
        >
          <p className="font-medium text-gray-700">Priya Sharma</p>
          <p className="text-sm text-gray-500">Managing Partner, Sharma & Associates</p>
          <p className="text-xs text-gray-400 mt-2">Working with Krupa since 2023</p>
        </motion.div>

        {/* Subtle proof line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400"
        >
          Most of our work comes from referrals
        </motion.p>
      </div>
    </section>
  );
}

// Scene 5: About-specific Invitation
function AboutInvitation() {
  const [ref, isInView] = useInView({ threshold: 0.3 });

  return (
    <section
      ref={ref}
      className="min-h-[50vh] flex items-center justify-center px-6 md:px-12 py-24 md:py-32 bg-[#FDFBF7]"
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Main message */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl text-gray-900 mb-10"
          style={{ fontFamily: "var(--font-crimson)" }}
        >
          If this resonates, let's talk.
        </motion.h2>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 border border-gray-300 rounded-full text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Book a conversation
          </motion.button>
        </motion.div>

        {/* Secondary option */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-sm text-gray-500"
        >
          or write to us:{" "}
          <a
            href="mailto:hello@krupa.ai"
            className="text-gray-700 hover:text-gray-900 underline underline-offset-2 transition-colors"
          >
            hello@krupa.ai
          </a>
        </motion.p>
      </div>
    </section>
  );
}
