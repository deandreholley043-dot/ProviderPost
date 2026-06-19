// ─── ProviderPost Stats & Intelligence Engine ────────────────────────────────
// Separate layer — does NOT modify any existing lib, component, or route.
// In production replace localStorage persistence with direct DB queries.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Utility ──────────────────────────────────────────────────────────────────

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function now(): string { return new Date().toISOString() }

function today(): string { return new Date().toISOString().slice(0, 10) }

function hashStr(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, "0")
}

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(key) || "[]") } catch { return [] }
}

function save<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* quota */ }
}

function loadObj<T extends object>(key: string, defaults: T): T {
  if (typeof window === "undefined") return defaults
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(key) || "{}") } } catch { return defaults }
}

function saveObj<T extends object>(key: string, data: T): void {
  if (typeof window === "undefined") return
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* quota */ }
}

// ─── Table keys ───────────────────────────────────────────────────────────────

const K = {
  visitors:          "pp_stats_visitors",
  sessions:          "pp_stats_sessions",
  pageViews:         "pp_stats_page_views",
  events:            "pp_stats_events",
  userStats:         "pp_stats_user_stats",
  listingStats:      "pp_stats_listing_stats",
  paymentStats:      "pp_stats_payment_stats",
  moderationLogs:    "pp_stats_moderation_logs",
  securityEvents:    "pp_stats_security_events",
  blockedIPs:        "pp_stats_blocked_ips",
  blockedDevices:    "pp_stats_blocked_devices",
  deviceFingerprints:"pp_stats_device_fingerprints",
  mediaStats:        "pp_stats_media_stats",
  messageStats:      "pp_stats_message_stats",
  revenueDaily:      "pp_stats_revenue_daily",
  revenueMonthly:    "pp_stats_revenue_monthly",
  geoStats:          "pp_stats_geo_stats",
  adminAuditLogs:    "pp_stats_admin_audit_logs",
  alerts:            "pp_stats_alerts",
  reportExports:     "pp_stats_report_exports",
  privacySettings:   "pp_stats_privacy_settings",
}

// ─── Table schemas ─────────────────────────────────────────────────────────────

export interface Visitor {
  id: string
  hashedIp: string
  sessionId: string
  cookieId: string
  userAgent: string
  uaFingerprint: string
  deviceType: "desktop" | "mobile" | "tablet"
  browser: string
  os: string
  screenSize: string
  language: string
  country: string
  state: string
  region: string
  city: string
  lat: number
  lng: number
  referrer: string
  entryPage: string
  exitPage: string
  firstSeen: string
  lastSeen: string
  totalVisits: number
  isReturning: boolean
}

export interface Session {
  id: string
  visitorId: string
  userId: string | null
  startedAt: string
  endedAt: string | null
  pageCount: number
  duration: number
  bounced: boolean
  entryPage: string
  exitPage: string
  device: string
  scrollDepth: number
}

export interface PageView {
  id: string
  sessionId: string
  visitorId: string
  userId: string | null
  url: string
  title: string
  referrer: string
  timeOnPage: number
  scrollDepth: number
  clickCount: number
  timestamp: string
}

export interface TrackedEvent {
  id: string
  sessionId: string
  visitorId: string
  userId: string | null
  type: "click" | "page_view" | "form_submit" | "contact" | "phone_click" | "whatsapp_click" | "wechat_click" | "favorite" | "share" | "search" | "payment" | "login" | "logout" | "register" | "upload" | "message" | "report" | "ad_view" | "ad_impression" | "bump" | "custom"
  target: string
  value: string
  listingId: string | null
  page: string
  timestamp: string
  meta: Record<string, string>
}

export interface UserStat {
  userId: string
  username: string
  email: string
  accountType: string
  registeredAt: string
  lastLoginAt: string
  loginCount: number
  failedLoginCount: number
  passwordResets: number
  verified: boolean
  banned: boolean
  shadowBanned: boolean
  riskScore: number
  activityScore: number
  adsCreated: number
  adsApproved: number
  adsRejected: number
  adsEdits: number
  renewals: number
  favoritesCount: number
  messagesSent: number
  messagesReceived: number
  photosUploaded: number
  videosUploaded: number
  reportsReceived: number
  reportsSubmitted: number
  totalSpentUSD: number
  membershipPlan: string
  membershipStart: string | null
  membershipEnd: string | null
  freeDaysEarned: number
  rewardsEarned: number
  cryptoPaidBTC: number
  cryptoPaidETH: number
  cryptoPaidSOL: number
  cryptoPaidXRP: number
  usdEquivalentPaid: number
  updatedAt: string
}

export interface ListingStat {
  listingId: string
  ownerUserId: string
  accountType: string
  category: string
  ethnicity: string
  region: string
  state: string
  city: string
  publishedAt: string
  expiresAt: string | null
  status: "draft" | "pending" | "approved" | "rejected" | "expired" | "hidden" | "banned"
  impressionsTotal: number
  impressionsUnique: number
  pageViews: number
  contactClicks: number
  phoneClicks: number
  websiteClicks: number
  whatsappClicks: number
  wechatClicks: number
  favoritesSaved: number
  shares: number
  reportsTotal: number
  timeActiveDays: number
  searchAppearances: number
  searchCTR: number
  conversionEvents: number
  bumpCount: number
  topSources: string[]
  topCities: string[]
  topDevices: string[]
  riskScore: number
  updatedAt: string
}

