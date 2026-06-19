"use client"

import { Monitor } from "lucide-react"

export function DeviceTracking() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 pb-4">
        <Monitor className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">Device Tracking</h2>
      </div>
      <div className="flex h-72 items-center justify-center">
        <p className="text-sm text-muted-foreground">No device data yet.</p>
      </div>
    </div>
  )
}
