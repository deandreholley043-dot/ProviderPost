// ─── Money Maker Tracker ─────────────────────────────────────────────────────
// COMPLETELY SEPARATE from all existing analytics, stats-store, and reporting.
// Uses its own localStorage keys prefixed with "mm_" — never touches pp_stats_*.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Table keys (isolated namespace) ─────────────────────────────────────────

const MM_KEYS = {
  settings:    "mm_settings",
  revenueLogs: "mm_revenue_logs",
  dailyStats:  "mm_daily_stats",
  adjustments: "mm_manual_adjustments",
  exports:     "mm_exports",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mmLoad<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(key) || "[]") } catch { return [] }
}
function mmSave<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* quota */ }
}
function mmLoadObj<T extends object>(key: string, defaults: T): T {
  if (typeof window === "undefined") return defaults
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(key) || "{}") } } catch { return defaults }
}
function mmSaveObj<T extends object>(key: string, data: T): void {
  if (typeof window === "undefined") return
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* quota */ }
}
function mmUid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
export function mmToday(): string { return new Date().toISOString().slice(0, 10) }
export function mmThisMonth(): string { return new Date().toISOString().slice(0, 7) }
function daysInMonth(yearMonth: string): number {
  const [y, m] = yearMonth.split("-").map(Number)
  return new Date(y, m, 0).getDate()
}
function daysRemainingInMonth(): number {
  const now = new Date()
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return last - now.getDate() + 1
}
function daysElapsedInMonth(): number {
  return new Date().getDate() - 1
}

// ─── Table schemas ─────────────────────────────────────────────────────────────

export interface MMSettings {
  monthlyGoal: number
  currency: string
  resetDayOfMonth: number       // day of month auto-reset happens (default: 1)
  lastResetMonth: string        // YYYY-MM
  planPrices: {
    "1month": number
    "3months": number
    "6months": number
    "12months": number
    featuredListing: number
    bumpedListing: number
    sponsoredAd: number
    agencyAccount: number
    verificationFee: number
    bannerAd: number
  }
}

export type MMRevenueCategory =
  | "membership_1month"
  | "membership_3months"
  | "membership_6months"
  | "membership_12months"
  | "paid_listing"
  | "featured_listing"
  | "bumped_listing"
  | "sponsored_ad"
  | "agency_account"
  | "provider_account"
  | "banner_ad"
  | "verification_fee"
  | "addon_upgrade"
  | "manual_adjustment"

export const MM_CATEGORY_LABELS: Record<MMRevenueCategory, string> = {
  membership_1month:   "Membership – 1 Month",
  membership_3months:  "Membership – 3 Months",
  membership_6months:  "Membership – 6 Months",
  membership_12months: "Membership – 12 Months",
  paid_listing:        "Paid Listing / Post",
  featured_listing:    "Featured Listing",
  bumped_listing:      "Bumped Listing",
  sponsored_ad:        "Sponsored Ad",
  agency_account:      "Agency Account",
  provider_account:    "Provider Account",
  banner_ad:           "Banner Ad",
  verification_fee:    "Verification Fee",
  addon_upgrade:       "Add-on / Upgrade",
  manual_adjustment:   "Manual Adjustment",
}

export const MM_CATEGORY_COLORS: Record<MMRevenueCategory, string> = {
  membership_1month:   "#6366f1",
  membership_3months:  "#8b5cf6",
  membership_6months:  "#a855f7",
  membership_12months: "#d946ef",
  paid_listing:        "#ec4899",
  featured_listing:    "#f43f5e",
  bumped_listing:      "#ef4444",
  sponsored_ad:        "#f97316",
  agency_account:      "#eab308",
  provider_account:    "#84cc16",
  banner_ad:           "#22c55e",
  verification_fee:    "#14b8a6",
  addon_upgrade:       "#06b6d4",
  manual_adjustment:   "#64748b",
}

export interface MMRevenueLog {
  id: string
  month: string                  // YYYY-MM
  date: string                   // YYYY-MM-DD
  category: MMRevenueCategory
  amountUSD: number
  description: string
  userId: string | null
  listingId: string | null
  paymentId: string | null
  addedBy: string                // "system" | "admin"
  note: string
  createdAt: string
}

export interface MMDailyStat {
  date: string                   // YYYY-MM-DD (primary key)
  month: string                  // YYYY-MM
  revenueUSD: number
  newUsers: number
  newPaidUsers: number
  newListings: number
  listingsBumped: number
  featuredAdsPurchased: number
  sponsoredAdsPurchased: number
  creditsAddonsPurchased: number
  adminNote: string
  lastUpdated: string
}

