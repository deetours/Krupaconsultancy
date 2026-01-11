"use client"

import { type ReactNode, createContext, useContext, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString()
    const newToast = { id, type, message }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: index * 0.05,
              }}
              className="flex items-center gap-3 px-4 py-3 bg-black text-white rounded-lg shadow-lg pointer-events-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {toast.type === "success" && <Check size={20} />}
                {toast.type === "error" && <AlertCircle size={20} />}
                {toast.type === "info" && <Info size={20} />}
              </motion.div>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "14px",
                }}
              >
                {toast.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
