"use client";

import { ContactScene } from "@/components/scenes";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Grain texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-50">
        <div className="grain-texture" />
      </div>

      {/* Contact Form Scene */}
      <ContactScene />

      {/* Footer */}
      <footer className="bg-[#FDFBF7] border-t border-gray-200/50 py-12 px-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">
          © 2026 Krupa Consultancy
        </p>
      </footer>
    </main>
  );
}