export interface PaymentStat {
  paymentId: string
  userId: string
  listingId: string | null
  coin: string
  amountCrypto: number
  amountUSD: number
  network: string
  processorStatus: "pending" | "confirmed" | "failed" | "refunded" | "expired"
  walletDestination: string
  invoiceCreatedAt: string
  invoicePaidAt: string | null
  invoiceExpiresAt: string
  plan: string
  discountSource: string
  discountAmountUSD: number
  adminAdjusted: boolean
  adminNote: string
}

export interface ModerationLog {
  id: string
  adminId: string
  adminName: string
  action: "approve" | "reject" | "ban" | "unban" | "delete" | "edit" | "flag" | "unflag" | "shadow_ban" | "note" | "override"
  targetType: "listing" | "user" | "media" | "payment" | "comment"
  targetId: string
  reason: string
  previousValue: string
  newValue: string
  notes: string
  timestamp: string
}

export interface SecurityEvent {
  id: string
  type: "failed_login" | "ip_blocked" | "device_blocked" | "spam_trigger" | "duplicate_content" | "rapid_posting" | "vpn_detected" | "country_mismatch" | "bot_behavior" | "multiple_accounts" | "flagged_payment" | "blacklisted_wallet" | "phone_reuse" | "image_hash_match"
  severity: "low" | "medium" | "high" | "critical"
  hashedIp: string
  rawIp: string
  userId: string | null
  deviceFingerprint: string
  description: string
  resolved: boolean
  riskScore: number
  timestamp: string
  meta: Record<string, string>
}

export interface BlockedIP {
  id: string
  ip: string
  hashedIp: string
  reason: string
  blockedBy: string
  blockedAt: string
  expiresAt: string | null
  permanent: boolean
  country: string
  hitCount: number
}

export interface BlockedDevice {
  id: string
  fingerprint: string
  reason: string
  blockedBy: string
  blockedAt: string
  permanent: boolean
  lastSeen: string
}

export interface DeviceFingerprint {
  id: string
  fingerprint: string
  userAgent: string
  screen: string
  language: string
  timezone: string
  platform: string
  linkedUserIds: string[]
  linkedIPs: string[]
  firstSeen: string
  lastSeen: string
  riskScore: number
}

export interface MediaStat {
  id: string
  userId: string
  listingId: string | null
  mediaType: "photo" | "video"
  filename: string
  sizeBytes: number
  region: string
  device: string
  uploadedAt: string
  status: "pending" | "approved" | "rejected" | "duplicate"
  views: number
  shares: number
  reports: number
  imageHash: string | null
}

export interface MessageStat {
  id: string
  senderId: string
  receiverId: string
  hasAttachment: boolean
  attachmentType: "photo" | "video" | "none"
  attachmentSizeBytes: number
  sentAt: string
  readAt: string | null
  deleted: boolean
  reported: boolean
  responseTimeMs: number | null
}

export interface RevenueDaily {
  date: string
  totalUSD: number
  byPlan: Record<string, number>
  byCoin: Record<string, number>
  byRegion: Record<string, number>
  newSubscriptions: number
  renewals: number
  refunds: number
  discounts: number
  pending: number
  failed: number
}

export interface RevenueMonthly {
  month: string
  totalUSD: number
  targetUSD: number
  byPlan: Record<string, number>
  byCoin: Record<string, number>
  byRegion: Record<string, number>
  avgRevenuePerUser: number
  avgRevenuePerPayingUser: number
  newPayingUsers: number
  totalPayingUsers: number
  refunds: number
}

export interface GeoStat {
  country: string
  state: string
  city: string
  lat: number
  lng: number
  visitors: number
  users: number
  listingViews: number
  revenue: number
  spamAttempts: number
  flaggedAccounts: number
  updatedAt: string
}

export interface AdminAuditLog {
  id: string
  adminId: string
  adminName: string
  action: string
  resource: string
  resourceId: string
  previousValue: string
  newValue: string
  ipAddress: string
  timestamp: string
}

export interface StatsAlert {
  id: string
  type: "traffic_spike" | "login_attack" | "payment_failure" | "posting_burst" | "ip_cluster" | "high_risk_listing" | "spam_match" | "conversion_drop" | "processor_issue" | "storage_limit"
  severity: "info" | "warning" | "critical"
  title: string
  message: string
  read: boolean
  resolved: boolean
  createdAt: string
  meta: Record<string, string>
}

export interface ReportExport {
  id: string
  requestedBy: string
  reportType: string
  format: "csv" | "excel" | "pdf"
  status: "pending" | "ready" | "failed"
  createdAt: string
  downloadUrl: string | null
  rowCount: number
}

export interface PrivacySettings {
  retentionDays: number
  anonymizeIPs: boolean
  hashEmails: boolean
  allowDataExport: boolean
  allowDataDelete: boolean
}

