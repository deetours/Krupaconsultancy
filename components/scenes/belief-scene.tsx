"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";

interface Belief {
  statement: string;
}

interface BeliefSceneProps {
  beliefs?: Belief[];
  className?: string;
}

const defaultBeliefs: Belief[] = [
  { statement: "GST compliance shouldn't require expertise in GST." },
  { statement: "A CA's value is in judgment, not data entry." },
  { statement: "Software should explain itself, not hide behind 'AI magic'." },
];

export function BeliefScene({ 
  beliefs = defaultBeliefs,
  className = "" 
}: BeliefSceneProps) {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className={`min-h-[70vh] flex items-center justify-center px-6 md:px-12 py-24 md:py-32 bg-[#FDFBF7] ${className}`}
    >
      <div className="max-w-3xl w-full">
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="block text-center font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-16"
        >
          What we believe
        </motion.span>

        {/* Beliefs */}
        <div className="space-y-12 md:space-y-16">
          {beliefs.map((belief, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.8,
                delay: 0.3 + index * 0.4,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-center"
            >
              <p
                className="text-xl md:text-2xl lg:text-3xl leading-relaxed text-gray-800"
                style={{ fontFamily: "var(--font-crimson)" }}
              >
                "{belief.statement}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BeliefScene;
