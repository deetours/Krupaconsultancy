"use client"

import * as React from "react"
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface AuthSignInFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>
  isLoading?: boolean
  error?: string
}

const AuthSignInForm: React.FC<AuthSignInFormProps> = ({
  onSubmit,
  isLoading = false,
  error = "",
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [localError, setLocalError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!email || !password) {
      setLocalError("Please fill in all fields")
      return
    }

    if (onSubmit) {
      try {
        await onSubmit(email, password)
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Sign in failed")
      }
    }
  }

  const displayError = error || localError

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='rgb(59 130 246 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      ></div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-center mb-8"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">K</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Krupa Consultancy
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              GST Automation Made Simple
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 border border-slate-200 dark:border-slate-800"
          >
            {/* Form title */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Sign in to manage your invoices
              </p>
            </div>

            {/* Error message */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  {displayError}
                </p>
              </motion.div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:focus:ring-offset-slate-900"
                  />
                  <span className="text-slate-600 dark:text-slate-400">
                    Remember me
                  </span>
                </label>
                <Link
                  href="#"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 relative inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 px-6 py-2.5 font-semibold text-white shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Or
              </span>
              <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                Create account
              </Link>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400"
          >
            <p>
              By signing in, you agree to our{" "}
              <Link
                href="#"
                className="hover:text-slate-700 dark:hover:text-slate-300 underline transition-colors"
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="hover:text-slate-700 dark:hover:text-slate-300 underline transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthSignInForm
