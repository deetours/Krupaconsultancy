"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { Download } from "lucide-react";

interface FileItem {
  name: string;
  date: string;
  size?: string;
  downloadUrl?: string;
}

interface FilesListProps {
  files?: FileItem[];
  className?: string;
}

const defaultFiles: FileItem[] = [
  {
    name: "GSTR-3B Draft (January)",
    date: "Today",
    size: "2.4 MB",
    downloadUrl: "#",
  },
  {
    name: "Invoice Bundle Q4",
    date: "Jan 10",
    size: "8.1 MB",
    downloadUrl: "#",
  },
  {
    name: "Reconciliation Report",
    date: "Jan 8",
    size: "1.2 MB",
    downloadUrl: "#",
  },
];

export function FilesList({
  files = defaultFiles,
  className = "",
}: FilesListProps) {
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
          Your documents
        </motion.span>

        {/* Files list */}
        <div className="space-y-3">
          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors duration-200"
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-base text-gray-800 font-medium truncate"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {file.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-inter)" }}>
                    {file.date}
                  </p>
                  {file.size && (
                    <>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-inter)" }}>
                        {file.size}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Download button */}
              {file.downloadUrl && (
                <motion.a
                  href={file.downloadUrl}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0 ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <Download size={18} />
                </motion.a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FilesList;
