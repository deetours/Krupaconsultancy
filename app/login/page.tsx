"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { SectionFade } from "@/components/shared/section-fade"
import { ButtonLoading } from "@/components/shared/button-loading"
import { SplitText } from "@/components/shared/split-text"
import { useLogin } from "@/hooks/use-api"

export default function LoginPage() {
  const router = useRouter()
  const { mutate: login, loading: isLoading, error } = useLogin()
  
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [localError, setLocalError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!email || !password) {
      setLocalError("Please fill in all fields")
      return
    }

    try {
      const result = await login({ email, password })
      if (result) {
        // Redirect to dashboard
        router.push("/app")
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.05,
          backgroundImage:
            "linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)",
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />

      <SectionFade>
        <div
          className="w-full max-w-sm bg-white border border-gray-200 rounded-lg"
          style={{
            width: "420px",
          }}
        >
          {/* Header */}
          <motion.div
            className="px-8 py-12 border-b border-gray-200 text-center space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SplitText
              text="Krupa"
              style={{
                fontFamily: "var(--font-crimson)",
                fontSize: "32px",
                lineHeight: "40px",
              }}
              delay={0.1}
            />
            <motion.p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                lineHeight: "24px",
                color: "#666666",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              GST automation for CAs
            </motion.p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {/* Error message */}
            {(localError || error) && (
              <motion.div
                className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{localError || error}</span>
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "13px",
                  lineHeight: "20px",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-black transition-colors"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "13px",
                  lineHeight: "20px",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded focus:outline-none focus:border-black transition-colors"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    key={showPassword ? "open" : "closed"}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 45 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.div>
                </motion.button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a
                href="#"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "13px",
                  color: "#666666",
                  textDecoration: "underline",
                }}
                className="hover:text-black transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <ButtonLoading isLoading={isLoading} className="w-full">
              Sign In
            </ButtonLoading>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "13px",
                  color: "#999999",
                }}
              >
                OR
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded hover:border-gray-400 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C39.662 37.852 44 30.823 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Continue with Google
              </span>
            </button>
          </form>

          {/* Footer */}
          <div
            className="px-8 py-6 border-t border-gray-200 text-center"
            style={{
              backgroundColor: "#fafafa",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "13px",
                color: "#666666",
              }}
            >
              New to Krupa?{" "}
              <a
                href="/"
                style={{
                  fontFamily: "var(--font-crimson)",
                  fontSize: "16px",
                  fontWeight: 500,
                  textDecoration: "underline",
                }}
                className="hover:text-black transition-colors"
              >
                Start free trial
              </a>
            </span>
          </div>
        </div>
      </SectionFade>
    </main>
  )
}