// ─── Table accessors ──────────────────────────────────────────────────────────

export const db = {
  visitors:          { all: () => load<Visitor>(K.visitors),           save: (d: Visitor[]) => save(K.visitors, d) },
  sessions:          { all: () => load<Session>(K.sessions),           save: (d: Session[]) => save(K.sessions, d) },
  pageViews:         { all: () => load<PageView>(K.pageViews),         save: (d: PageView[]) => save(K.pageViews, d) },
  events:            { all: () => load<TrackedEvent>(K.events),        save: (d: TrackedEvent[]) => save(K.events, d) },
  userStats:         { all: () => load<UserStat>(K.userStats),         save: (d: UserStat[]) => save(K.userStats, d) },
  listingStats:      { all: () => load<ListingStat>(K.listingStats),   save: (d: ListingStat[]) => save(K.listingStats, d) },
  paymentStats:      { all: () => load<PaymentStat>(K.paymentStats),   save: (d: PaymentStat[]) => save(K.paymentStats, d) },
  moderationLogs:    { all: () => load<ModerationLog>(K.moderationLogs), save: (d: ModerationLog[]) => save(K.moderationLogs, d) },
  securityEvents:    { all: () => load<SecurityEvent>(K.securityEvents), save: (d: SecurityEvent[]) => save(K.securityEvents, d) },
  blockedIPs:        { all: () => load<BlockedIP>(K.blockedIPs),       save: (d: BlockedIP[]) => save(K.blockedIPs, d) },
  blockedDevices:    { all: () => load<BlockedDevice>(K.blockedDevices), save: (d: BlockedDevice[]) => save(K.blockedDevices, d) },
  deviceFingerprints:{ all: () => load<DeviceFingerprint>(K.deviceFingerprints), save: (d: DeviceFingerprint[]) => save(K.deviceFingerprints, d) },
  mediaStats:        { all: () => load<MediaStat>(K.mediaStats),       save: (d: MediaStat[]) => save(K.mediaStats, d) },
  messageStats:      { all: () => load<MessageStat>(K.messageStats),   save: (d: MessageStat[]) => save(K.messageStats, d) },
  revenueDaily:      { all: () => load<RevenueDaily>(K.revenueDaily),  save: (d: RevenueDaily[]) => save(K.revenueDaily, d) },
  revenueMonthly:    { all: () => load<RevenueMonthly>(K.revenueMonthly), save: (d: RevenueMonthly[]) => save(K.revenueMonthly, d) },
  geoStats:          { all: () => load<GeoStat>(K.geoStats),           save: (d: GeoStat[]) => save(K.geoStats, d) },
  adminAuditLogs:    { all: () => load<AdminAuditLog>(K.adminAuditLogs), save: (d: AdminAuditLog[]) => save(K.adminAuditLogs, d) },
  alerts:            { all: () => load<StatsAlert>(K.alerts),          save: (d: StatsAlert[]) => save(K.alerts, d) },
  reportExports:     { all: () => load<ReportExport>(K.reportExports), save: (d: ReportExport[]) => save(K.reportExports, d) },
  privacy:           { get: () => loadObj<PrivacySettings>(K.privacySettings, { retentionDays: 365, anonymizeIPs: false, hashEmails: true, allowDataExport: true, allowDataDelete: true }), save: (d: PrivacySettings) => saveObj(K.privacySettings, d) },
}

// ─── Event ingestion ──────────────────────────────────────────────────────────

export function ingestEvent(event: Omit<TrackedEvent, "id">): TrackedEvent {
  const full: TrackedEvent = { id: uid(), ...event }
  const events = db.events.all()
  events.push(full)
  // Keep last 10,000 events in localStorage (production: stream to DB)
  if (events.length > 10000) events.splice(0, events.length - 10000)
  db.events.save(events)
  return full
}

export function logSecurityEvent(event: Omit<SecurityEvent, "id">): SecurityEvent {
  const full: SecurityEvent = { id: uid(), ...event }
  const events = db.securityEvents.all()
  events.push(full)
  if (events.length > 5000) events.splice(0, events.length - 5000)
  db.securityEvents.save(events)
  // Auto-generate alert for high/critical events
  if (event.severity === "high" || event.severity === "critical") {
    createAlert({
      type: "login_attack",
      severity: event.severity === "critical" ? "critical" : "warning",
      title: `Security: ${event.type.replace(/_/g, " ")}`,
      message: event.description,
      read: false,
      resolved: false,
      meta: { hashedIp: event.hashedIp, userId: event.userId || "" },
    })
  }
  return full
}

export function logModerationAction(log: Omit<ModerationLog, "id">): ModerationLog {
  const full: ModerationLog = { id: uid(), ...log }
  const logs = db.moderationLogs.all()
  logs.push(full)
  if (logs.length > 5000) logs.splice(0, logs.length - 5000)
  db.moderationLogs.save(logs)
  return full
}

export function logAdminAudit(log: Omit<AdminAuditLog, "id">): AdminAuditLog {
  const full: AdminAuditLog = { id: uid(), ...log }
  const logs = db.adminAuditLogs.all()
  logs.push(full)
  db.adminAuditLogs.save(logs)
  return full
}

