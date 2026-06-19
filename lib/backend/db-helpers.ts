// Database helper functions

import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { NotFoundError, ServerError } from "./errors"

// Get user by ID
export async function getUserById(userId: string) {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from("users")
    .select("id, email, role, created_at")
    .eq("id", userId)
    .single()

  if (error || !data) {
    throw new NotFoundError("User")
  }
  return data
}

// Get user by email
export async function getUserByEmail(email: string) {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("email", email.toLowerCase())
    .single()

  return data
}

// Get ad by ID
export async function getAdById(adId: string) {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("id", adId)
    .single()

  if (error || !data) {
    throw new NotFoundError("Advertisement")
  }
  return data
}

// Get user ads
export async function getUserAds(userId: string) {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw new ServerError("Failed to fetch ads")
  return data || []
}

// Get active ads (public)
export async function getActiveAds(limit: number = 50, offset: number = 0) {
  const supabase = supabaseAdmin()
  const { data, error, count } = await supabase
    .from("providers")
    .select("*", { count: "exact" })
    .eq("active", true)
    .eq("moderation_status", "approved")
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new ServerError("Failed to fetch ads")
  return { ads: data || [], count: count || 0 }
}

// Get session by token
export async function getSessionByToken(token: string) {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from("sessions")
    .select("user_id, created_at, expires_at")
    .eq("token", token)
    .single()

  if (!data) return null
  return data
}

// Create user
export async function createUser(email: string, hashedPassword: string, role: string = "user") {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from("users")
    .insert({
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      role: role,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      throw new Error("Email already registered")
    }
    throw new ServerError("Failed to create user")
  }
  return data
}

// Create ad
export async function createAd(userId: string, adData: any) {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from("providers")
    .insert({
      user_id: userId,
      ...adData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new ServerError("Failed to create ad")
  return data
}

// Update ad
export async function updateAd(adId: string, updates: any) {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from("providers")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", adId)
    .select()
    .single()

  if (error) throw new ServerError("Failed to update ad")
  return data
}

// Delete ad
export async function deleteAd(adId: string) {
  const supabase = supabaseAdmin()
  const { error } = await supabase.from("providers").delete().eq("id", adId)

  if (error) throw new ServerError("Failed to delete ad")
}

// Get ad images
export async function getAdImages(adId: string) {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from("provider_images")
    .select("*")
    .eq("provider_id", adId)
    .order("position", { ascending: true })

  if (error) throw new ServerError("Failed to fetch images")
  return data || []
}

// Get subscriptions
export async function getUserSubscriptions(userId: string) {
  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw new ServerError("Failed to fetch subscriptions")
  return data || []
}

// Get active subscription
export async function getActiveSubscription(userId: string) {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .single()

  return data || null
}

// Log audit event
export async function logAuditEvent(
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: any = null
) {
  const supabase = supabaseAdmin()
  await supabase.from("admin_audit_logs").insert({
    admin_id: adminId,
    action: action,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details,
    created_at: new Date().toISOString(),
  })
}

// Get bans
export async function checkIfBanned(email: string, ipAddress: string) {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from("bans")
    .select("*")
    .or(`email.eq.${email},ip_address.eq.${ipAddress}`)
    .eq("status", "active")
    .single()

  return data || null
}
