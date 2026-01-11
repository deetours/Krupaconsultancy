"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Login", href: "/login" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "translate-y-0" : "translate-y-0"
      } ${isScrolled ? "shadow-sm" : ""}`}
      style={{
        backgroundColor: "white",
        height: "72px",
        borderBottom: "1px solid #E5E5E5",
      }}
    >
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col gap-0">
          <div style={{ fontFamily: "var(--font-crimson)", fontSize: "24px", lineHeight: "32px", fontWeight: 500 }}>
            Krupa
          </div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", lineHeight: "20px", fontWeight: 400 }}>
            Consultancy
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative transition-colors duration-150"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                lineHeight: "24px",
                fontWeight: 500,
                color: isActive(item.href) ? "#000" : "#666666",
              }}
            >
              {item.label}
              {isActive(item.href) && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" style={{ height: "2px" }} />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed top-72px left-0 right-0 bg-white border-b border-gray-200 transition-all duration-300"
          style={{
            animation: "slideDown 300ms ease-out",
          }}
        >
          <div className="flex flex-col px-8 py-6 gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors duration-150"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "15px",
                  lineHeight: "24px",
                  fontWeight: 500,
                  color: isActive(item.href) ? "#000" : "#666666",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
