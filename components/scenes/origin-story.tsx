"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { User } from "lucide-react";

interface OriginStoryProps {
  headline?: string;
  paragraphs?: string[];
  founderName?: string;
  founderRole?: string;
  founderImage?: string;
  className?: string;
}

const defaultParagraphs = [
  "It was March 2022. 2 AM. I was manually reconciling 200 invoices for a client's GSTR-3B. My third coffee had gone cold. My eyes were burning. And I kept thinking — there has to be a better way.",
  "I'd spent 8 years becoming a tax expert. But most of my time went to data entry, not strategy. Not the work that actually helped clients.",
  "The next morning, I started building what would become Krupa. Not to replace CAs — but to give them their time back.",
];

export function OriginStory({
  headline = "A midnight filing that changed everything",
  paragraphs = defaultParagraphs,
  founderName = "Pavan Mishra",
  founderRole = "Founder & CEO",
  founderImage,
  className = "",
}: OriginStoryProps) {
  const [ref, isInView] = useInView({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className={`min-h-[80vh] flex items-center px-6 md:px-12 py-24 md:py-32 bg-[#FDFBF7] ${className}`}
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="block font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-8"
        >
          The beginning
        </motion.span>

        <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-16 items-start">
          {/* Founder Photo/Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center md:items-start"
          >
            <div className="relative">
              {founderImage ? (
                <img
                  src={founderImage}
                  alt={founderName}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {/* Subtle ring animation */}
              <div className="absolute inset-0 rounded-full border border-gray-200 animate-pulse opacity-50" />
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 text-center md:text-left"
            >
              <p className="font-medium text-gray-900">{founderName}</p>
              <p className="text-sm text-gray-500 mt-1">{founderRole}</p>
            </motion.div>
          </motion.div>

          {/* Story Content */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-10 leading-tight"
              style={{ fontFamily: "var(--font-crimson)" }}
            >
              {headline}
            </motion.h2>

            <div className="space-y-6">
              {paragraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.3 + index * 0.2,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="text-lg md:text-xl leading-relaxed text-gray-600"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OriginStory;