export interface MMManualAdjustment {
  id: string
  month: string
  date: string
  amountUSD: number              // positive = add, negative = subtract
  reason: string
  adminName: string
  createdAt: string
}

export interface MMExport {
  id: string
  month: string
  type: "monthly_summary" | "daily_breakdown" | "category_breakdown" | "full"
  format: "csv" | "json"
  createdAt: string
  rowCount: number
}

// ─── Default settings ─────────────────────────────────────────────────────────

const MM_DEFAULTS: MMSettings = {
  monthlyGoal: 6000,
  currency: "USD",
  resetDayOfMonth: 1,
  lastResetMonth: mmThisMonth(),
  planPrices: {
    "1month":        39.99,
    "3months":       99.99,
    "6months":       179.99,
    "12months":      299.99,
    featuredListing: 19.99,
    bumpedListing:   9.99,
    sponsoredAd:     149.99,
    agencyAccount:   299.99,
    verificationFee: 9.99,
    bannerAd:        99.99,
  },
}

// ─── Settings CRUD ────────────────────────────────────────────────────────────

export function mmGetSettings(): MMSettings {
  return mmLoadObj<MMSettings>(MM_KEYS.settings, MM_DEFAULTS)
}
export function mmSaveSettings(s: MMSettings): void {
  mmSaveObj(MM_KEYS.settings, s)
}

// ─── Revenue logs CRUD ────────────────────────────────────────────────────────

export function mmGetRevenueLogs(month?: string): MMRevenueLog[] {
  const all = mmLoad<MMRevenueLog>(MM_KEYS.revenueLogs)
  return month ? all.filter(l => l.month === month) : all
}

export function mmAddRevenueLog(log: Omit<MMRevenueLog, "id" | "createdAt">): MMRevenueLog {
  const full: MMRevenueLog = { ...log, id: mmUid(), createdAt: new Date().toISOString() }
  const all = mmLoad<MMRevenueLog>(MM_KEYS.revenueLogs)
  all.push(full)
  mmSave(MM_KEYS.revenueLogs, all)
  // Also update the daily stat for that date
  mmUpsertDailyStat(log.date, { revenueUSD: log.amountUSD })
  return full
}

export function mmDeleteRevenueLog(id: string): void {
  mmSave(MM_KEYS.revenueLogs, mmLoad<MMRevenueLog>(MM_KEYS.revenueLogs).filter(l => l.id !== id))
}

// ─── Daily stats CRUD ─────────────────────────────────────────────────────────

export function mmGetDailyStats(month?: string): MMDailyStat[] {
  const all = mmLoad<MMDailyStat>(MM_KEYS.dailyStats)
    .sort((a, b) => b.date.localeCompare(a.date))
  return month ? all.filter(s => s.month === month) : all
}

export function mmUpsertDailyStat(date: string, patch: Partial<MMDailyStat>): void {
  const all = mmLoad<MMDailyStat>(MM_KEYS.dailyStats)
  const idx = all.findIndex(s => s.date === date)
  const existing = idx >= 0 ? all[idx] : {
    date,
    month: date.slice(0, 7),
    revenueUSD: 0,
    newUsers: 0,
    newPaidUsers: 0,
    newListings: 0,
    listingsBumped: 0,
    featuredAdsPurchased: 0,
    sponsoredAdsPurchased: 0,
    creditsAddonsPurchased: 0,
    adminNote: "",
    lastUpdated: new Date().toISOString(),
  }

  const updated: MMDailyStat = {
    ...existing,
    ...patch,
    // Accumulate revenueUSD instead of replacing
    revenueUSD: (patch.revenueUSD !== undefined && idx >= 0)
      ? existing.revenueUSD + patch.revenueUSD
      : (patch.revenueUSD ?? existing.revenueUSD),
    lastUpdated: new Date().toISOString(),
  }

  if (idx >= 0) all[idx] = updated
  else all.push(updated)
  mmSave(MM_KEYS.dailyStats, all)
}

export function mmUpdateDailyNote(date: string, note: string): void {
  mmUpsertDailyStat(date, { adminNote: note } as Partial<MMDailyStat>)
}

// ─── Manual adjustments ───────────────────────────────────────────────────────

export function mmGetAdjustments(month?: string): MMManualAdjustment[] {
  const all = mmLoad<MMManualAdjustment>(MM_KEYS.adjustments)
  return month ? all.filter(a => a.month === month) : all
}

