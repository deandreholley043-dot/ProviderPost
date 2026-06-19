"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  BarChart3, Globe, Users, DollarSign, Shield, MapPin, Activity,
  TrendingUp, AlertTriangle, Download, RefreshCw, Eye, Phone,
  Heart, Share2, Clock, CheckCircle, XCircle, Flag, Zap,
  ChevronUp, ChevronDown, FileText, Image, Video, MessageSquare,
  Lock, Bell, BellOff, Filter, Search, Trash2, Star, CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  db, seedDemoData, getOverviewStats, getTop20Listings, getTop20ByLocation,
  getMoneyMakerStats, exportCSV, exportJSON, createAlert,
  logModerationAction, logAdminAudit,
  type StatsAlert, type SecurityEvent, type ModerationLog,
  type UserStat, type ListingStat, type PaymentStat, type GeoStat,
  type MediaStat, type PrivacySettings,
} from "@/lib/stats-store"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, dec = 0): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })
}
function fmtUSD(n: number): string {
  return "$" + fmt(n, 2)
}
function pct(n: number, dec = 1): string {
  return fmt(n, dec) + "%"
}

const TABS = [
  { id: "overview",    label: "Overview",        icon: Activity   },
  { id: "visitors",    label: "Visitors",         icon: Eye        },
  { id: "users",       label: "Users",            icon: Users      },
  { id: "listings",    label: "Listings",         icon: BarChart3  },
  { id: "revenue",     label: "Money Maker",      icon: DollarSign },
  { id: "security",    label: "Abuse & Spam",     icon: Shield     },
  { id: "geo",         label: "Location Intel",   icon: MapPin     },
  { id: "moderation",  label: "Moderation",       icon: Flag       },
  { id: "media",       label: "Media",            icon: Image      },
  { id: "top20",       label: "Top 20",           icon: TrendingUp },
  { id: "alerts",      label: "Alerts",           icon: Bell       },
  { id: "exports",     label: "Export Center",    icon: Download   },
  { id: "privacy",     label: "Privacy",          icon: Lock       },
]