export function createAlert(alert: Omit<StatsAlert, "id" | "createdAt">): StatsAlert {
  const full: StatsAlert = { id: uid(), createdAt: now(), ...alert }
  const alerts = db.alerts.all()
  alerts.unshift(full)
  if (alerts.length > 200) alerts.splice(200)
  db.alerts.save(alerts)
  return full
}

// ─── Listing stat helpers ─────────────────────────────────────────────────────

export function getOrCreateListingStat(listingId: string, defaults: Partial<ListingStat> = {}): ListingStat {
  const stats = db.listingStats.all()
  const existing = stats.find((s) => s.listingId === listingId)
  if (existing) return existing
  const newStat: ListingStat = {
    listingId,
    ownerUserId: "",
    accountType: "provider",
    category: "",
    ethnicity: "",
    region: "",
    state: "",
    city: "",
    publishedAt: now(),
    expiresAt: null,
    status: "pending",
    impressionsTotal: 0,
    impressionsUnique: 0,
    pageViews: 0,
    contactClicks: 0,
    phoneClicks: 0,
    websiteClicks: 0,
    whatsappClicks: 0,
    wechatClicks: 0,
    favoritesSaved: 0,
    shares: 0,
    reportsTotal: 0,
    timeActiveDays: 0,
    searchAppearances: 0,
    searchCTR: 0,
    conversionEvents: 0,
    bumpCount: 0,
    topSources: [],
    topCities: [],
    topDevices: [],
    riskScore: 0,
    updatedAt: now(),
    ...defaults,
  }
  stats.push(newStat)
  db.listingStats.save(stats)
  return newStat
}

export function incrementListingStat(listingId: string, field: keyof ListingStat, by = 1): void {
  const stats = db.listingStats.all()
  const idx = stats.findIndex((s) => s.listingId === listingId)
  if (idx === -1) return
  const val = stats[idx][field]
  if (typeof val === "number") {
    ;(stats[idx] as unknown as Record<string, unknown>)[field] = val + by
    stats[idx].updatedAt = now()
    db.listingStats.save(stats)
  }
}

// ─── Revenue helpers ──────────────────────────────────────────────────────────

export function recordPayment(payment: Omit<PaymentStat, "">): void {
  const payments = db.paymentStats.all()
  payments.push(payment)
  db.paymentStats.save(payments)

  // Update daily revenue
  const d = payment.invoicePaidAt?.slice(0, 10) || today()
  const dailies = db.revenueDaily.all()
  let daily = dailies.find((x) => x.date === d)
  if (!daily) {
    daily = { date: d, totalUSD: 0, byPlan: {}, byCoin: {}, byRegion: {}, newSubscriptions: 0, renewals: 0, refunds: 0, discounts: 0, pending: 0, failed: 0 }
    dailies.push(daily)
  }
  if (payment.processorStatus === "confirmed") {
    daily.totalUSD += payment.amountUSD
    daily.byPlan[payment.plan] = (daily.byPlan[payment.plan] || 0) + payment.amountUSD
    daily.byCoin[payment.coin] = (daily.byCoin[payment.coin] || 0) + payment.amountUSD
    daily.newSubscriptions++
  } else if (payment.processorStatus === "failed") {
    daily.failed++
  } else if (payment.processorStatus === "pending") {
    daily.pending++
  }
  daily.discounts += payment.discountAmountUSD
  db.revenueDaily.save(dailies)
}

// ─── Aggregation queries ──────────────────────────────────────────────────────

export function getOverviewStats() {
  const events = db.events.all()
  const sessions = db.sessions.all()
  const visitors = db.visitors.all()
  const users = db.userStats.all()
  const listings = db.listingStats.all()
  const payments = db.paymentStats.all()
  const alerts = db.alerts.all()
  const security = db.securityEvents.all()
  const todayStr = today()

  const todayEvents = events.filter((e) => e.timestamp.startsWith(todayStr))
  const todaySessions = sessions.filter((s) => s.startedAt.startsWith(todayStr))
  const confirmedPayments = payments.filter((p) => p.processorStatus === "confirmed")
  const todayPayments = confirmedPayments.filter((p) => (p.invoicePaidAt || "").startsWith(todayStr))
  const pendingListings = listings.filter((l) => l.status === "pending").length
  const flaggedListings = listings.filter((l) => l.status === "hidden" || l.riskScore > 70).length
  const unreadAlerts = alerts.filter((a) => !a.read).length

  const bounced = sessions.filter((s) => s.bounced)
  const bounceRate = sessions.length > 0 ? ((bounced.length / sessions.length) * 100).toFixed(1) : "0"
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((s, x) => s + (x.duration || 0), 0) / sessions.length)
    : 0

  return {
    totalVisitors: visitors.length,
    uniqueVisitors: new Set(visitors.map((v) => v.hashedIp)).size,
    returningVisitors: visitors.filter((v) => v.isReturning).length,
    totalSessions: sessions.length,
    totalPageViews: db.pageViews.all().length,
    todaySessions: todaySessions.length,
    bounceRate,
    avgSessionDuration: avgDuration,
    totalUsers: users.length,
    activeUsers: users.filter((u) => !u.banned).length,
    bannedUsers: users.filter((u) => u.banned).length,
    totalListings: listings.length,
    pendingListings,
    flaggedListings,
    approvedListings: listings.filter((l) => l.status === "approved").length,
    revenueToday: todayPayments.reduce((s, p) => s + p.amountUSD, 0),
    revenueTotal: confirmedPayments.reduce((s, p) => s + p.amountUSD, 0),
    pendingPayments: payments.filter((p) => p.processorStatus === "pending").length,
    failedPayments: payments.filter((p) => p.processorStatus === "failed").length,
    unreadAlerts,
    criticalAlerts: alerts.filter((a) => a.severity === "critical" && !a.resolved).length,
    securityEventsToday: security.filter((e) => e.timestamp.startsWith(todayStr)).length,
    blockedIPs: db.blockedIPs.all().length,
  }
}

