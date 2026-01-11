"use client"

import { useRouter } from "next/navigation"
import { useLogin } from "@/hooks/use-api"
import AuthSignInForm from "@/components/ui/auth-sign-in-form"

export default function LoginPage() {
  const router = useRouter()
  const { mutate: login, loading: isLoading, error } = useLogin()

  const handleSubmit = async (email: string, password: string) => {
    try {
      const result = await login({ email, password })
      if (result) {
        router.push("/app")
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error("Login failed")
    }
  }

  return (
    <AuthSignInForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  )
}
