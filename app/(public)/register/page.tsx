"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { User, Briefcase } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<"hobbyist" | "provider">("hobbyist")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirm) { setError("Passwords do not match."); return }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email, password, accountType }),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return }

      router.push(accountType === "provider" ? "/post" : "/browse")
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 lg:px-8">
      <div className="rounded-md bg-pink-400 px-6 py-3 mb-8">
        <h1 className="text-xl font-extrabold text-foreground">REGISTER</h1>
      </div>

      <div className="mb-6">
        <Label className="mb-2 block">Account Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {([["hobbyist", User, "Browse ads & post reviews"], ["provider", Briefcase, "Post & manage your ads"]] as const).map(([type, Icon, desc]) => (
            <button key={type} type="button" onClick={() => setAccountType(type)}
              className={cn("flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                accountType === type ? "border-pink-400 bg-pink-50 text-foreground" : "border-border bg-card text-muted-foreground hover:border-pink-200")}>
              <Icon className="h-6 w-6" />
              <span className="text-sm font-bold capitalize">{type}</span>
              <span className="text-xs text-center leading-tight">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Username</Label>
          <Input id="name" placeholder="Choose a username" value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-Mail Address</Label>
          <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input id="confirm" type="password" placeholder="Confirm your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
        </div>

        {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <Button type="submit" size="lg" className="bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
          {loading ? "Creating account…" : `Create ${accountType === "hobbyist" ? "Hobbyist" : "Provider"} Account`}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}<Link href="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </form>
    </div>
  )
}
