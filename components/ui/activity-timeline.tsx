"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";

interface TimelineItem {
  date: string;
  title: string;
  description?: string;
}

interface ActivityTimelineProps {
  items?: TimelineItem[];
  className?: string;
}

const defaultItems: TimelineItem[] = [
  {
    date: "Today",
    title: "5 invoices processed automatically",
  },
  {
    date: "Jan 10",
    title: "Documents received",
  },
  {
    date: "Jan 8",
    title: "You uploaded Q3 invoices",
  },
];

export function ActivityTimeline({
  items = defaultItems,
  className = "",
}: ActivityTimelineProps) {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className={`px-6 md:px-12 py-20 bg-[#FDFBF7] ${className}`}>
      <div className="max-w-3xl mx-auto">
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="block font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-12"
        >
          What has happened
        </motion.span>

        {/* Timeline */}
        <div className="space-y-6">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="flex gap-6 pb-6 border-b border-gray-200/50 last:border-b-0 last:pb-0"
            >
              {/* Date */}
              <div className="shrink-0 w-20">
                <p
                  className="text-sm font-medium text-gray-500"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {item.date}
                </p>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-base text-gray-800 font-medium"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {item.title}
                </p>
                {item.description && (
                  <p
                    className="text-sm text-gray-600 mt-1"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ActivityTimeline;
