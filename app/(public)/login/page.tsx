"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed.")
        setLoading(false)
        return
      }

      // Redirect based on account type
      if (data.user.accountType === "provider") {
        router.push("/user/account")
      } else {
        router.push("/browse")
      }
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 lg:px-8">
      <div className="rounded-md bg-pink-400 px-6 py-3 mb-8">
        <h1 className="text-xl font-extrabold text-foreground">LOGIN</h1>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-Mail Address</Label>
          <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <Button type="submit" size="lg" className="bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </Button>

        <div className="flex flex-col items-center gap-2 text-sm">
          <Link href="/reset-password" className="text-primary hover:underline">Forgot your password?</Link>
          <p className="text-muted-foreground">
            {"Don't have an account? "}<Link href="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </div>
      </form>
    </div>
  )
}
