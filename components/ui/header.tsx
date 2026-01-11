"use client"

import Link from "next/link"
import { useState } from "react"

interface HeaderProps {
  activeTab?: "upload" | "documents" | "command" | "clients"
}

export function Header({ activeTab }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-gray-border sticky top-0 bg-white z-50">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <Link href="/" className="group">
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-medium tracking-tight group-hover:opacity-70 transition-opacity">
              Krupa
            </span>
            <span className="text-xs font-medium text-gray-500 leading-none">Consultancy</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === "upload" || activeTab === "documents"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Portal
          </Link>
          <Link
            href="/admin"
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === "command" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Command Center
          </Link>
          <Link
            href="/admin/clients"
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === "clients" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Clients
          </Link>
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-gray-border bg-gray-50">
          <div className="px-8 py-4 flex flex-col gap-4">
            <Link href="/" className="text-sm font-medium hover:text-black">
              Portal
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:text-black">
              Command Center
            </Link>
            <Link href="/admin/clients" className="text-sm font-medium hover:text-black">
              Clients
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
