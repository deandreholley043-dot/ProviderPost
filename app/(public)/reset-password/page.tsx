"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 lg:px-8">
      <div className="rounded-md bg-pink-400 px-6 py-3 mb-8">
        <h1 className="text-xl font-extrabold text-foreground">RESET PASSWORD</h1>
      </div>

      <form className="flex flex-col items-center gap-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="email" className="text-center">E-Mail Address</Label>
          <Input id="email" type="email" placeholder="your@email.com" className="text-center" />
        </div>

        <Button type="submit" size="lg" className="bg-foreground text-background hover:bg-foreground/90">
          Send Password Reset Link
        </Button>
      </form>
    </div>
  )
}
