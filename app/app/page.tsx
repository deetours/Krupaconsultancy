"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { DashboardOverview } from "@/components/ui/dashboard-overview";
import { ActivityTimeline } from "@/components/ui/activity-timeline";
import { FilesList } from "@/components/ui/files-list";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import { useInView } from "@/hooks/use-in-view";
import { useClientDashboard } from "@/hooks/use-api";
import { useFileUpload } from "@/hooks/use-file-upload";

export default function ClientPortal() {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [ref, isInView] = useInView({ threshold: 0.3 });
  const { data: dashboardData, loading } = useClientDashboard();
  const { upload, uploading, progress } = useFileUpload({
    bucket: "invoices",
    onSuccess: () => {
      setShowUpload(false);
    },
  });

  // Check authentication
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    }
  }, [router]);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    
    // Upload first file for now
    const file = files[0];
    await upload(file);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-gray-300 border-t-black rounded-full mx-auto mb-4"
          />
          <p style={{ fontFamily: "var(--font-inter)", color: "#666" }}>
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  // Default values if no data
  const totalClients = dashboardData?.totalClients || 0;
  const activeClients = dashboardData?.activeClients || 0;
  const recentInvoices = dashboardData?.recentInvoices || [];

  // Format timeline items from invoices
  const timelineItems = recentInvoices.slice(0, 5).map((invoice: any) => ({
    date: new Date(invoice.created_at).toLocaleDateString(),
    title: `Invoice ${invoice.invoice_number || "uploaded"} - ${invoice.vendor_name || "Vendor"}`,
  })) || [
    { date: "Today", title: "Waiting for your first upload" },
  ];

  // Format file items
  const fileItems = recentInvoices.slice(0, 5).map((invoice: any) => ({
    name: invoice.file_name,
    date: new Date(invoice.created_at).toLocaleDateString(),
    size: invoice.file_size ? `${(invoice.file_size / 1024 / 1024).toFixed(1)} MB` : "Unknown",
    status: invoice.status,
    confidence: invoice.confidence_score ? `${(invoice.confidence_score * 100).toFixed(0)}%` : "Pending",
  })) || [];

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Grain texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-50">
        <div className="grain-texture" />
      </div>

      {/* Scene 1: Dashboard Overview - Status + Action */}
      <DashboardOverview
        gsPayable={`₹${(dashboardData?.recentInvoices?.reduce((sum: number, inv: any) => sum + (inv.gst_amount || 0), 0) / 100000).toFixed(1)}L` || "₹0"}
        itcAvailable={`${activeClients} active`}
        month={new Date().toLocaleDateString("en-US", { month: "long" })}
        currentAction={
          uploading
            ? {
                title: `Uploading... ${Math.round(progress)}%`,
                description: "Your file is being processed.",
                actionLabel: "Processing",
              }
            : {
                title: "Ready to upload invoices?",
                description: "Drop them here or upload from your computer.",
                actionLabel: "Start upload",
              }
        }
      />

      {/* Scene 2: Upload Section (Secondary, On-Demand) */}
      <section
        ref={ref}
        className={`px-6 md:px-12 py-16 bg-[#FDFBF7] transition-all duration-300 ${
          showUpload ? "opacity-100" : "opacity-75"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {showUpload && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-12"
              >
                <span
                  className="block font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-6"
                >
                  Upload invoices
                </span>
                <FileUploadZone onFilesSelected={handleFilesSelected} />
              </motion.div>
            )}
          </AnimatePresence>

          {!showUpload && uploadedFiles.length === 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowUpload(true)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Show upload
            </motion.button>
          )}
        </div>
      </section>

      {/* Scene 3: Activity Timeline */}
      <ActivityTimeline items={timelineItems} />

      {/* Scene 4: Files List */}
      <FilesList files={fileItems} />

      {/* Footer */}
      <footer className="bg-[#FDFBF7] border-t border-gray-200/50 py-12 px-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">
          © 2026 Krupa Consultancy
        </p>
      </footer>
    </main>
  );
}