export function mmAddAdjustment(adj: Omit<MMManualAdjustment, "id" | "createdAt">): MMManualAdjustment {
  const full: MMManualAdjustment = { ...adj, id: mmUid(), createdAt: new Date().toISOString() }
  const all = mmLoad<MMManualAdjustment>(MM_KEYS.adjustments)
  all.push(full)
  mmSave(MM_KEYS.adjustments, all)
  // Log as revenue entry
  mmAddRevenueLog({
    month: adj.month,
    date: adj.date,
    category: "manual_adjustment",
    amountUSD: adj.amountUSD,
    description: adj.reason,
    userId: null,
    listingId: null,
    paymentId: null,
    addedBy: "admin",
    note: adj.reason,
  })
  return full
}

// ─── Core calculations ────────────────────────────────────────────────────────

export interface MMMonthSummary {
  month: string
  goal: number
  totalRevenue: number
  progressPct: number
  remaining: number
  dailyAvgActual: number
  dailyAvgNeeded: number
  daysElapsed: number
  daysRemaining: number
  daysInMonth: number
  projectedRevenue: number
  projectedStatus: "ahead" | "on_track" | "warning" | "behind"
  statusColor: "green" | "yellow" | "red"
  byCategory: Record<MMRevenueCategory, number>
  adjustmentsTotal: number
}

export function mmGetMonthSummary(month: string): MMMonthSummary {
  const settings = mmGetSettings()
  const goal = settings.monthlyGoal
  const logs = mmGetRevenueLogs(month)
  const totalRevenue = logs.reduce((s, l) => s + l.amountUSD, 0)
  const adjustmentsTotal = mmGetAdjustments(month).reduce((s, a) => s + a.amountUSD, 0)
  const progressPct = goal > 0 ? Math.min(100, (totalRevenue / goal) * 100) : 0
  const remaining = Math.max(0, goal - totalRevenue)

  const isCurrentMonth = month === mmThisMonth()
  const dims = daysInMonth(month)
  const elapsed = isCurrentMonth ? daysElapsedInMonth() : dims
  const remaining_days = isCurrentMonth ? daysRemainingInMonth() : 0

  const dailyAvgActual = elapsed > 0 ? totalRevenue / elapsed : 0
  const dailyAvgNeeded = remaining_days > 0 ? remaining / remaining_days : 0
  const projectedRevenue = isCurrentMonth
    ? dailyAvgActual * dims
    : totalRevenue

  // Status logic
  let projectedStatus: MMMonthSummary["projectedStatus"] = "on_track"
  let statusColor: MMMonthSummary["statusColor"] = "green"
  const pctOfMonth = isCurrentMonth ? (elapsed / dims) * 100 : 100
  const pctOfGoal = progressPct

  if (projectedRevenue >= goal * 1.05) {
    projectedStatus = "ahead"
    statusColor = "green"
  } else if (pctOfGoal >= pctOfMonth - 5) {
    projectedStatus = "on_track"
    statusColor = "green"
  } else if (pctOfGoal >= pctOfMonth - 15) {
    projectedStatus = "warning"
    statusColor = "yellow"
  } else {
    projectedStatus = "behind"
    statusColor = "red"
  }

  // By category
  const byCategory = {} as Record<MMRevenueCategory, number>
  for (const log of logs) {
    byCategory[log.category] = (byCategory[log.category] || 0) + log.amountUSD
  }

  return {
    month, goal, totalRevenue, progressPct, remaining,
    dailyAvgActual, dailyAvgNeeded,
    daysElapsed: elapsed, daysRemaining: remaining_days, daysInMonth: dims,
    projectedRevenue, projectedStatus, statusColor,
    byCategory, adjustmentsTotal,
  }
}

// ─── Users Needed Calculator ──────────────────────────────────────────────────

export interface MMUsersNeeded {
  plan: string
  price: number
  usersNeeded: number
  currentPaidUsers: number
  stillNeeded: number
}