export function getTop20Listings(by: "pageViews" | "contactClicks" | "impressionsTotal" | "favoritesSaved") {
  return db.listingStats.all()
    .sort((a, b) => b[by] - a[by])
    .slice(0, 20)
}

export function getTop20ByLocation() {
  const geo = db.geoStats.all()
  return {
    byTraffic:  [...geo].sort((a, b) => b.visitors - a.visitors).slice(0, 20),
    byRevenue:  [...geo].sort((a, b) => b.revenue - a.revenue).slice(0, 20),
    byAdViews:  [...geo].sort((a, b) => b.listingViews - a.listingViews).slice(0, 20),
    bySuspicious: [...geo].sort((a, b) => b.spamAttempts - a.spamAttempts).slice(0, 20),
  }
}

export function getMoneyMakerStats(targetMonthlyUSD = 6000) {
  const payments = db.paymentStats.all().filter((p) => p.processorStatus === "confirmed")
  const users = db.userStats.all()
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthPayments = payments.filter((p) => (p.invoicePaidAt || "").startsWith(thisMonth))
  const totalThisMonth = monthPayments.reduce((s, p) => s + p.amountUSD, 0)
  const payingUsers = [...new Set(payments.map((p) => p.userId))]
  const avgRPU = users.length > 0 ? (payments.reduce((s, p) => s + p.amountUSD, 0) / users.length) : 0
  const avgRPPU = payingUsers.length > 0 ? (payments.reduce((s, p) => s + p.amountUSD, 0) / payingUsers.length) : 0
  const usersNeeded = avgRPPU > 0 ? Math.ceil((targetMonthlyUSD - totalThisMonth) / avgRPPU) : 0

  const byCoin: Record<string, number> = {}
  const byPlan: Record<string, number> = {}
  for (const p of payments) {
    byCoin[p.coin] = (byCoin[p.coin] || 0) + p.amountUSD
    byPlan[p.plan] = (byPlan[p.plan] || 0) + p.amountUSD
  }

  // Top customers
  const byUser: Record<string, number> = {}
  for (const p of payments) byUser[p.userId] = (byUser[p.userId] || 0) + p.amountUSD
  const topCustomers = Object.entries(byUser)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([userId, total]) => ({ userId, total }))

  return {
    totalThisMonth,
    targetMonthlyUSD,
    progressPct: Math.min(100, (totalThisMonth / targetMonthlyUSD) * 100),
    usersNeeded: Math.max(0, usersNeeded),
    avgRevenuePerUser: avgRPU,
    avgRevenuePerPayingUser: avgRPPU,
    totalPayingUsers: payingUsers.length,
    byCoin,
    byPlan,
    topCustomers,
    refunds: payments.filter((p) => p.processorStatus === "refunded").reduce((s, p) => s + p.amountUSD, 0),
  }
}

// ─── Risk scoring ─────────────────────────────────────────────────────────────

export function calculateUserRiskScore(userId: string): number {
  const security = db.securityEvents.all().filter((e) => e.userId === userId)
  const user = db.userStats.all().find((u) => u.userId === userId)
  if (!user) return 0

  let score = 0
  score += Math.min(30, user.failedLoginCount * 5)
  score += security.filter((e) => e.type === "rapid_posting").length * 10
  score += security.filter((e) => e.type === "duplicate_content").length * 15
  score += security.filter((e) => e.type === "multiple_accounts").length * 20
  score += security.filter((e) => e.type === "vpn_detected").length * 5
  score += user.reportsReceived * 3
  return Math.min(100, score)
}

// ─── Export helpers ───────────────────────────────────────────────────────────

