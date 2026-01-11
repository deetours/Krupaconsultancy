"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AttentionItem {
  id: string;
  title: string;
  reason: string;
  actions: {
    label: string;
    variant?: "approve" | "review" | "reject";
    onClick?: () => void;
  }[];
}

interface AttentionQueueProps {
  items?: AttentionItem[];
  className?: string;
}

const defaultItems: AttentionItem[] = [
  {
    id: "1",
    title: "Invoice #4521",
    reason: "Low confidence (68%) — Amount doesn't match line items",
    actions: [
      { label: "Approve", variant: "approve" },
      { label: "Review", variant: "review" },
      { label: "Reject", variant: "reject" },
    ],
  },
  {
    id: "2",
    title: "Invoice #4518",
    reason: "Duplicate suspected — Similar invoice from same vendor on Jan 8",
    actions: [
      { label: "Keep Both", variant: "approve" },
      { label: "Remove", variant: "reject" },
      { label: "Review", variant: "review" },
    ],
  },
  {
    id: "3",
    title: "Invoice #4515",
    reason: "Missing document — No GST certificate attached",
    actions: [
      { label: "Request", variant: "review" },
      { label: "Skip", variant: "approve" },
    ],
  },
];

export function AttentionQueue({
  items = defaultItems,
  className = "",
}: AttentionQueueProps) {
  const [ref, isInView] = useInView({ threshold: 0.2 });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getButtonStyle = (variant?: string) => {
    switch (variant) {
      case "approve":
        return "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300";
      case "reject":
        return "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300";
      case "review":
        return "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300";
    }
  };

  return (
    <section
      ref={ref}
      className={`px-6 md:px-12 py-20 bg-white border-t border-gray-100 ${className}`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="block font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-12"
        >
          Needs your attention
        </motion.span>

        {/* Items */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full p-4 hover:bg-gray-50 transition-colors duration-200 flex items-start justify-between gap-4"
              >
                <div className="text-left flex-1">
                  <p
                    className="font-medium text-gray-900"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-sm text-gray-600 mt-1"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {item.reason}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 mt-0.5"
                >
                  <ChevronDown size={18} className="text-gray-400" />
                </motion.div>
              </button>

              {/* Actions (Expanded) */}
              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200 bg-gray-50/50 px-4 py-4"
                  >
                    <div className="flex flex-wrap gap-2">
                      {item.actions.map((action, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={action.onClick}
                          className={`px-4 py-2 border rounded text-sm font-medium transition-all duration-200 ${getButtonStyle(
                            action.variant
                          )}`}
                          style={{ fontFamily: "var(--font-inter)" }}
                        >
                          {action.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <p
              className="text-gray-600"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Everything looks good. No items need attention.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default AttentionQueue;