export function mmCalculateUsersNeeded(month: string, currentPaidUsers = 0): MMUsersNeeded[] {
  const settings = mmGetSettings()
  const summary = mmGetMonthSummary(month)
  const remaining = summary.remaining

  const scenarios: { plan: string; price: number }[] = [
    { plan: "1-Month Membership",    price: settings.planPrices["1month"] },
    { plan: "3-Month Membership",    price: settings.planPrices["3months"] },
    { plan: "6-Month Membership",    price: settings.planPrices["6months"] },
    { plan: "12-Month Membership",   price: settings.planPrices["12months"] },
    { plan: "Featured Listing",      price: settings.planPrices.featuredListing },
    { plan: "Sponsored Ad",          price: settings.planPrices.sponsoredAd },
    { plan: "Agency Account",        price: settings.planPrices.agencyAccount },
    { plan: "Bumped Listing",        price: settings.planPrices.bumpedListing },
  ]

  return scenarios.map(s => {
    const usersNeeded = s.price > 0 ? Math.ceil(summary.goal / s.price) : 0
    const stillNeeded = s.price > 0 ? Math.ceil(remaining / s.price) : 0
    return { plan: s.plan, price: s.price, usersNeeded, currentPaidUsers, stillNeeded }
  })
}

// ─── Key metrics ──────────────────────────────────────────────────────────────

export interface MMKeyMetrics {
  totalUsers: number
  payingUsers: number
  freeUsers: number
  conversionRate: number
  arpu: number
  revenuePerListing: number
  avgOrderValue: number
  mrr: number
  oneTimeRevenue: number
  activePaidListings: number
}

export function mmGetKeyMetrics(month: string): MMKeyMetrics {
  const logs = mmGetRevenueLogs(month)
  const totalRevenue = logs.reduce((s, l) => s + l.amountUSD, 0)
  const daily = mmGetDailyStats(month)

  const totalUsers = daily.reduce((s, d) => s + d.newUsers, 0)
  const payingUsers = daily.reduce((s, d) => s + d.newPaidUsers, 0)
  const freeUsers = Math.max(0, totalUsers - payingUsers)
  const conversionRate = totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0

  const membershipLogs = logs.filter(l => l.category.startsWith("membership"))
  const mrr = membershipLogs.reduce((s, l) => s + l.amountUSD, 0)
  const oneTimeRevenue = totalRevenue - mrr

  const listingLogs = logs.filter(l => ["paid_listing","featured_listing","bumped_listing"].includes(l.category))
  const activePaidListings = daily.reduce((s, d) => s + d.newListings, 0)

  const arpu = totalUsers > 0 ? totalRevenue / totalUsers : 0
  const revenuePerListing = activePaidListings > 0 ? listingLogs.reduce((s,l) => s + l.amountUSD, 0) / activePaidListings : 0
  const avgOrderValue = payingUsers > 0 ? totalRevenue / payingUsers : 0

  return {
    totalUsers, payingUsers, freeUsers, conversionRate,
    arpu, revenuePerListing, avgOrderValue, mrr, oneTimeRevenue, activePaidListings,
  }
}

// ─── Available months ─────────────────────────────────────────────────────────

export function mmGetAvailableMonths(): string[] {
  const logs = mmLoad<MMRevenueLog>(MM_KEYS.revenueLogs)
  const months = new Set<string>(logs.map(l => l.month))
  months.add(mmThisMonth())
  return [...months].sort((a, b) => b.localeCompare(a))
}

// ─── Reset month ──────────────────────────────────────────────────────────────

