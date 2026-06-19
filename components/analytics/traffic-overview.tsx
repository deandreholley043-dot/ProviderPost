"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function TrafficOverview() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold text-card-foreground">Traffic Overview</h2>
        <span className="text-xs text-muted-foreground">Last 7 days</span>
      </div>
      <div className="flex h-72 items-center justify-center">
        <p className="text-sm text-muted-foreground">No traffic data yet.</p>
      </div>
    </div>
  )
}