export function exportCSV(rows: Record<string, unknown>[], filename: string): void {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => {
      const v = String(r[h] ?? "").replace(/"/g, '""')
      return v.includes(",") || v.includes('"') ? `"${v}"` : v
    }).join(",")),
  ].join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}-${today()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}-${today()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Seed demo data ───────────────────────────────────────────────────────────
// Only seeds if tables are empty — lets admin see the UI in action.

export function seedDemoData(): void {
  if (typeof window === "undefined") return
  if (db.events.all().length > 0) return // already seeded

  const cities = ["Austin TX","Miami FL","Los Angeles CA","Chicago IL","New York NY","Houston TX","Phoenix AZ","Toronto ON","Vancouver BC","Montreal QC"]
  const plans  = ["1month","3months","6months","12months"]
  const coins  = ["btc","eth","sol","xrp"]
  const devices = ["mobile","desktop","tablet"]
  const now_   = new Date()

  // Seed geo stats
  const geoData: GeoStat[] = cities.map((c) => {
    const [city, stateCode] = c.split(" ")
    return {
      country: stateCode === "ON" || stateCode === "BC" || stateCode === "QC" ? "CA" : "US",
      state: stateCode, city,
      lat: 25 + Math.random() * 25, lng: -120 + Math.random() * 80,
      visitors: Math.floor(Math.random() * 2000) + 100,
      users: Math.floor(Math.random() * 400) + 20,
      listingViews: Math.floor(Math.random() * 5000) + 200,
      revenue: Math.floor(Math.random() * 3000) + 100,
      spamAttempts: Math.floor(Math.random() * 30),
      flaggedAccounts: Math.floor(Math.random() * 10),
      updatedAt: now(),
    }
  })
  db.geoStats.save(geoData)

  // Seed listing stats
  const listingData: ListingStat[] = Array.from({ length: 24 }, (_, i) => {
    const city = cities[i % cities.length].split(" ")[0]
    const state = cities[i % cities.length].split(" ")[1]
    return {
      listingId: `listing-${i + 1}`,
      ownerUserId: `user-${(i % 8) + 1}`,
      accountType: "provider",
      category: ["incall","both"][i % 2],
      ethnicity: ["Ebony","White","Latin","Asian","Mixed"][i % 5],
      region: state,
      state,
      city,
      publishedAt: new Date(now_.getTime() - Math.random() * 90 * 86400000).toISOString(),
      expiresAt: new Date(now_.getTime() + Math.random() * 30 * 86400000).toISOString(),
      status: ["approved","approved","approved","pending","approved"][i % 5] as ListingStat["status"],
      impressionsTotal: Math.floor(Math.random() * 5000) + 100,
      impressionsUnique: Math.floor(Math.random() * 2000) + 50,
      pageViews: Math.floor(Math.random() * 1500) + 30,
      contactClicks: Math.floor(Math.random() * 200) + 5,
      phoneClicks: Math.floor(Math.random() * 150) + 3,
      websiteClicks: Math.floor(Math.random() * 50),
      whatsappClicks: Math.floor(Math.random() * 100) + 2,
      wechatClicks: Math.floor(Math.random() * 40),
      favoritesSaved: Math.floor(Math.random() * 80) + 1,
      shares: Math.floor(Math.random() * 30),
      reportsTotal: Math.floor(Math.random() * 5),
      timeActiveDays: Math.floor(Math.random() * 60) + 1,
      searchAppearances: Math.floor(Math.random() * 3000) + 100,
      searchCTR: Math.random() * 15,
      conversionEvents: Math.floor(Math.random() * 50),
      bumpCount: Math.floor(Math.random() * 10),
      topSources: ["direct","google","bing"],
      topCities: [city],
      topDevices: ["mobile","desktop"],
      riskScore: Math.floor(Math.random() * 40),
      updatedAt: now(),
    }
  })
  db.listingStats.save(listingData)

  // Seed user stats
  const userData: UserStat[] = Array.from({ length: 12 }, (_, i) => ({
    userId: `user-${i + 1}`,
    username: `provider${i + 1}`,
    email: `user${i + 1}@example.com`,
    accountType: i < 8 ? "provider" : "hobbyist",
    registeredAt: new Date(now_.getTime() - Math.random() * 180 * 86400000).toISOString(),
    lastLoginAt: new Date(now_.getTime() - Math.random() * 7 * 86400000).toISOString(),
    loginCount: Math.floor(Math.random() * 50) + 1,
    failedLoginCount: Math.floor(Math.random() * 5),
    passwordResets: Math.floor(Math.random() * 2),
    verified: Math.random() > 0.3,
    banned: Math.random() > 0.9,
    shadowBanned: false,
    riskScore: Math.floor(Math.random() * 60),
    activityScore: Math.floor(Math.random() * 100),
    adsCreated: Math.floor(Math.random() * 5) + 1,
    adsApproved: Math.floor(Math.random() * 4) + 1,
    adsRejected: Math.floor(Math.random() * 2),
    adsEdits: Math.floor(Math.random() * 10),
    renewals: Math.floor(Math.random() * 4),
    favoritesCount: Math.floor(Math.random() * 20),
    messagesSent: Math.floor(Math.random() * 30),
    messagesReceived: Math.floor(Math.random() * 25),
    photosUploaded: Math.floor(Math.random() * 20) + 1,
    videosUploaded: Math.floor(Math.random() * 5),
    reportsReceived: Math.floor(Math.random() * 3),
    reportsSubmitted: Math.floor(Math.random() * 2),
    totalSpentUSD: Math.floor(Math.random() * 600),
    membershipPlan: plans[i % 4],
    membershipStart: new Date(now_.getTime() - Math.random() * 60 * 86400000).toISOString(),
    membershipEnd: new Date(now_.getTime() + Math.random() * 30 * 86400000).toISOString(),
    freeDaysEarned: Math.floor(Math.random() * 14),
    rewardsEarned: Math.floor(Math.random() * 50),
    cryptoPaidBTC: Math.random() * 0.01,
    cryptoPaidETH: Math.random() * 0.1,
    cryptoPaidSOL: Math.random() * 2,
    cryptoPaidXRP: Math.random() * 100,
    usdEquivalentPaid: Math.floor(Math.random() * 600),
    updatedAt: now(),
  }))
  db.userStats.save(userData)

  // Seed payments
  const paymentData: PaymentStat[] = Array.from({ length: 18 }, (_, i) => {
    const amtUSD = [39.99, 99.99, 179.99, 299.99][i % 4]
    const paidAt = new Date(now_.getTime() - Math.random() * 60 * 86400000)
    return {
      paymentId: `pay-${uid().slice(0, 8)}`,
      userId: `user-${(i % 8) + 1}`,
      listingId: `listing-${(i % 12) + 1}`,
      coin: coins[i % 4],
      amountCrypto: amtUSD / [45000, 2500, 100, 0.5][i % 4],
      amountUSD: amtUSD,
      network: ["bitcoin","ethereum","solana","xrp"][i % 4],
      processorStatus: (["confirmed","confirmed","confirmed","confirmed","pending","failed"] as PaymentStat["processorStatus"][])[i % 6],
      walletDestination: `wallet-${(i % 3) + 1}`,
      invoiceCreatedAt: new Date(paidAt.getTime() - 3600000).toISOString(),
      invoicePaidAt: i % 6 < 4 ? paidAt.toISOString() : null,
      invoiceExpiresAt: new Date(paidAt.getTime() + 3600000).toISOString(),
      plan: plans[i % 4],
      discountSource: i % 5 === 0 ? "promo-code" : "",
      discountAmountUSD: i % 5 === 0 ? 10 : 0,
      adminAdjusted: false,
      adminNote: "",
    }
  })
  db.paymentStats.save(paymentData)

  // Seed revenue daily for last 30 days
  const dailyData: RevenueDaily[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now_.getTime() - i * 86400000)
    const amt = Math.floor(Math.random() * 400) + 50
    return {
      date: d.toISOString().slice(0, 10),
      totalUSD: amt,
      byPlan: { "1month": amt * 0.3, "3months": amt * 0.25, "6months": amt * 0.25, "12months": amt * 0.2 },
      byCoin: { btc: amt * 0.4, eth: amt * 0.3, sol: amt * 0.2, xrp: amt * 0.1 },
      byRegion: { TX: amt * 0.3, FL: amt * 0.2, CA: amt * 0.25, IL: amt * 0.1, NY: amt * 0.15 },
      newSubscriptions: Math.floor(Math.random() * 5) + 1,
      renewals: Math.floor(Math.random() * 3),
      refunds: Math.random() > 0.8 ? Math.floor(Math.random() * 2) : 0,
      discounts: Math.floor(Math.random() * 50),
      pending: Math.floor(Math.random() * 2),
      failed: Math.floor(Math.random() * 2),
    }
  })
  db.revenueDaily.save(dailyData)

  // Seed security events
  const securityData: SecurityEvent[] = [
    { id: uid(), type: "failed_login", severity: "medium", hashedIp: hashStr("192.168.1.1"), rawIp: "192.168.1.1", userId: null, deviceFingerprint: "fp-001", description: "5 failed login attempts from same IP", resolved: false, riskScore: 45, timestamp: new Date(now_.getTime() - 3600000).toISOString(), meta: {} },
    { id: uid(), type: "vpn_detected", severity: "low", hashedIp: hashStr("10.0.0.1"), rawIp: "10.0.0.1", userId: "user-3", deviceFingerprint: "fp-002", description: "VPN/proxy detected on user registration", resolved: false, riskScore: 25, timestamp: new Date(now_.getTime() - 7200000).toISOString(), meta: {} },
    { id: uid(), type: "rapid_posting", severity: "high", hashedIp: hashStr("172.16.0.1"), rawIp: "172.16.0.1", userId: "user-5", deviceFingerprint: "fp-003", description: "3 ads posted in 10 minutes", resolved: false, riskScore: 70, timestamp: new Date(now_.getTime() - 1800000).toISOString(), meta: {} },
    { id: uid(), type: "duplicate_content", severity: "medium", hashedIp: hashStr("10.1.1.1"), rawIp: "10.1.1.1", userId: "user-7", deviceFingerprint: "fp-004", description: "Duplicate phone number detected across 2 listings", resolved: true, riskScore: 50, timestamp: new Date(now_.getTime() - 86400000).toISOString(), meta: {} },
    { id: uid(), type: "multiple_accounts", severity: "high", hashedIp: hashStr("192.168.2.1"), rawIp: "192.168.2.1", userId: "user-9", deviceFingerprint: "fp-005", description: "3 accounts registered from same IP cluster", resolved: false, riskScore: 80, timestamp: new Date(now_.getTime() - 43200000).toISOString(), meta: {} },
  ]
  db.securityEvents.save(securityData)

  // Seed moderation logs
  const modData: ModerationLog[] = [
    { id: uid(), adminId: "admin", adminName: "Admin", action: "approve", targetType: "listing", targetId: "listing-1", reason: "Passed review", previousValue: "pending", newValue: "approved", notes: "", timestamp: new Date(now_.getTime() - 3600000).toISOString() },
    { id: uid(), adminId: "admin", adminName: "Admin", action: "reject", targetType: "listing", targetId: "listing-8", reason: "Underage content suspected", previousValue: "pending", newValue: "rejected", notes: "Manually reviewed", timestamp: new Date(now_.getTime() - 7200000).toISOString() },
    { id: uid(), adminId: "admin", adminName: "Admin", action: "ban", targetType: "user", targetId: "user-11", reason: "Spam account", previousValue: "active", newValue: "banned", notes: "Multiple duplicate ads", timestamp: new Date(now_.getTime() - 86400000).toISOString() },
  ]
  db.moderationLogs.save(modData)

  // Seed alerts
  const alertData: StatsAlert[] = [
    { id: uid(), type: "login_attack", severity: "warning", title: "Repeated failed logins", message: "IP 192.168.1.1 has 5 failed login attempts in 10 minutes.", read: false, resolved: false, createdAt: new Date(now_.getTime() - 3600000).toISOString(), meta: {} },
    { id: uid(), type: "posting_burst", severity: "warning", title: "Unusual posting burst", message: "User user-5 posted 3 ads in under 10 minutes.", read: false, resolved: false, createdAt: new Date(now_.getTime() - 1800000).toISOString(), meta: {} },
    { id: uid(), type: "ip_cluster", severity: "critical", title: "Multiple accounts same IP", message: "3 new accounts registered from IP cluster 192.168.2.x", read: false, resolved: false, createdAt: new Date(now_.getTime() - 43200000).toISOString(), meta: {} },
  ]
  db.alerts.save(alertData)

  // Seed media stats
  const mediaData: MediaStat[] = Array.from({ length: 20 }, (_, i) => ({
    id: uid(),
    userId: `user-${(i % 8) + 1}`,
    listingId: `listing-${(i % 12) + 1}`,
    mediaType: (i % 4 === 0 ? "video" : "photo") as "photo" | "video",
    filename: `media-${i + 1}.${i % 4 === 0 ? "mp4" : "jpg"}`,
    sizeBytes: Math.floor(Math.random() * 5000000) + 50000,
    region: ["TX","FL","CA","IL","NY"][i % 5],
    device: devices[i % 3],
    uploadedAt: new Date(now_.getTime() - Math.random() * 60 * 86400000).toISOString(),
    status: (["approved","approved","approved","pending","rejected"] as MediaStat["status"][])[i % 5],
    views: Math.floor(Math.random() * 500),
    shares: Math.floor(Math.random() * 30),
    reports: Math.floor(Math.random() * 3),
    imageHash: i % 4 !== 0 ? hashStr(`img-${i}`) : null,
  }))
  db.mediaStats.save(mediaData)

  // Seed visitors
  const visitorData: Visitor[] = Array.from({ length: 30 }, (_, i) => ({
    id: uid(),
    hashedIp: hashStr(`192.168.${i}.1`),
    sessionId: uid(),
    cookieId: uid(),
    userAgent: ["Mozilla/5.0 Chrome/120","Mozilla/5.0 Safari/17","Mozilla/5.0 Firefox/121"][i % 3],
    uaFingerprint: hashStr(`ua-${i}`),
    deviceType: devices[i % 3] as Visitor["deviceType"],
    browser: ["Chrome","Safari","Firefox","Edge"][i % 4],
    os: ["Windows","macOS","iOS","Android"][i % 4],
    screenSize: ["1920x1080","375x812","1440x900","414x896"][i % 4],
    language: "en-US",
    country: i % 5 === 0 ? "CA" : "US",
    state: ["TX","FL","CA","IL","NY","ON","BC"][i % 7],
    region: ["South","Southeast","West","Midwest","Northeast","Ontario","British Columbia"][i % 7],
    city: cities[i % cities.length].split(" ")[0],
    lat: 25 + (i * 1.3) % 25,
    lng: -120 + (i * 2.1) % 70,
    referrer: ["direct","google.com","bing.com",""][i % 4],
    entryPage: ["/","/browse","/providers/1","/post"][i % 4],
    exitPage: ["/","/browse","/providers/1","/checkout"][i % 4],
    firstSeen: new Date(now_.getTime() - Math.random() * 30 * 86400000).toISOString(),
    lastSeen: new Date(now_.getTime() - Math.random() * 86400000).toISOString(),
    totalVisits: Math.floor(Math.random() * 10) + 1,
    isReturning: i > 15,
  }))
  db.visitors.save(visitorData)
}

export { hashStr, today, now, uid }