export function mmResetMonth(month: string): void {
  const logs = mmLoad<MMRevenueLog>(MM_KEYS.revenueLogs)
  mmSave(MM_KEYS.revenueLogs, logs.filter(l => l.month !== month))
  const daily = mmLoad<MMDailyStat>(MM_KEYS.dailyStats)
  mmSave(MM_KEYS.dailyStats, daily.filter(d => d.month !== month))
  const adj = mmLoad<MMManualAdjustment>(MM_KEYS.adjustments)
  mmSave(MM_KEYS.adjustments, adj.filter(a => a.month !== month))
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export function mmExportCSV(month: string, type: "daily" | "category" | "full"): void {
  if (typeof window === "undefined") return

  let rows: Record<string, unknown>[] = []
  let filename = `money-maker-${month}-${type}`

  if (type === "daily") {
    rows = mmGetDailyStats(month).map(d => ({
      Date: d.date,
      Revenue: d.revenueUSD.toFixed(2),
      "New Users": d.newUsers,
      "New Paid Users": d.newPaidUsers,
      "New Listings": d.newListings,
      Bumped: d.listingsBumped,
      Featured: d.featuredAdsPurchased,
      Sponsored: d.sponsoredAdsPurchased,
      "Credits/Add-ons": d.creditsAddonsPurchased,
      Note: d.adminNote,
    }))
  } else if (type === "category") {
    const summary = mmGetMonthSummary(month)
    rows = Object.entries(summary.byCategory).map(([cat, amt]) => ({
      Category: MM_CATEGORY_LABELS[cat as MMRevenueCategory] || cat,
      "Amount USD": amt.toFixed(2),
      "% of Total": summary.totalRevenue > 0 ? ((amt / summary.totalRevenue) * 100).toFixed(1) + "%" : "0%",
    }))
  } else {
    rows = mmGetRevenueLogs(month).map(l => ({
      ID: l.id,
      Date: l.date,
      Category: MM_CATEGORY_LABELS[l.category] || l.category,
      "Amount USD": l.amountUSD.toFixed(2),
      Description: l.description,
      "User ID": l.userId || "",
      "Listing ID": l.listingId || "",
      "Payment ID": l.paymentId || "",
      "Added By": l.addedBy,
      Note: l.note,
    }))
  }

  if (!rows.length) { alert("No data to export for this period."); return }

  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => {
      const v = String(r[h] ?? "").replace(/"/g, '""')
      return v.includes(",") || v.includes('"') ? `"${v}"` : v
    }).join(",")),
  ].join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)

  // Log export
  const exports = mmLoad<MMExport>(MM_KEYS.exports)
  exports.push({ id: mmUid(), month, type: type === "full" ? "full" : type === "daily" ? "daily_breakdown" : "category_breakdown", format: "csv", createdAt: new Date().toISOString(), rowCount: rows.length })
  mmSave(MM_KEYS.exports, exports)
}

// ─── Seed demo data ───────────────────────────────────────────────────────────

export function mmSeedDemo(): void {
  if (typeof window === "undefined") return
  if (mmGetRevenueLogs().length > 0) return // already seeded

  const month = mmThisMonth()
  const today = new Date()
  const categories: MMRevenueCategory[] = [
    "membership_1month","membership_3months","membership_6months","membership_12months",
    "featured_listing","bumped_listing","sponsored_ad","provider_account","verification_fee","addon_upgrade",
  ]
  const amounts = [39.99, 99.99, 179.99, 299.99, 19.99, 9.99, 149.99, 39.99, 9.99, 29.99]

  // Seed 20 days of revenue logs
  for (let i = 0; i < Math.min(today.getDate() - 1, 20); i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), i + 1)
    const dateStr = d.toISOString().slice(0, 10)
    const numTxns = Math.floor(Math.random() * 6) + 1

    for (let j = 0; j < numTxns; j++) {
      const catIdx = Math.floor(Math.random() * categories.length)
      const all = mmLoad<MMRevenueLog>(MM_KEYS.revenueLogs)
      all.push({
        id: mmUid(),
        month,
        date: dateStr,
        category: categories[catIdx],
        amountUSD: amounts[catIdx],
        description: MM_CATEGORY_LABELS[categories[catIdx]],
        userId: `user-${Math.floor(Math.random() * 20) + 1}`,
        listingId: null,
        paymentId: `pay-${mmUid()}`,
        addedBy: "system",
        note: "",
        createdAt: d.toISOString(),
      })
      mmSave(MM_KEYS.revenueLogs, all)
    }

    // Seed daily stat
    mmUpsertDailyStat(dateStr, {
      revenueUSD: 0, // will be overwritten by revenue sum
      newUsers: Math.floor(Math.random() * 8) + 1,
      newPaidUsers: Math.floor(Math.random() * 4) + 1,
      newListings: Math.floor(Math.random() * 5) + 1,
      listingsBumped: Math.floor(Math.random() * 3),
      featuredAdsPurchased: Math.floor(Math.random() * 2),
      sponsoredAdsPurchased: Math.floor(Math.random() * 2),
      creditsAddonsPurchased: Math.floor(Math.random() * 3),
      adminNote: i === 4 ? "Holiday weekend — lower traffic expected" : "",
    } as Partial<MMDailyStat>)
  }

  // Recalculate daily revenue from logs
  const logs = mmGetRevenueLogs(month)
  const byDate: Record<string, number> = {}
  for (const l of logs) { byDate[l.date] = (byDate[l.date] || 0) + l.amountUSD }
  for (const [date, rev] of Object.entries(byDate)) {
    const all = mmLoad<MMDailyStat>(MM_KEYS.dailyStats)
    const idx = all.findIndex(s => s.date === date)
    if (idx >= 0) { all[idx].revenueUSD = rev; mmSave(MM_KEYS.dailyStats, all) }
  }
}

export { mmUid, daysRemainingInMonth, daysInMonth }
