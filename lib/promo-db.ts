import { supabaseAdmin } from "@/lib/supabase"
import type { PromoCode, PromoRedemption, PromoType } from "@/lib/promo-store"

/**
 * Supabase integration for promo codes
 * All data is persisted to database, not localStorage
 */

// ─── Promo Code CRUD ───────────────────────────────────────────────────────

export async function createPromoCodeDb(params: {
  code: string
  type: PromoType
  value: number
  description: string
  expiresAt?: string | null
  maxUses?: number | null
  createdBy: string
}): Promise<PromoCode | null> {
  const supabase = supabaseAdmin()

  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code: params.code.toUpperCase().trim(),
      type: params.type,
      value: params.value,
      description: params.description,
      expires_at: params.expiresAt,
      max_uses: params.maxUses,
      created_by: params.createdBy,
      active: true,
      used_count: 0,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating promo code:", error)
    return null
  }

  return mapDbPromoToInterface(data)
}

export async function getAllPromoCodesDb(): Promise<PromoCode[]> {
  const supabase = supabaseAdmin()

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promo codes:", error)
    return []
  }

  return (data || []).map(mapDbPromoToInterface)
}

export async function getActivePromosDb(): Promise<PromoCode[]> {
  const supabase = supabaseAdmin()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("active", true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching active promos:", error)
    return []
  }

  return (data || []).map(mapDbPromoToInterface)
}

export async function deletePromoCodeDb(id: string): Promise<boolean> {
  const supabase = supabaseAdmin()

  const { error } = await supabase
    .from("promo_codes")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting promo code:", error)
    return false
  }

  return true
}

export async function togglePromoActiveDb(
  id: string,
  active: boolean
): Promise<boolean> {
  const supabase = supabaseAdmin()

  const { error } = await supabase
    .from("promo_codes")
    .update({ active })
    .eq("id", id)

  if (error) {
    console.error("Error toggling promo:", error)
    return false
  }

  return true
}

// ─── Promo Validation & Redemption ─────────────────────────────────────────

export async function validateAndRedeemPromoDb(
  code: string,
  userId: string
): Promise<{ success: boolean; promo?: PromoCode; error?: string }> {
  const supabase = supabaseAdmin()
  const now = new Date()

  // Find the promo code
  const { data: promo, error: promoError } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .single()

  if (promoError || !promo) {
    return { success: false, error: "Promo code not found." }
  }

  if (!promo.active) {
    return { success: false, error: "This promo code is no longer active." }
  }

  if (promo.expires_at && new Date(promo.expires_at) < now) {
    return { success: false, error: "This promo code has expired." }
  }

  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    return { success: false, error: "This promo code has reached its usage limit." }
  }

  // Check if user already redeemed this code
  const { data: existing } = await supabase
    .from("promo_redemptions")
    .select("id")
    .eq("user_id", userId)
    .eq("promo_id", promo.id)
    .single()

  if (existing) {
    return { success: false, error: "You have already used this promo code." }
  }

  // Calculate free period expiry
  let expiresAt: string | null = null
  if (promo.type !== "percent_discount") {
    const expiry = new Date(now)
    if (promo.type === "days_free") expiry.setDate(expiry.getDate() + promo.value)
    if (promo.type === "weeks_free") expiry.setDate(expiry.getDate() + promo.value * 7)
    if (promo.type === "months_free") expiry.setMonth(expiry.getMonth() + promo.value)
    if (promo.type === "years_free")
      expiry.setFullYear(expiry.getFullYear() + promo.value)
    expiresAt = expiry.toISOString()
  }

  // Create redemption record
  const { error: redeemError } = await supabase
    .from("promo_redemptions")
    .insert({
      user_id: userId,
      promo_id: promo.id,
      expires_at: expiresAt,
      redeemed_at: now.toISOString(),
    })

  if (redeemError) {
    console.error("Error redeeming promo:", redeemError)
    return { success: false, error: "Failed to redeem promo code." }
  }

  // Increment use count
  await supabase
    .from("promo_codes")
    .update({ used_count: promo.used_count + 1 })
    .eq("id", promo.id)

  return { success: true, promo: mapDbPromoToInterface(promo) }
}

