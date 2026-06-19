"use client"

import { Users } from "lucide-react"

export function UserBehavior() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 pb-4">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">User Behavior</h2>
      </div>
      <div className="flex h-72 items-center justify-center">
        <p className="text-sm text-muted-foreground">No behavior data yet.</p>
      </div>
    </div>
  )
}