function StatCard({ label, value, sub, color = "pink", icon: Icon }: { label: string; value: string | number; sub?: string; color?: string; icon: React.ComponentType<{ className?: string }> }) {
  const colors: Record<string, string> = {
    pink: "border-l-pink-400",
    red: "border-l-red-400",
    green: "border-l-emerald-400",
    blue: "border-l-blue-400",
    amber: "border-l-amber-400",
    purple: "border-l-purple-400",
  }
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-border bg-card p-4 border-l-4", colors[color] || colors.pink)}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted`}>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-bold text-foreground">{typeof value === "number" ? fmt(value) : value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

function SectionHeader({ title, sub, onRefresh }: { title: string; sub?: string; onRefresh?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {onRefresh && (
        <button onClick={onRefresh} className="text-muted-foreground hover:text-foreground p-1 rounded">
          <RefreshCw className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function SeverityBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    high:     "bg-orange-100 text-orange-700",
    warning:  "bg-amber-100 text-amber-700",
    medium:   "bg-amber-100 text-amber-700",
    low:      "bg-blue-100 text-blue-700",
    info:     "bg-blue-100 text-blue-700",
  }
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", map[s] || "bg-muted text-muted-foreground")}>{s}</span>
}

function ProgressBar({ value, max, color = "#ec4899" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: pct + "%", background: color }} />
    </div>
  )
}

// ─── Tab sections ─────────────────────────────────────────────────────────────

function OverviewTab({ stats }: { stats: ReturnType<typeof getOverviewStats> }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Visitors"    value={stats.totalVisitors}    icon={Eye}        color="pink"   />
        <StatCard label="Unique Visitors"   value={stats.uniqueVisitors}   icon={Users}      color="blue"   />
        <StatCard label="Sessions Today"    value={stats.todaySessions}    icon={Activity}   color="purple" />
        <StatCard label="Bounce Rate"       value={stats.bounceRate + "%"} icon={TrendingUp} color="amber"  />
        <StatCard label="Avg. Session"      value={stats.avgSessionDuration + "s"} icon={Clock} color="green" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Users"       value={stats.totalUsers}        icon={Users}      color="blue"   />
        <StatCard label="Total Listings"    value={stats.totalListings}     icon={BarChart3}  color="pink"   />
        <StatCard label="Pending Approval"  value={stats.pendingListings}   icon={Clock}      color="amber"  />
        <StatCard label="Flagged"           value={stats.flaggedListings}   icon={Flag}       color="red"    />
        <StatCard label="Blocked IPs"       value={stats.blockedIPs}        icon={Shield}     color="red"    />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Revenue Today"     value={fmtUSD(stats.revenueToday)}   icon={DollarSign} color="green"  />
        <StatCard label="Revenue Total"     value={fmtUSD(stats.revenueTotal)}   icon={DollarSign} color="green"  />
        <StatCard label="Pending Payments"  value={stats.pendingPayments}        icon={CreditCard} color="amber"  />
        <StatCard label="Unread Alerts"     value={stats.unreadAlerts}           icon={Bell}       color="red"    />
      </div>
    </div>
  )
}

function VisitorTab() {
  const visitors = db.visitors.all()
  const sessions = db.sessions.all()

  const byDevice: Record<string, number> = {}
  const byBrowser: Record<string, number> = {}
  const byOS: Record<string, number> = {}
  const byCountry: Record<string, number> = {}
  for (const v of visitors) {
    byDevice[v.deviceType]  = (byDevice[v.deviceType] || 0) + 1
    byBrowser[v.browser]    = (byBrowser[v.browser] || 0) + 1
    byOS[v.os]              = (byOS[v.os] || 0) + 1
    byCountry[v.country]    = (byCountry[v.country] || 0) + 1
  }

  const topDevices  = Object.entries(byDevice).sort(([,a],[,b]) => b-a)
  const topBrowsers = Object.entries(byBrowser).sort(([,a],[,b]) => b-a)
  const topOS       = Object.entries(byOS).sort(([,a],[,b]) => b-a)
  const topCountries = Object.entries(byCountry).sort(([,a],[,b]) => b-a)

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Visitor Intelligence" sub={`${visitors.length} total visitors tracked`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Devices", data: topDevices },
          { label: "Browsers", data: topBrowsers },
          { label: "Operating Systems", data: topOS },
          { label: "Countries", data: topCountries },
        ].map(({ label, data }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground mb-3">{label}</p>
            {data.slice(0, 5).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground w-24 truncate">{k}</span>
                <ProgressBar value={v} max={visitors.length} />
                <span className="text-xs font-medium text-foreground w-8 text-right">{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Cookie ID</th>
              <th className="px-4 py-3 font-medium">Device</th>
              <th className="px-4 py-3 font-medium">Browser</th>
              <th className="px-4 py-3 font-medium">OS</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Visits</th>
              <th className="px-4 py-3 font-medium">Referrer</th>
              <th className="px-4 py-3 font-medium">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {visitors.slice(0, 25).map((v) => (
              <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{v.cookieId.slice(0, 10)}…</td>
                <td className="px-4 py-2 text-xs capitalize">{v.deviceType}</td>
                <td className="px-4 py-2 text-xs">{v.browser}</td>
                <td className="px-4 py-2 text-xs">{v.os}</td>
                <td className="px-4 py-2 text-xs">{v.city}, {v.state} {v.country}</td>
                <td className="px-4 py-2 text-xs font-medium">{v.totalVisits}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground truncate max-w-24">{v.referrer || "direct"}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">{new Date(v.lastSeen).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UsersTab() {
  const [search, setSearch] = useState("")
  const users = db.userStats.all()
  const filtered = users.filter(u =>
    !search || u.username.includes(search) || u.email.includes(search) || u.userId.includes(search)
  )

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title="User Stats" sub={`${users.length} registered users`} />
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search username, email, ID…" className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCSV(JSON.parse(JSON.stringify(users)), "users")}>
          <Download className="h-4 w-4 mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-3 font-medium">User</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">Ads</th>
              <th className="px-3 py-3 font-medium">Logins</th>
              <th className="px-3 py-3 font-medium">Spent</th>
              <th className="px-3 py-3 font-medium">Plan</th>
              <th className="px-3 py-3 font-medium">Risk</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.userId} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2">
                  <div className="font-medium text-foreground">@{u.username}</div>
                  <div className="text-[10px] text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-3 py-2 text-xs capitalize">{u.accountType}</td>
                <td className="px-3 py-2 text-xs">{u.adsCreated} / {u.adsApproved} ✓</td>
                <td className="px-3 py-2 text-xs">{u.loginCount} <span className="text-red-500">({u.failedLoginCount} fail)</span></td>
                <td className="px-3 py-2 text-xs font-medium text-emerald-600">{fmtUSD(u.totalSpentUSD)}</td>
                <td className="px-3 py-2 text-xs">{u.membershipPlan || "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <ProgressBar value={u.riskScore} max={100} color={u.riskScore > 70 ? "#ef4444" : u.riskScore > 40 ? "#f59e0b" : "#10b981"} />
                    <span className="text-[10px] w-6">{u.riskScore}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  {u.banned ? <Badge className="bg-red-100 text-red-700 text-[10px]">Banned</Badge>
                  : u.shadowBanned ? <Badge className="bg-amber-100 text-amber-700 text-[10px]">Shadow</Badge>
                  : <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>}
                </td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground whitespace-nowrap">{new Date(u.registeredAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ListingsTab() {
  const [sort, setSort] = useState<"pageViews" | "contactClicks" | "impressionsTotal" | "favoritesSaved">("pageViews")
  const listings = db.listingStats.all()
  const sorted = [...listings].sort((a, b) => b[sort] - a[sort])

  const statusColors: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700",
    pending:  "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    expired:  "bg-muted text-muted-foreground",
    hidden:   "bg-orange-100 text-orange-700",
    banned:   "bg-red-200 text-red-800",
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title="Listing Performance" sub={`${listings.length} total listings`} />
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        {(["pageViews","contactClicks","impressionsTotal","favoritesSaved"] as const).map(s => (
          <button key={s} onClick={() => setSort(s)}
            className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors", sort === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/70")}>
            {s === "pageViews" ? "Page Views" : s === "contactClicks" ? "Contacts" : s === "impressionsTotal" ? "Impressions" : "Favorites"}
          </button>
        ))}
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => exportCSV(JSON.parse(JSON.stringify(listings)), "listings")}>
          <Download className="h-4 w-4 mr-1.5" /> Export
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-3 font-medium">Listing ID</th>
              <th className="px-3 py-3 font-medium">Location</th>
              <th className="px-3 py-3 font-medium">Ethnicity</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium"><Eye className="h-3.5 w-3.5 inline mr-1" />Views</th>
              <th className="px-3 py-3 font-medium"><Phone className="h-3.5 w-3.5 inline mr-1" />Contacts</th>
              <th className="px-3 py-3 font-medium"><Zap className="h-3.5 w-3.5 inline mr-1" />Impressions</th>
              <th className="px-3 py-3 font-medium"><Heart className="h-3.5 w-3.5 inline mr-1" />Saves</th>
              <th className="px-3 py-3 font-medium">CTR%</th>
              <th className="px-3 py-3 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 30).map(l => (
              <tr key={l.listingId} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{l.listingId}</td>
                <td className="px-3 py-2 text-xs">{l.city}, {l.state}</td>
                <td className="px-3 py-2 text-xs">{l.ethnicity || "—"}</td>
                <td className="px-3 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusColors[l.status] || "bg-muted text-muted-foreground")}>{l.status}</span></td>
                <td className="px-3 py-2 text-xs font-medium">{fmt(l.pageViews)}</td>
                <td className="px-3 py-2 text-xs font-medium">{fmt(l.contactClicks)}</td>
                <td className="px-3 py-2 text-xs">{fmt(l.impressionsTotal)}</td>
                <td className="px-3 py-2 text-xs">{fmt(l.favoritesSaved)}</td>
                <td className="px-3 py-2 text-xs">{pct(l.searchCTR)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <ProgressBar value={l.riskScore} max={100} color={l.riskScore > 70 ? "#ef4444" : l.riskScore > 40 ? "#f59e0b" : "#10b981"} />
                    <span className="text-[10px] w-6">{l.riskScore}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RevenueTab() {
  const mm = getMoneyMakerStats(6000)
  const daily = db.revenueDaily.all().sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Money Maker Dashboard" sub="Revenue tracking and $6,000/month target" />

      {/* Target progress */}
      <div className="rounded-lg border-2 border-pink-300 bg-pink-50 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-pink-800">Monthly Target: $6,000</p>
            <p className="text-xs text-pink-600 mt-0.5">This month: {fmtUSD(mm.totalThisMonth)}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-pink-700">{pct(mm.progressPct)}</p>
            <p className="text-xs text-pink-500">{mm.usersNeeded > 0 ? `${mm.usersNeeded} more paying users needed` : "Target reached!"}</p>
          </div>
        </div>
        <ProgressBar value={mm.totalThisMonth} max={6000} color="#ec4899" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Avg Rev / User"        value={fmtUSD(mm.avgRevenuePerUser)}       icon={Users}      color="blue"   />
        <StatCard label="Avg Rev / Paying User"  value={fmtUSD(mm.avgRevenuePerPayingUser)} icon={DollarSign} color="green"  />
        <StatCard label="Total Paying Users"     value={mm.totalPayingUsers}                icon={Users}      color="purple" />
        <StatCard label="Total Refunds"          value={fmtUSD(mm.refunds)}                 icon={XCircle}    color="red"    />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* By coin */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Revenue by Coin</p>
          {Object.entries(mm.byCoin).sort(([,a],[,b]) => b-a).map(([coin, amt]) => (
            <div key={coin} className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-muted-foreground">{coin}</span>
              <div className="flex-1 mx-3"><ProgressBar value={amt} max={mm.totalThisMonth || 1} /></div>
              <span className="text-xs font-medium text-foreground">{fmtUSD(amt)}</span>
            </div>
          ))}
        </div>
        {/* By plan */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Revenue by Plan</p>
          {Object.entries(mm.byPlan).sort(([,a],[,b]) => b-a).map(([plan, amt]) => (
            <div key={plan} className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{plan}</span>
              <div className="flex-1 mx-3"><ProgressBar value={amt} max={mm.totalThisMonth || 1} /></div>
              <span className="text-xs font-medium text-foreground">{fmtUSD(amt)}</span>
            </div>
          ))}
        </div>
        {/* Top customers */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Top Customers</p>
          {mm.topCustomers.slice(0, 8).map((c, i) => (
            <div key={c.userId} className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{i + 1}. {c.userId}</span>
              <span className="text-xs font-bold text-emerald-600">{fmtUSD(c.total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily revenue table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Daily Revenue (Last 30 Days)</p>
          <Button variant="outline" size="sm" onClick={() => exportCSV(JSON.parse(JSON.stringify(daily)), "revenue-daily")}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Revenue</th>
              <th className="px-4 py-2 font-medium">New Subs</th>
              <th className="px-4 py-2 font-medium">Renewals</th>
              <th className="px-4 py-2 font-medium">Refunds</th>
              <th className="px-4 py-2 font-medium">Discounts</th>
              <th className="px-4 py-2 font-medium">Pending</th>
              <th className="px-4 py-2 font-medium">Failed</th>
            </tr>
          </thead>
          <tbody>
            {daily.slice(0, 30).map(d => (
              <tr key={d.date} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2 text-xs font-mono">{d.date}</td>
                <td className="px-4 py-2 text-xs font-bold text-emerald-600">{fmtUSD(d.totalUSD)}</td>
                <td className="px-4 py-2 text-xs">{d.newSubscriptions}</td>
                <td className="px-4 py-2 text-xs">{d.renewals}</td>
                <td className="px-4 py-2 text-xs text-red-500">{d.refunds}</td>
                <td className="px-4 py-2 text-xs text-amber-600">{fmtUSD(d.discounts)}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{d.pending}</td>
                <td className="px-4 py-2 text-xs text-red-400">{d.failed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SecurityTab() {
  const events = db.securityEvents.all().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const blocked = db.blockedIPs.all()
  const blockedDevices = db.blockedDevices.all()
  const [resolveId, setResolveId] = useState<string | null>(null)

  function handleResolve(id: string) {
    const all = db.securityEvents.all()
    db.securityEvents.save(all.map(e => e.id === id ? { ...e, resolved: true } : e))
    setResolveId(id)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Abuse & Security Intelligence" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Security Events"   value={events.length}                           icon={Shield}    color="red"   />
        <StatCard label="Unresolved"         value={events.filter(e => !e.resolved).length}  icon={AlertTriangle} color="red" />
        <StatCard label="Blocked IPs"        value={blocked.length}                          icon={Lock}      color="amber" />
        <StatCard label="Blocked Devices"    value={blockedDevices.length}                   icon={Shield}    color="purple"/>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Security Events</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">Severity</th>
              <th className="px-3 py-3 font-medium">IP (hashed)</th>
              <th className="px-3 py-3 font-medium">User</th>
              <th className="px-3 py-3 font-medium">Description</th>
              <th className="px-3 py-3 font-medium">Risk</th>
              <th className="px-3 py-3 font-medium">Time</th>
              <th className="px-3 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 20).map(e => (
              <tr key={e.id} className={cn("border-b border-border last:border-0 hover:bg-muted/20", !e.resolved && "bg-red-50/30")}>
                <td className="px-3 py-2 text-xs font-mono">{e.type.replace(/_/g, " ")}</td>
                <td className="px-3 py-2"><SeverityBadge s={e.severity} /></td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{e.hashedIp}</td>
                <td className="px-3 py-2 text-xs">{e.userId || "—"}</td>
                <td className="px-3 py-2 text-xs max-w-48 truncate">{e.description}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <ProgressBar value={e.riskScore} max={100} color={e.riskScore > 70 ? "#ef4444" : "#f59e0b"} />
                    <span className="text-[10px] w-6">{e.riskScore}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</td>
                <td className="px-3 py-2">
                  {e.resolved
                    ? <span className="text-[10px] text-emerald-600">Resolved</span>
                    : <button onClick={() => handleResolve(e.id)} className="text-[10px] text-blue-500 hover:underline">Resolve</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GeoTab() {
  const top20 = getTop20ByLocation()

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Location Intelligence" sub="Traffic, revenue, and risk by geography" />

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Live map:</strong> Connect Mapbox or Google Maps with your API key to render the interactive location map. The data is ready — bind <code className="font-mono text-xs bg-amber-100 px-1 rounded">db.geoStats.all()</code> to your map renderer.
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {[
          { label: "Top 20 by Traffic", data: top20.byTraffic, key: "visitors" as keyof GeoStat, color: "blue" },
          { label: "Top 20 by Revenue", data: top20.byRevenue, key: "revenue" as keyof GeoStat, color: "green" },
          { label: "Top 20 by Ad Views", data: top20.byAdViews, key: "listingViews" as keyof GeoStat, color: "pink" },
          { label: "Top 20 Suspicious", data: top20.bySuspicious, key: "spamAttempts" as keyof GeoStat, color: "red" },
        ].map(({ label, data, key, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">{label}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Location</th>
                  <th className="px-3 py-2 font-medium">Country</th>
                  <th className="px-3 py-2 font-medium">{key === "revenue" ? "Revenue" : String(key)}</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((g, i) => (
                  <tr key={`${g.city}-${i}`} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2 text-xs text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 text-xs font-medium">{g.city}, {g.state}</td>
                    <td className="px-3 py-2 text-xs">{g.country}</td>
                    <td className="px-3 py-2 text-xs font-bold">{key === "revenue" ? fmtUSD(g.revenue) : fmt(g[key] as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModerationTab() {
  const logs = db.moderationLogs.all().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const audit = db.adminAuditLogs.all().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const actionColors: Record<string, string> = {
    approve: "text-emerald-600", reject: "text-red-500", ban: "text-red-700",
    delete: "text-red-400", flag: "text-amber-600", unflag: "text-blue-500",
    edit: "text-blue-400", note: "text-muted-foreground", override: "text-purple-500",
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Moderation Analytics" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Actions"  value={logs.length}                               icon={Flag}       color="pink" />
        <StatCard label="Approvals"      value={logs.filter(l => l.action === "approve").length} icon={CheckCircle} color="green" />
        <StatCard label="Rejections"     value={logs.filter(l => l.action === "reject").length}  icon={XCircle}    color="red" />
        <StatCard label="Bans Issued"    value={logs.filter(l => l.action === "ban").length}      icon={Shield}     color="red" />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Moderation Action Log</p>
          <Button variant="outline" size="sm" onClick={() => exportCSV(JSON.parse(JSON.stringify(logs)), "moderation")}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-3 font-medium">Admin</th>
              <th className="px-3 py-3 font-medium">Action</th>
              <th className="px-3 py-3 font-medium">Target</th>
              <th className="px-3 py-3 font-medium">Reason</th>
              <th className="px-3 py-3 font-medium">Before</th>
              <th className="px-3 py-3 font-medium">After</th>
              <th className="px-3 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 30).map(l => (
              <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2 text-xs font-medium">{l.adminName}</td>
                <td className="px-3 py-2 text-xs font-bold capitalize" style={{ color: actionColors[l.action] || "#888" }}>{l.action}</td>
                <td className="px-3 py-2 text-xs"><span className="text-muted-foreground">{l.targetType}:</span> {l.targetId}</td>
                <td className="px-3 py-2 text-xs max-w-32 truncate">{l.reason}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{l.previousValue || "—"}</td>
                <td className="px-3 py-2 text-xs font-medium">{l.newValue || "—"}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MediaTab() {
  const media = db.mediaStats.all()
  const photos = media.filter(m => m.mediaType === "photo")
  const videos = media.filter(m => m.mediaType === "video")
  const totalPhotoBytes = photos.reduce((s, m) => s + m.sizeBytes, 0)
  const totalVideoBytes = videos.reduce((s, m) => s + m.sizeBytes, 0)

  function fmtBytes(b: number): string {
    if (b > 1e9) return (b / 1e9).toFixed(2) + " GB"
    if (b > 1e6) return (b / 1e6).toFixed(1) + " MB"
    return (b / 1e3).toFixed(0) + " KB"
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Media Tracking" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Photos"      value={photos.length}          icon={Image}  color="pink"   />
        <StatCard label="Total Videos"      value={videos.length}          icon={Video}  color="purple" />
        <StatCard label="Photo Storage"     value={fmtBytes(totalPhotoBytes)} icon={Image} color="blue"  />
        <StatCard label="Video Storage"     value={fmtBytes(totalVideoBytes)} icon={Video} color="blue"  />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Media Library Stats</p>
          <Button variant="outline" size="sm" onClick={() => exportCSV(JSON.parse(JSON.stringify(media)), "media")}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-3 font-medium">User</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">Size</th>
              <th className="px-3 py-3 font-medium">Region</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Views</th>
              <th className="px-3 py-3 font-medium">Reports</th>
              <th className="px-3 py-3 font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {media.slice(0, 25).map(m => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2 text-xs">{m.userId}</td>
                <td className="px-3 py-2"><Badge className={m.mediaType === "photo" ? "bg-pink-100 text-pink-700" : "bg-purple-100 text-purple-700"}>{m.mediaType}</Badge></td>
                <td className="px-3 py-2 text-xs">{fmtBytes(m.sizeBytes)}</td>
                <td className="px-3 py-2 text-xs">{m.region}</td>
                <td className="px-3 py-2 text-xs">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", {
                    approved: "bg-emerald-100 text-emerald-700",
                    pending:  "bg-amber-100 text-amber-700",
                    rejected: "bg-red-100 text-red-700",
                    duplicate:"bg-orange-100 text-orange-700",
                  }[m.status] || "bg-muted text-muted-foreground")}>{m.status}</span>
                </td>
                <td className="px-3 py-2 text-xs">{m.views}</td>
                <td className="px-3 py-2 text-xs">{m.reports > 0 ? <span className="text-red-500 font-medium">{m.reports}</span> : "0"}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground whitespace-nowrap">{new Date(m.uploadedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Top20Tab() {
  const byViews    = getTop20Listings("pageViews")
  const byContacts = getTop20Listings("contactClicks")
  const geo        = getTop20ByLocation()

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Top 20 Reports" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><p className="text-sm font-semibold text-foreground">Top 20 Most Viewed Listings</p></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-left text-muted-foreground"><th className="px-3 py-2 font-medium">#</th><th className="px-3 py-2 font-medium">ID</th><th className="px-3 py-2 font-medium">City</th><th className="px-3 py-2 font-medium">Views</th><th className="px-3 py-2 font-medium">Impressions</th></tr></thead>
            <tbody>{byViews.map((l, i) => <tr key={l.listingId} className="border-b border-border last:border-0 hover:bg-muted/20"><td className="px-3 py-2 text-xs text-muted-foreground">{i+1}</td><td className="px-3 py-2 text-xs font-mono">{l.listingId}</td><td className="px-3 py-2 text-xs">{l.city}, {l.state}</td><td className="px-3 py-2 text-xs font-bold">{fmt(l.pageViews)}</td><td className="px-3 py-2 text-xs">{fmt(l.impressionsTotal)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><p className="text-sm font-semibold text-foreground">Top 20 Most Contacted Listings</p></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-left text-muted-foreground"><th className="px-3 py-2 font-medium">#</th><th className="px-3 py-2 font-medium">ID</th><th className="px-3 py-2 font-medium">City</th><th className="px-3 py-2 font-medium">Contacts</th><th className="px-3 py-2 font-medium">Phone Clicks</th></tr></thead>
            <tbody>{byContacts.map((l, i) => <tr key={l.listingId} className="border-b border-border last:border-0 hover:bg-muted/20"><td className="px-3 py-2 text-xs text-muted-foreground">{i+1}</td><td className="px-3 py-2 text-xs font-mono">{l.listingId}</td><td className="px-3 py-2 text-xs">{l.city}, {l.state}</td><td className="px-3 py-2 text-xs font-bold">{fmt(l.contactClicks)}</td><td className="px-3 py-2 text-xs">{fmt(l.phoneClicks)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><p className="text-sm font-semibold text-foreground">Top 20 Revenue Locations</p></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-left text-muted-foreground"><th className="px-3 py-2 font-medium">#</th><th className="px-3 py-2 font-medium">Location</th><th className="px-3 py-2 font-medium">Revenue</th><th className="px-3 py-2 font-medium">Users</th></tr></thead>
            <tbody>{geo.byRevenue.map((g, i) => <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20"><td className="px-3 py-2 text-xs text-muted-foreground">{i+1}</td><td className="px-3 py-2 text-xs">{g.city}, {g.state} {g.country}</td><td className="px-3 py-2 text-xs font-bold text-emerald-600">{fmtUSD(g.revenue)}</td><td className="px-3 py-2 text-xs">{g.users}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border"><p className="text-sm font-semibold text-foreground">Top 20 Suspicious Locations</p></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-left text-muted-foreground"><th className="px-3 py-2 font-medium">#</th><th className="px-3 py-2 font-medium">Location</th><th className="px-3 py-2 font-medium">Spam Attempts</th><th className="px-3 py-2 font-medium">Flagged Accounts</th></tr></thead>
            <tbody>{geo.bySuspicious.map((g, i) => <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20"><td className="px-3 py-2 text-xs text-muted-foreground">{i+1}</td><td className="px-3 py-2 text-xs">{g.city}, {g.state} {g.country}</td><td className="px-3 py-2 text-xs font-bold text-red-500">{g.spamAttempts}</td><td className="px-3 py-2 text-xs text-orange-500">{g.flaggedAccounts}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AlertsTab() {
  const [alerts, setAlerts] = useState<StatsAlert[]>([])

  useEffect(() => { setAlerts(db.alerts.all().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())) }, [])

  function markRead(id: string) {
    db.alerts.save(db.alerts.all().map(a => a.id === id ? { ...a, read: true } : a))
    setAlerts(db.alerts.all())
  }
  function resolve(id: string) {
    db.alerts.save(db.alerts.all().map(a => a.id === id ? { ...a, resolved: true, read: true } : a))
    setAlerts(db.alerts.all())
  }
  function markAllRead() {
    db.alerts.save(db.alerts.all().map(a => ({ ...a, read: true })))
    setAlerts(db.alerts.all())
  }

  const unread = alerts.filter(a => !a.read).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionHeader title={`Alerts & Monitoring${unread > 0 ? ` (${unread} unread)` : ""}`} />
        {unread > 0 && <Button variant="outline" size="sm" onClick={markAllRead}><CheckCircle className="h-4 w-4 mr-1.5" /> Mark all read</Button>}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-14 text-center">
          <BellOff className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No alerts yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map(a => (
            <div key={a.id} className={cn("rounded-lg border p-4 flex items-start gap-3", !a.read && "border-amber-300 bg-amber-50/50", a.resolved && "opacity-60")}>
              <SeverityBadge s={a.severity} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!a.read && <button onClick={() => markRead(a.id)} className="text-xs text-blue-500 hover:underline">Mark read</button>}
                {!a.resolved && <button onClick={() => resolve(a.id)} className="text-xs text-emerald-500 hover:underline">Resolve</button>}
                {a.resolved && <span className="text-xs text-muted-foreground">Resolved</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ExportsTab() {
  const REPORTS = [
    { type: "users",      label: "User Report",       icon: Users      },
    { type: "listings",   label: "Listing Report",    icon: BarChart3  },
    { type: "payments",   label: "Payments Report",   icon: CreditCard },
    { type: "moderation", label: "Moderation Report", icon: Flag       },
    { type: "security",   label: "Security Report",   icon: Shield     },
    { type: "geo",        label: "Location Report",   icon: MapPin     },
    { type: "media",      label: "Media Report",      icon: Image      },
    { type: "revenue",    label: "Revenue Report",    icon: DollarSign },
  ]

  function handleExport(type: string) {
    const dataMap: Record<string, unknown[]> = {
      users:      db.userStats.all(),
      listings:   db.listingStats.all(),
      payments:   db.paymentStats.all(),
      moderation: db.moderationLogs.all(),
      security:   db.securityEvents.all(),
      geo:        db.geoStats.all(),
      media:      db.mediaStats.all(),
      revenue:    db.revenueDaily.all(),
    }
    const data = dataMap[type] || []
    exportCSV(JSON.parse(JSON.stringify(data)), type)
  }

  function handleExportJSON(type: string) {
    const dataMap: Record<string, unknown[]> = {
      users:      db.userStats.all(),
      listings:   db.listingStats.all(),
      payments:   db.paymentStats.all(),
      moderation: db.moderationLogs.all(),
      security:   db.securityEvents.all(),
      geo:        db.geoStats.all(),
      media:      db.mediaStats.all(),
      revenue:    db.revenueDaily.all(),
    }
    exportJSON(dataMap[type] || [], type)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Export Center" sub="Download any stats table as CSV or JSON" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REPORTS.map(({ type, label, icon: Icon }) => (
          <div key={type} className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50"><Icon className="h-5 w-5 text-pink-500" /></div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleExport(type)}>
                <Download className="h-3.5 w-3.5 mr-1" /> CSV
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleExportJSON(type)}>
                <FileText className="h-3.5 w-3.5 mr-1" /> JSON
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PrivacyTab() {
  const [settings, setSettings] = useState<PrivacySettings>(db.privacy.get())
  const [saved, setSaved] = useState(false)

  function update(patch: Partial<PrivacySettings>) {
    setSettings(s => ({ ...s, ...patch }))
    setSaved(false)
  }

  function handleSave() {
    db.privacy.save(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleClearAll() {
    if (!confirm("Clear ALL stats data? This cannot be undone.")) return
    Object.keys(localStorage).filter(k => k.startsWith("pp_stats_")).forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Privacy & Data Controls" />
      <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5 max-w-lg">
        <div className="flex items-center justify-between">
          <div><Label>Anonymize IP Addresses</Label><p className="text-xs text-muted-foreground mt-0.5">Store only hashed IPs, never raw IPs</p></div>
          <Switch checked={settings.anonymizeIPs} onCheckedChange={v => update({ anonymizeIPs: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div><Label>Hash Email Addresses</Label><p className="text-xs text-muted-foreground mt-0.5">Store email hashes only in analytics tables</p></div>
          <Switch checked={settings.hashEmails} onCheckedChange={v => update({ hashEmails: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div><Label>Allow Data Export</Label><p className="text-xs text-muted-foreground mt-0.5">Users can request export of their analytics data</p></div>
          <Switch checked={settings.allowDataExport} onCheckedChange={v => update({ allowDataExport: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div><Label>Allow Data Delete</Label><p className="text-xs text-muted-foreground mt-0.5">Users can request deletion of their analytics data</p></div>
          <Switch checked={settings.allowDataDelete} onCheckedChange={v => update({ allowDataDelete: v })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Data Retention (days)</Label>
          <Input type="number" min="30" max="730" value={settings.retentionDays} onChange={e => update({ retentionDays: parseInt(e.target.value) || 365 })} className="max-w-32" />
          <p className="text-xs text-muted-foreground">Events older than this will be purged automatically</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} className="bg-foreground text-background hover:bg-foreground/90">Save Settings</Button>
          {saved && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Saved</span>}
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-5 max-w-lg">
        <p className="text-sm font-bold text-red-700 mb-2">Danger Zone</p>
        <p className="text-xs text-red-600 mb-4">Clear all stats data from localStorage. Use when migrating to a real database.</p>
        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={handleClearAll}>
          <Trash2 className="h-4 w-4 mr-1.5" /> Clear All Stats Data
        </Button>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const [tab, setTab] = useState("overview")
  const [stats, setStats] = useState(() => getOverviewStats())
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    seedDemoData()
    setSeeded(true)
    setStats(getOverviewStats())
  }, [])

  const refresh = useCallback(() => {
    setStats(getOverviewStats())
  }, [])

  const unreadAlerts = stats.unreadAlerts

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Activity className="h-7 w-7 text-primary" />
            Stats & Intelligence
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full enterprise analytics — visitors, users, listings, revenue, security, and location intelligence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {seeded && <Badge className="bg-amber-100 text-amber-700">Demo data loaded</Badge>}
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tab === id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted")}>
            <Icon className="h-3.5 w-3.5" />
            {label}
            {id === "alerts" && unreadAlerts > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{unreadAlerts}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {tab === "overview"    && <OverviewTab stats={stats} />}
        {tab === "visitors"    && <VisitorTab />}
        {tab === "users"       && <UsersTab />}
        {tab === "listings"    && <ListingsTab />}
        {tab === "revenue"     && <RevenueTab />}
        {tab === "security"    && <SecurityTab />}
        {tab === "geo"         && <GeoTab />}
        {tab === "moderation"  && <ModerationTab />}
        {tab === "media"       && <MediaTab />}
        {tab === "top20"       && <Top20Tab />}
        {tab === "alerts"      && <AlertsTab />}
        {tab === "exports"     && <ExportsTab />}
        {tab === "privacy"     && <PrivacyTab />}
      </div>
    </div>
  )
}
