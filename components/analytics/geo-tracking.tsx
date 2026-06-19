"use client"

import { MapPin } from "lucide-react"

export function GeoTracking() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 pb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">Geo Tracking</h2>
      </div>
      <div className="flex h-72 items-center justify-center">
        <p className="text-sm text-muted-foreground">No geographic data yet.</p>
      </div>
    </div>
  )
}
