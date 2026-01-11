"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: "default" | "danger";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  details,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/30 z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg max-w-md w-full mx-4 z-50 p-6"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>

            {/* Content */}
            <div className="space-y-4">
              {/* Title */}
              <h2
                className="text-lg font-medium text-gray-900"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {title}
              </h2>

              {/* Message */}
              <p
                className="text-gray-700"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {message}
              </p>

              {/* Details */}
              {details && details.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-50 border border-gray-200 rounded p-4 space-y-2"
                >
                  {details.map((detail, idx) => (
                    <p
                      key={idx}
                      className="text-sm text-gray-600 flex items-start gap-2"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{detail}</span>
                    </p>
                  ))}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-800 font-medium hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {cancelLabel}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 rounded font-medium transition-all duration-200 text-white ${
                    variant === "danger"
                      ? "bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      : "bg-gray-800 hover:bg-gray-900 disabled:opacity-50"
                  }`}
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {isLoading ? "Processing..." : confirmLabel}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
