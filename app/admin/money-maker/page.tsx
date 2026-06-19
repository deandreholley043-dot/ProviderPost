"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  DollarSign, TrendingUp, TrendingDown, Minus, Target,
  Calendar, Download, RefreshCw, Plus, Settings, Trash2,
  CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp,
  Users, BarChart3, FileText, StickyNote, CreditCard, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  mmGetSettings, mmSaveSettings, mmGetMonthSummary, mmGetDailyStats,
  mmGetRevenueLogs, mmGetKeyMetrics, mmCalculateUsersNeeded,
  mmGetAvailableMonths, mmAddRevenueLog, mmAddAdjustment,
  mmUpsertDailyStat, mmUpdateDailyNote, mmResetMonth, mmExportCSV,
  mmSeedDemo, mmThisMonth, mmToday,
  MM_CATEGORY_LABELS, MM_CATEGORY_COLORS,
  type MMSettings, type MMRevenueCategory, type MMMonthSummary,
} from "@/lib/money-maker-store"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function usd(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function pct(n: number, dec = 1): string {
  return n.toFixed(dec) + "%"
}
function fmt(n: number): string {
  return n.toLocaleString()
}

const STATUS_CONFIG = {
  ahead:    { label: "Ahead of Target",  color: "bg-emerald-100 text-emerald-700 border-emerald-200",  icon: TrendingUp,   barColor: "#10b981" },
  on_track: { label: "On Track",         color: "bg-emerald-100 text-emerald-700 border-emerald-200",  icon: CheckCircle,  barColor: "#10b981" },
  warning:  { label: "Warning",          color: "bg-amber-100 text-amber-700 border-amber-200",        icon: AlertTriangle,barColor: "#f59e0b" },
  behind:   { label: "Behind Target",    color: "bg-red-100 text-red-700 border-red-200",              icon: TrendingDown, barColor: "#ef4444" },
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProgressCard({ summary }: { summary: MMMonthSummary }) {
  const cfg = STATUS_CONFIG[summary.projectedStatus]
  const StatusIcon = cfg.icon

  return (
    <div className="mm-card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="mm-label">Monthly Revenue vs Goal</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-foreground">{usd(summary.totalRevenue)}</span>
            <span className="text-lg text-muted-foreground">/ {usd(summary.goal)}</span>
          </div>
        </div>
        <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold", cfg.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {cfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: pct(summary.progressPct, 0), background: cfg.barColor }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs font-semibold text-foreground">{pct(summary.progressPct)} complete</span>
          <span className="text-xs text-muted-foreground">{usd(summary.remaining)} remaining</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-border pt-4">
        {[
          { label: "Daily Average", value: usd(summary.dailyAvgActual), sub: "actual" },
          { label: "Daily Needed",  value: usd(summary.dailyAvgNeeded),  sub: "to hit goal" },
          { label: "Projected",     value: usd(summary.projectedRevenue), sub: "end of month" },
          { label: "Days Left",     value: String(summary.daysRemaining), sub: `of ${summary.daysInMonth}` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="text-center">
            <p className="mm-label">{label}</p>
            <p className="text-base font-bold text-foreground mt-0.5">{value}</p>
            <p className="text-[10px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryBreakdown({ summary }: { summary: MMMonthSummary }) {
  const sorted = Object.entries(summary.byCategory)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="mm-card flex flex-col gap-4">
      <p className="mm-section-title">Revenue by Category</p>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No revenue logged this month.</p>
      ) : (
        sorted.map(([cat, amt]) => {
          const pctVal = summary.totalRevenue > 0 ? (amt / summary.totalRevenue) * 100 : 0
          const color = MM_CATEGORY_COLORS[cat as MMRevenueCategory] || "#888"
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">{MM_CATEGORY_LABELS[cat as MMRevenueCategory] || cat}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{pct(pctVal)}</span>
                  <span className="text-xs font-bold text-foreground">{usd(amt)}</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: pct(pctVal, 0), background: color }} />
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function KeyMetricsPanel({ month }: { month: string }) {
  const metrics = mmGetKeyMetrics(month)

  const items = [
    { label: "Total Users",         value: fmt(metrics.totalUsers),          icon: Users,      color: "text-blue-500"   },
    { label: "Paying Users",        value: fmt(metrics.payingUsers),          icon: CreditCard, color: "text-emerald-500" },
    { label: "Free Users",          value: fmt(metrics.freeUsers),            icon: Users,      color: "text-muted-foreground" },
    { label: "Conversion Rate",     value: pct(metrics.conversionRate),       icon: TrendingUp, color: "text-purple-500"  },
    { label: "ARPU",                value: usd(metrics.arpu),                 icon: DollarSign, color: "text-indigo-500"  },
    { label: "Rev per Listing",     value: usd(metrics.revenuePerListing),    icon: BarChart3,  color: "text-pink-500"    },
    { label: "Avg Order Value",     value: usd(metrics.avgOrderValue),        icon: DollarSign, color: "text-emerald-500" },
    { label: "Monthly Recurring",   value: usd(metrics.mrr),                  icon: RefreshCw,  color: "text-blue-500"    },
    { label: "One-time Revenue",    value: usd(metrics.oneTimeRevenue),       icon: Zap,        color: "text-amber-500"   },
    { label: "Active Paid Listings",value: fmt(metrics.activePaidListings),   icon: FileText,   color: "text-rose-500"    },
  ]

  return (
    <div className="mm-card flex flex-col gap-4">
      <p className="mm-section-title">Key Business Metrics</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {items.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex flex-col gap-1 rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-1.5">
              <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />
              <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
            </div>
            <p className="text-sm font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsersNeededCalc({ month }: { month: string }) {
  const [paid, setPaid] = useState(0)
  const scenarios = mmCalculateUsersNeeded(month, paid)

  return (
    <div className="mm-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="mm-section-title">Users Needed Calculator</p>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Current paying users:</Label>
          <Input type="number" min="0" value={paid} onChange={e => setPaid(parseInt(e.target.value) || 0)} className="w-20 h-7 text-xs" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-2 text-xs font-medium">Plan / Product</th>
              <th className="px-3 py-2 text-xs font-medium">Price</th>
              <th className="px-3 py-2 text-xs font-medium">Needed for Goal</th>
              <th className="px-3 py-2 text-xs font-medium">Still Needed</th>
              <th className="px-3 py-2 text-xs font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map(s => (
              <tr key={s.plan} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2 text-xs font-medium text-foreground">{s.plan}</td>
                <td className="px-3 py-2 text-xs font-bold text-emerald-600">{usd(s.price)}</td>
                <td className="px-3 py-2 text-xs">{fmt(s.usersNeeded)} users</td>
                <td className="px-3 py-2 text-xs">
                  <span className={s.stillNeeded <= 0 ? "text-emerald-600 font-bold" : "text-foreground"}>
                    {s.stillNeeded <= 0 ? "✓ Goal met!" : fmt(s.stillNeeded) + " more"}
                  </span>
                </td>
                <td className="px-3 py-2 w-32">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-pink-400" style={{ width: Math.min(100, (paid / s.usersNeeded) * 100).toFixed(0) + "%" }} />
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

function DailyTable({ month }: { month: string }) {
  const [editNote, setEditNote] = useState<string | null>(null)
  const [noteVal, setNoteVal] = useState("")
  const daily = mmGetDailyStats(month)

  function handleSaveNote(date: string) {
    mmUpdateDailyNote(date, noteVal)
    setEditNote(null)
    setNoteVal("")
  }

  return (
    <div className="mm-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="mm-section-title">Daily Tracking Table</p>
        <Button variant="outline" size="sm" onClick={() => mmExportCSV(month, "daily")}>
          <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>
      {daily.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No daily data logged yet for {month}.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Revenue</th>
                <th className="px-3 py-2 font-medium">New Users</th>
                <th className="px-3 py-2 font-medium">Paid</th>
                <th className="px-3 py-2 font-medium">Listings</th>
                <th className="px-3 py-2 font-medium">Bumped</th>
                <th className="px-3 py-2 font-medium">Featured</th>
                <th className="px-3 py-2 font-medium">Sponsored</th>
                <th className="px-3 py-2 font-medium">Add-ons</th>
                <th className="px-3 py-2 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {daily.map(d => (
                <tr key={d.date} className={cn("border-b border-border last:border-0 hover:bg-muted/20", d.date === mmToday() && "bg-pink-50/50")}>
                  <td className="px-3 py-2 font-mono font-medium text-foreground">{d.date}{d.date === mmToday() && <span className="ml-1 text-[9px] text-pink-500 font-bold">TODAY</span>}</td>
                  <td className="px-3 py-2 font-bold text-emerald-600">{usd(d.revenueUSD)}</td>
                  <td className="px-3 py-2">{d.newUsers}</td>
                  <td className="px-3 py-2 font-medium text-purple-600">{d.newPaidUsers}</td>
                  <td className="px-3 py-2">{d.newListings}</td>
                  <td className="px-3 py-2">{d.listingsBumped}</td>
                  <td className="px-3 py-2">{d.featuredAdsPurchased}</td>
                  <td className="px-3 py-2">{d.sponsoredAdsPurchased}</td>
                  <td className="px-3 py-2">{d.creditsAddonsPurchased}</td>
                  <td className="px-3 py-2">
                    {editNote === d.date ? (
                      <div className="flex items-center gap-1">
                        <Input value={noteVal} onChange={e => setNoteVal(e.target.value)} className="h-6 text-xs w-28" onKeyDown={e => { if (e.key === "Enter") handleSaveNote(d.date) }} />
                        <button onClick={() => handleSaveNote(d.date)} className="text-emerald-500 hover:text-emerald-700"><CheckCircle className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setEditNote(null)} className="text-muted-foreground hover:text-foreground"><XCircle className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditNote(d.date); setNoteVal(d.adminNote) }} className="max-w-24 truncate text-left hover:text-foreground text-muted-foreground">
                        {d.adminNote || <span className="opacity-40">+ note</span>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AddRevenueForm({ month, onAdded }: { month: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<MMRevenueCategory>("membership_1month")
  const [amount, setAmount] = useState("")
  const [desc, setDesc] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount."); return }
    mmAddRevenueLog({ month, date: mmToday(), category, amountUSD: amt, description: desc || MM_CATEGORY_LABELS[category], userId: null, listingId: null, paymentId: null, addedBy: "admin", note })
    setAmount(""); setDesc(""); setNote(""); setOpen(false)
    onAdded()
  }

  if (!open) return (
    <Button onClick={() => setOpen(true)} className="bg-foreground text-background hover:bg-foreground/90 w-fit">
      <Plus className="h-4 w-4 mr-1.5" /> Log Revenue
    </Button>
  )

  return (
    <div className="mm-card">
      <p className="mm-section-title mb-4">Log Revenue Entry</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Category</Label>
          <select value={category} onChange={e => setCategory(e.target.value as MMRevenueCategory)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            {Object.entries(MM_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Amount (USD)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="pl-7" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Description (optional)</Label>
          <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. John Smith — 3 month plan" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Admin Note</Label>
          <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Internal note" />
        </div>
        {error && <p className="text-sm text-red-500 col-span-full">{error}</p>}
        <div className="flex gap-2 col-span-full">
          <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">Add Entry</Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

function AddAdjustmentForm({ month, onAdded }: { month: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [positive, setPositive] = useState(true)
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount."); return }
    mmAddAdjustment({ month, date: mmToday(), amountUSD: positive ? amt : -amt, reason, adminName: "Admin" })
    setAmount(""); setReason(""); setOpen(false); onAdded()
  }

  if (!open) return (
    <Button variant="outline" onClick={() => setOpen(true)} className="w-fit">
      <StickyNote className="h-4 w-4 mr-1.5" /> Manual Adjustment
    </Button>
  )

  return (
    <div className="mm-card border-amber-200 bg-amber-50/30">
      <p className="mm-section-title mb-4">Manual Revenue Adjustment</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPositive(true)} className={cn("rounded-full px-3 py-1 text-xs font-bold transition-colors", positive ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground")}>+ Add</button>
          <button type="button" onClick={() => setPositive(false)} className={cn("rounded-full px-3 py-1 text-xs font-bold transition-colors", !positive ? "bg-red-500 text-white" : "bg-muted text-muted-foreground")}>− Subtract</button>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Amount (USD)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{positive ? "+" : "−"}$</span>
            <Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="pl-8" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Reason</Label>
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Refund issued, bonus credit, correction" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">Apply Adjustment</Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

function SettingsPanel({ settings, onSaved }: { settings: MMSettings; onSaved: (s: MMSettings) => void }) {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState(settings)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    mmSaveSettings(local)
    onSaved(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!open) return (
    <Button variant="outline" onClick={() => setOpen(true)} className="w-fit">
      <Settings className="h-4 w-4 mr-1.5" /> Settings
    </Button>
  )

  return (
    <div className="mm-card border-blue-200 bg-blue-50/20">
      <div className="flex items-center justify-between mb-4">
        <p className="mm-section-title">Tracker Settings</p>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><XCircle className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold">Monthly Revenue Goal ($)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input type="number" min="1" value={local.monthlyGoal} onChange={e => setLocal(s => ({ ...s, monthlyGoal: parseFloat(e.target.value) || 6000 }))} className="pl-7" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
          <Label className="text-xs font-semibold mb-1">Plan Prices (USD)</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { key: "1month",        label: "1 Month"        },
              { key: "3months",       label: "3 Months"       },
              { key: "6months",       label: "6 Months"       },
              { key: "12months",      label: "12 Months"      },
              { key: "featuredListing",label: "Featured"      },
              { key: "bumpedListing", label: "Bumped"         },
              { key: "sponsoredAd",   label: "Sponsored Ad"   },
              { key: "agencyAccount", label: "Agency"         },
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <Label className="text-[10px] text-muted-foreground">{label}</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <Input type="number" min="0" step="0.01"
                    value={(local.planPrices as Record<string, number>)[key]}
                    onChange={e => setLocal(s => ({ ...s, planPrices: { ...s.planPrices, [key]: parseFloat(e.target.value) || 0 } }))}
                    className="pl-5 h-8 text-xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <Button onClick={handleSave} className="bg-foreground text-background hover:bg-foreground/90">Save Settings</Button>
        {saved && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Saved</span>}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MoneyMakerPage() {
  const [month, setMonth] = useState(mmThisMonth())
  const [summary, setSummary] = useState<MMMonthSummary | null>(null)
  const [settings, setSettings] = useState<MMSettings | null>(null)
  const [months, setMonths] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"overview" | "daily" | "calculator" | "metrics">("overview")
  const [seeded, setSeeded] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const refresh = useCallback(() => {
    setSummary(mmGetMonthSummary(month))
    setSettings(mmGetSettings())
    setMonths(mmGetAvailableMonths())
  }, [month])

  useEffect(() => {
    mmSeedDemo()
    setSeeded(true)
    refresh()
  }, [refresh])

  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 4000); return }
    mmResetMonth(month)
    setConfirmReset(false)
    refresh()
  }

  if (!summary || !settings) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm text-muted-foreground">Loading Money Maker Tracker…</p>
    </div>
  )

  const TABS = [
    { id: "overview",   label: "Overview",    icon: DollarSign },
    { id: "daily",      label: "Daily Table", icon: Calendar   },
    { id: "calculator", label: "Calculator",  icon: Target     },
    { id: "metrics",    label: "Key Metrics", icon: BarChart3  },
  ] as const

  return (
    <>
      {/* Isolated CSS for this feature only */}
      <style>{`
        .mm-card {
          border-radius: 10px;
          border: 0.5px solid hsl(var(--border));
          background: hsl(var(--card));
          padding: 1.25rem 1.5rem;
        }
        .mm-label {
          font-size: 11px;
          color: hsl(var(--muted-foreground));
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .mm-section-title {
          font-size: 14px;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
      `}</style>

      <div className="flex flex-col gap-6">

        {/* Page header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <DollarSign className="h-7 w-7 text-emerald-500" />
              Money Maker Tracker
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track monthly revenue progress toward your ${settings.monthlyGoal.toLocaleString()} goal.
              Completely separate from all other analytics systems.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {seeded && <Badge className="bg-amber-100 text-amber-700">Demo data</Badge>}

            {/* Month picker */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select value={month} onChange={e => setMonth(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm">
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
            </Button>

            <Button variant="outline" size="sm" onClick={() => mmExportCSV(month, "full")}>
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>

            <button
              onClick={handleReset}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                confirmReset
                  ? "border-red-400 bg-red-50 text-red-600"
                  : "border-border text-muted-foreground hover:border-red-300 hover:text-red-500"
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmReset ? "Confirm Reset?" : "Reset Month"}
            </button>
          </div>
        </div>

        {/* Main progress card — always visible */}
        <ProgressCard summary={summary} />

        {/* Quick action row */}
        <div className="flex flex-wrap gap-2">
          <AddRevenueForm month={month} onAdded={refresh} />
          <AddAdjustmentForm month={month} onAdded={refresh} />
          {settings && <SettingsPanel settings={settings} onSaved={s => { setSettings(s); refresh() }} />}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted")}>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <CategoryBreakdown summary={summary} />
            <div className="flex flex-col gap-5">
              {/* Monthly projection */}
              <div className="mm-card flex flex-col gap-3">
                <p className="mm-section-title">Monthly Projection</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Projected Revenue",  value: usd(summary.projectedRevenue) },
                    { label: "Goal",               value: usd(summary.goal) },
                    { label: "Projected vs Goal",  value: usd(summary.projectedRevenue - summary.goal) },
                    { label: "Days Elapsed",       value: `${summary.daysElapsed} of ${summary.daysInMonth}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-muted/30 p-3">
                      <p className="mm-label">{label}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent revenue log */}
              <div className="mm-card flex flex-col gap-3">
                <p className="mm-section-title">Recent Revenue Entries</p>
                <div className="flex flex-col gap-2">
                  {mmGetRevenueLogs(month).slice(-8).reverse().map(l => (
                    <div key={l.id} className="flex items-center justify-between text-sm border-b border-border pb-1.5 last:border-0 last:pb-0">
                      <div>
                        <p className="text-xs font-medium text-foreground">{MM_CATEGORY_LABELS[l.category]}</p>
                        <p className="text-[10px] text-muted-foreground">{l.date} · {l.addedBy}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{usd(l.amountUSD)}</span>
                    </div>
                  ))}
                  {mmGetRevenueLogs(month).length === 0 && (
                    <p className="text-xs text-muted-foreground py-3 text-center">No entries yet. Use "Log Revenue" to add entries.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "daily"      && <DailyTable month={month} />}
        {activeTab === "calculator" && <UsersNeededCalc month={month} />}
        {activeTab === "metrics"    && <KeyMetricsPanel month={month} />}

      </div>
    </>
  )
}