// ─── User Promo Status ─────────────────────────────────────────────────────

export interface UserPromoStatusDb {
  hasFreePosting: boolean
  freePostingExpiresAt: string | null
  discountPercent: number
  activeRedemptions: Array<{
    id: string
    code: string
    type: PromoType
    value: number
    expiresAt: string | null
  }>
}

export async function getUserPromoStatusDb(
  userId: string
): Promise<UserPromoStatusDb> {
  const supabase = supabaseAdmin()
  const now = new Date()

  // Get all active redemptions for this user
  const { data: redemptions, error } = await supabase
    .from("promo_redemptions")
    .select(`
      id,
      expires_at,
      promo_codes:promo_id (
        id,
        code,
        type,
        value
      )
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching user promo status:", error)
    return {
      hasFreePosting: false,
      freePostingExpiresAt: null,
      discountPercent: 0,
      activeRedemptions: [],
    }
  }

  if (!redemptions || redemptions.length === 0) {
    return {
      hasFreePosting: false,
      freePostingExpiresAt: null,
      discountPercent: 0,
      activeRedemptions: [],
    }
  }

  // Filter active free-posting promotions
  const activeFreePeriods = redemptions
    .filter((r) => {
      const promo = (r.promo_codes as any)
      return (
        promo &&
        promo.type !== "percent_discount" &&
        r.expires_at &&
        new Date(r.expires_at) > now
      )
    })
    .sort((a, b) => new Date(b.expires_at!).getTime() - new Date(a.expires_at!).getTime())

  // Find highest discount percentage
  const discounts = redemptions
    .filter((r) => {
      const promo = (r.promo_codes as any)
      return promo && promo.type === "percent_discount"
    })
    .map((r) => ((r.promo_codes as any).value as number))

  const latestFree = activeFreePeriods[0]
  const discountPercent = discounts.length > 0 ? Math.max(...discounts) : 0

  return {
    hasFreePosting: latestFree !== undefined,
    freePostingExpiresAt: latestFree?.expires_at ?? null,
    discountPercent,
    activeRedemptions: redemptions.map((r) => {
      const promo = (r.promo_codes as any)
      return {
        id: r.id,
        code: promo.code,
        type: promo.type,
        value: promo.value,
        expiresAt: r.expires_at,
      }
    }),
  }
}

export async function getAllRedemptionsDb(): Promise<PromoRedemption[]> {
  const supabase = supabaseAdmin()

  const { data, error } = await supabase
    .from("promo_redemptions")
    .select(`
      id,
      user_id,
      expires_at,
      redeemed_at,
      promo_codes:promo_id (
        id,
        code,
        type,
        value
      )
    `)
    .order("redeemed_at", { ascending: false })

  if (error) {
    console.error("Error fetching redemptions:", error)
    return []
  }

  return (data || []).map((r) => {
    const promo = (r.promo_codes as any)
    return {
      id: r.id,
      code: promo.code,
      username: r.user_id, // user_id for now, could join with users table
      redeemedAt: r.redeemed_at,
      expiresAt: r.expires_at,
      type: promo.type,
      value: promo.value,
    }
  })
}

// ─── Helper Functions ──────────────────────────────────────────────────────

function mapDbPromoToInterface(dbPromo: any): PromoCode {
  return {
    id: dbPromo.id,
    code: dbPromo.code,
    type: dbPromo.type,
    value: dbPromo.value,
    description: dbPromo.description,
    createdAt: dbPromo.created_at,
    createdBy: dbPromo.created_by,
    expiresAt: dbPromo.expires_at,
    maxUses: dbPromo.max_uses,
    usedCount: dbPromo.used_count,
    active: dbPromo.active,
  }
}
