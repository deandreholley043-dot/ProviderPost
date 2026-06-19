"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { BarChart3, Globe, Monitor, TrendingUp, Users, ShieldAlert, Scale, Eye, ArrowDownUp, Clock, MousePointer } from "lucide-react"
import { TrafficOverview } from "@/components/analytics/traffic-overview"
import { TrafficSources } from "@/components/analytics/traffic-sources"
import { GeoTracking } from "@/components/analytics/geo-tracking"
import { DeviceTracking } from "@/components/analytics/device-tracking"
import { Conversions } from "@/components/analytics/conversions"
import { UserBehavior } from "@/components/analytics/user-behavior"
import { FraudDetection } from "@/components/analytics/fraud-detection"
import { Compliance } from "@/components/analytics/compliance"

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "geo", label: "Geo Tracking", icon: Globe },
  { id: "devices", label: "Devices", icon: Monitor },
  { id: "conversions", label: "Conversions", icon: TrendingUp },
  { id: "behavior", label: "User Behavior", icon: Users },
  { id: "fraud", label: "Fraud & Abuse", icon: ShieldAlert },
  { id: "compliance", label: "Legal & Compliance", icon: Scale },
]

const coreStats = [
  { label: "Unique Visitors", value: "0", icon: Eye, color: "#ec4899" },
  { label: "Total Page Views", value: "0", icon: BarChart3, color: "#f472b6" },
  { label: "Bounce Rate", value: "—", icon: ArrowDownUp, color: "#ffa726" },
  { label: "Avg. Time on Site", value: "—", icon: Clock, color: "#ab47bc" },
  { label: "Sessions", value: "0", icon: MousePointer, color: "#ec407a" },
]

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics & Statistics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monitor site traffic, user engagement, conversions, and compliance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {coreStats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: s.color + "18" }}>
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-card-foreground">{s.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2"><TrafficOverview /></div>
            <TrafficSources />
          </div>
        )}
        {activeTab === "geo" && <GeoTracking />}
        {activeTab === "devices" && <DeviceTracking />}
        {activeTab === "conversions" && <Conversions />}
        {activeTab === "behavior" && <UserBehavior />}
        {activeTab === "fraud" && <FraudDetection />}
        {activeTab === "compliance" && <Compliance />}
      </div>
    </div>
  )
}
