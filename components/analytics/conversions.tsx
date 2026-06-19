"use client"

import { TrendingUp } from "lucide-react"

export function Conversions() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 pb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">Conversions</h2>
      </div>
      <div className="flex h-72 items-center justify-center">
        <p className="text-sm text-muted-foreground">No conversion data yet.</p>
      </div>
    </div>
  )
}
