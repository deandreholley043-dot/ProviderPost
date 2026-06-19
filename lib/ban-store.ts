// ─── Types ────────────────────────────────────────────────────────────────────

export type BanType = "ip" | "email" | "username"

export interface BanEntry {
  id: string
  type: BanType
  value: string          // the IP, email, or username
  reason: string
  bannedAt: string       // ISO timestamp
  bannedBy: string       // admin label
  permanent: boolean
  expiresAt?: string     // ISO timestamp if not permanent
  notes?: string
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEY = "providerpost_bans"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function load(): BanEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as BanEntry[]) : []
  } catch {
    return []
  }
}

function save(bans: BanEntry[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(bans))
  // Write to a server-set cookie via API so HttpOnly flag can be applied
  // Falls back to client cookie for development environments
  const ips = bans
    .filter((b) => b.type === "ip" && isActive(b))
    .map((b) => b.value)
  
  // Update the server-side banned IPs cookie via API
  fetch("/api/admin/bans/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ips }),
  }).catch(() => {
    // Fallback: write client cookie (middleware also reads banned_ips for backward compat)
    document.cookie = `banned_ips=${encodeURIComponent(JSON.stringify(ips))}; path=/; max-age=31536000`
  })
}

export function isActive(ban: BanEntry): boolean {
  if (!ban.permanent && ban.expiresAt) {
    return new Date(ban.expiresAt) > new Date()
  }
  return true
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getAllBans(): BanEntry[] {
  return load()
}

export function getBansByType(type: BanType): BanEntry[] {
  return load().filter((b) => b.type === type)
}

export function addBan(entry: Omit<BanEntry, "id" | "bannedAt">): BanEntry {
  const bans = load()
  const newBan: BanEntry = {
    ...entry,
    id: crypto.randomUUID(),
    bannedAt: new Date().toISOString(),
  }
  bans.push(newBan)
  save(bans)
  return newBan
}

export function removeBan(id: string): void {
  const bans = load().filter((b) => b.id !== id)
  save(bans)
}

export function updateBan(id: string, updates: Partial<BanEntry>): void {
  const bans = load().map((b) => (b.id === id ? { ...b, ...updates } : b))
  save(bans)
}

export function isBanned(type: BanType, value: string): BanEntry | null {
  const normalized = value.trim().toLowerCase()
  const match = load().find(
    (b) =>
      b.type === type &&
      b.value.trim().toLowerCase() === normalized &&
      isActive(b)
  )
  return match ?? null
}

export function checkAllBans(opts: {
  email?: string
  username?: string
  ip?: string
}): BanEntry | null {
  if (opts.ip) {
    const b = isBanned("ip", opts.ip)
    if (b) return b
  }
  if (opts.email) {
    const b = isBanned("email", opts.email)
    if (b) return b
  }
  if (opts.username) {
    const b = isBanned("username", opts.username)
    if (b) return b
  }
  return null
}
