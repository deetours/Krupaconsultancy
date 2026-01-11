"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SystemHealth } from "@/components/ui/system-health";
import { AttentionQueue } from "@/components/ui/attention-queue";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useInView } from "@/hooks/use-in-view";

export default function AdminDashboard() {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    invoiceId: "",
  });
  const [ref, isInView] = useInView({ threshold: 0.3 });

  // Demo data - attention items with why they need review
  const attentionItems = [
    {
      id: "4521",
      title: "Invoice #4521 — Networth Solutions",
      reason: "Low confidence (68%) — Amount doesn't match line items",
      actions: [
        {
          label: "Approve",
          variant: "approve" as const,
          onClick: () =>
            setConfirmDialog({
              isOpen: true,
              invoiceId: "4521",
            }),
        },
        {
          label: "Review",
          variant: "review" as const,
          onClick: () => console.log("Review 4521"),
        },
        {
          label: "Reject",
          variant: "reject" as const,
          onClick: () => console.log("Reject 4521"),
        },
      ],
    },
    {
      id: "4518",
      title: "Invoice #4518 — TechCore India",
      reason:
        "Duplicate suspected — Similar invoice from same vendor on Jan 8",
      actions: [
        {
          label: "Keep Both",
          variant: "approve" as const,
          onClick: () => console.log("Keep both 4518"),
        },
        {
          label: "Remove",
          variant: "reject" as const,
          onClick: () => console.log("Remove 4518"),
        },
        {
          label: "Review",
          variant: "review" as const,
          onClick: () => console.log("Review 4518"),
        },
      ],
    },
    {
      id: "4515",
      title: "Invoice #4515 — Global Supplies",
      reason: "Missing document — No GST certificate attached",
      actions: [
        {
          label: "Request Doc",
          variant: "review" as const,
          onClick: () => console.log("Request 4515"),
        },
        {
          label: "Skip",
          variant: "approve" as const,
          onClick: () => console.log("Skip 4515"),
        },
      ],
    },
  ];

  const handleApprove = () => {
    setConfirmDialog({ isOpen: false, invoiceId: "" });
    // API call here
  };

  return (
    <main className="min-h-screen bg-white">
      {/* System Health - Celebration First */}
      <SystemHealth autoProcessed={156} needsAttention={3} />

      {/* Attention Queue - Only Exceptions */}
      <AttentionQueue items={attentionItems} />

      {/* Recent Success Stats - Secondary Info */}
      <section
        ref={ref}
        className="px-6 md:px-12 py-20 bg-gray-50 border-t border-gray-100"
      >
        <div className="max-w-3xl mx-auto">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="block font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-12"
          >
            System stats
          </motion.span>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                label: "Processing Rate",
                value: "98.2%",
                description: "Invoices auto-processed",
              },
              {
                label: "Average Review Time",
                value: "2.3 min",
                description: "Per exception item",
              },
              {
                label: "Monthly Volume",
                value: "2,140",
                description: "Invoices this month",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="text-center"
              >
                <p
                  className="text-4xl font-light text-gray-900 mb-2"
                  style={{ fontFamily: "var(--font-crimson)" }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-sm font-medium text-gray-700 mb-1"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {stat.label}
                </p>
                <p
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Management Link */}
      <section className="px-6 md:px-12 py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p
              className="text-gray-600 mb-4"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Manage clients
            </p>
            <a
              href="/admin/clients"
              className="inline-block px-8 py-3 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Go to clients page
            </a>
          </motion.div>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Approve this invoice?"
        message="This will mark it as verified and include it in the client's GST return."
        details={[
          "Invoice #4521 will be processed",
          "Client will be notified via email",
          "Amount: ₹45,000 + 18% GST",
        ]}
        confirmLabel="Yes, approve"
        cancelLabel="Cancel"
        onConfirm={handleApprove}
        onCancel={() => setConfirmDialog({ isOpen: false, invoiceId: "" })}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">
          © 2026 Krupa Consultancy — Admin Dashboard
        </p>
      </footer>
    </main>
  );
}
