import type React from "react"
import type { Metadata } from "next"
import { Inter, Crimson_Text, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/layout/navigation"
import { ToastProvider } from "@/components/shared/toast-system"
import { AnimationProvider } from "@/components/providers/AnimationProvider"
import { CursorFollower } from "@/components/ui/CursorFollower"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })
const crimson = Crimson_Text({ subsets: ["latin"], weight: ["400", "600"], display: "swap" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "Krupa Consultancy - GST Automation",
  description: "GST compliance that runs itself. 10x your client capacity. 70% less manual work.",
  metadataBase: new URL("https://krupaconsultancy.com"),
  openGraph: {
    title: "Krupa Consultancy - GST Automation",
    description: "GST compliance that runs itself. 10x your client capacity. 70% less manual work.",
    type: "website",
  },
  robots: "index, follow",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <style>{`
          :root {
            --font-inter: ${inter.style.fontFamily};
            --font-crimson: ${crimson.style.fontFamily};
            --font-jetbrains: ${jetbrains.style.fontFamily};
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <AnimationProvider>
          <Navigation />
          <ToastProvider>{children}</ToastProvider>
          <CursorFollower />
        </AnimationProvider>
        <Analytics />
      </body>
    </html>
  )
}
