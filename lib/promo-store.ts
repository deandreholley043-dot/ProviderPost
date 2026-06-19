// ─── Types ────────────────────────────────────────────────────────────────────

export type PromoType =
  | "days_free"
  | "weeks_free"
  | "months_free"
  | "years_free"
  | "percent_discount"

export interface PromoCode {
  id: string
  code: string              // e.g. "SUMMER50", "VIP30DAYS"
  type: PromoType
  value: number             // days/weeks/months/years OR percent (1-100)
  description: string       // human-readable e.g. "30 days free posting"
  createdAt: string         // ISO timestamp
  createdBy: string
  expiresAt: string | null  // ISO timestamp, null = never expires
  maxUses: number | null    // null = unlimited
  usedCount: number
  active: boolean
}

export interface PromoRedemption {
  id: string
  code: string
  username: string
  redeemedAt: string        // ISO timestamp
  expiresAt: string | null  // when their free period ends (null for percent)
  type: PromoType
  value: number
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const CODES_KEY       = "providerpost_promo_codes"
const REDEMPTIONS_KEY = "providerpost_promo_redemptions"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadCodes(): PromoCode[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(CODES_KEY) || "[]") } catch { return [] }
}
function saveCodes(codes: PromoCode[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(CODES_KEY, JSON.stringify(codes))
}

function loadRedemptions(): PromoRedemption[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(REDEMPTIONS_KEY) || "[]") } catch { return [] }
}
function saveRedemptions(r: PromoRedemption[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(r))
}

// ─── Code CRUD ────────────────────────────────────────────────────────────────

export function getAllPromoCodes(): PromoCode[] {
  return loadCodes().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function createPromoCode(params: Omit<PromoCode, "id" | "createdAt" | "usedCount">): PromoCode {
  const codes = loadCodes()
  const code: PromoCode = {
    ...params,
    code: params.code.toUpperCase().trim(),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    usedCount: 0,
  }
  codes.push(code)
  saveCodes(codes)
  return code
}

export function deletePromoCode(id: string) {
  saveCodes(loadCodes().filter((c) => c.id !== id))
}

export function togglePromoActive(id: string) {
  saveCodes(loadCodes().map((c) => c.id === id ? { ...c, active: !c.active } : c))
}

// ─── Validation & redemption ──────────────────────────────────────────────────

export type ValidateResult =
  | { valid: true;  promo: PromoCode }
  | { valid: false; error: string }

export function validatePromoCode(input: string, username: string): ValidateResult {
  const code = input.toUpperCase().trim()
  const codes = loadCodes()
  const promo = codes.find((c) => c.code === code)

  if (!promo)        return { valid: false, error: "Promo code not found." }
  if (!promo.active) return { valid: false, error: "This promo code is no longer active." }
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date())
    return { valid: false, error: "This promo code has expired." }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses)
    return { valid: false, error: "This promo code has reached its usage limit." }

  // Check if this user already used it
  const redemptions = loadRedemptions()
  const alreadyUsed = redemptions.find((r) => r.code === code && r.username === username)
  if (alreadyUsed) return { valid: false, error: "You have already used this promo code." }

  return { valid: true, promo }
}

export function redeemPromoCode(code: string, username: string): PromoRedemption | null {
  const result = validatePromoCode(code, username)
  if (!result.valid) return null

  const { promo } = result
  const now = new Date()

  // Calculate free-period expiry
  let expiresAt: string | null = null
  if (promo.type !== "percent_discount") {
    const expiry = new Date(now)
    if (promo.type === "days_free")   expiry.setDate(expiry.getDate() + promo.value)
    if (promo.type === "weeks_free")  expiry.setDate(expiry.getDate() + promo.value * 7)
    if (promo.type === "months_free") expiry.setMonth(expiry.getMonth() + promo.value)
    if (promo.type === "years_free")  expiry.setFullYear(expiry.getFullYear() + promo.value)
    expiresAt = expiry.toISOString()
  }

  const redemption: PromoRedemption = {
    id: crypto.randomUUID(),
    code: promo.code,
    username,
    redeemedAt: now.toISOString(),
    expiresAt,
    type: promo.type,
    value: promo.value,
  }

  // Increment use count
  saveCodes(loadCodes().map((c) => c.code === promo.code ? { ...c, usedCount: c.usedCount + 1 } : c))
  saveRedemptions([...loadRedemptions(), redemption])
  return redemption
}

// ─── User promo status ────────────────────────────────────────────────────────

export interface UserPromoStatus {
  hasFreePosting: boolean
  freePostingExpiresAt: string | null
  discountPercent: number   // 0 if none
  activeRedemptions: PromoRedemption[]
}

export function getUserPromoStatus(username: string): UserPromoStatus {
  const redemptions = loadRedemptions().filter((r) => r.username === username)
  const now = new Date()

  const activeFreePeriods = redemptions.filter(
    (r) => r.type !== "percent_discount" && r.expiresAt && new Date(r.expiresAt) > now
  )

  // Find the latest-expiring free period
  const latestFree = activeFreePeriods.sort(
    (a, b) => new Date(b.expiresAt!).getTime() - new Date(a.expiresAt!).getTime()
  )[0] ?? null

  // Find highest active discount
  const discounts = redemptions.filter((r) => r.type === "percent_discount")
  const bestDiscount = discounts.length > 0 ? Math.max(...discounts.map((r) => r.value)) : 0

  return {
    hasFreePosting: latestFree !== null,
    freePostingExpiresAt: latestFree?.expiresAt ?? null,
    discountPercent: bestDiscount,
    activeRedemptions: redemptions,
  }
}

export function getAllRedemptions(): PromoRedemption[] {
  return loadRedemptions().sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function promoTypeLabel(type: PromoType, value: number): string {
  switch (type) {
    case "days_free":        return `${value} day${value !== 1 ? "s" : ""} free`
    case "weeks_free":       return `${value} week${value !== 1 ? "s" : ""} free`
    case "months_free":      return `${value} month${value !== 1 ? "s" : ""} free`
    case "years_free":       return `${value} year${value !== 1 ? "s" : ""} free`
    case "percent_discount": return `${value}% off per post`
  }
}
