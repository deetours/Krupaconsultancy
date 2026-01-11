"use client"

import Link from "next/link"
import {
  ArrivalScene,
  ReassuranceBlock,
  MagicMoment,
  ThreeTruths,
  QuietProof,
  HumanStory,
  ProductPeek,
  CommonWorries,
  GentleExit,
} from "@/components/scenes"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Scene 1: Arrival - Calm + Control */}
      <ArrivalScene />

      {/* Scene 2: Pause - Safety + Clarity */}
      <ReassuranceBlock />

      {/* Scene 3: The Reveal - First Magic Moment */}
      <MagicMoment />

      {/* Scene 4: The Three Truths */}
      <ThreeTruths />

      {/* Scene 5: Quiet Proof - Trust without trying */}
      <QuietProof />

      {/* Scene 6: Human Story - Single powerful testimonial */}
      <HumanStory />

      {/* Scene 7: Product Peek - Dashboard preview */}
      <ProductPeek />

      {/* Scene 8: Common Worries - Soft FAQ */}
      <CommonWorries />

      {/* Scene 9: Gentle Exit - Soft CTA */}
      <GentleExit />

      {/* Footer - Minimal */}
      <footer className="py-12 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <p className="text-sm text-gray-400">
            © 2026 Krupa Consultancy
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-600 transition-colors">
              Terms
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-gray-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-gray-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
