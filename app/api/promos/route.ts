import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

function requireAdmin(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value
  if (!token) return false
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [user, ts] = decoded.split(":")
    return user === (process.env.ADMIN_USERNAME || "admin") && (Date.now() - parseInt(ts)) < 86400000
  } catch { return false }
}

// GET /api/promos?code=SUMMER50 — validate a code
export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get("code")
  const username = new URL(req.url).searchParams.get("username")

  if (!code) return NextResponse.json({ error: "Missing code." }, { status: 400 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })

  const db = supabaseAdmin()
  const { data: promo } = await db.from("promo_codes").select("*").eq("code", code.toUpperCase()).single()
  if (!promo) return NextResponse.json({ valid: false, error: "Promo code not found." })
  if (!promo.active) return NextResponse.json({ valid: false, error: "Code is no longer active." })
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) return NextResponse.json({ valid: false, error: "Code has expired." })
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) return NextResponse.json({ valid: false, error: "Code has reached its usage limit." })

  if (username) {
    const { data: used } = await db.from("promo_redemptions").select("id").eq("code", code.toUpperCase()).eq("username", username).single()
    if (used) return NextResponse.json({ valid: false, error: "You have already used this code." })
  }

  return NextResponse.json({ valid: true, promo: { type: promo.type, value: promo.value, description: promo.description } })
}

// POST /api/promos — admin creates a code, or user redeems one
export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = supabaseAdmin()

  // Redemption
  if (body.action === "redeem") {
    const sessionId = req.cookies.get("pp_session")?.value
    if (!sessionId) return NextResponse.json({ error: "Login required." }, { status: 401 })

    const { data: session } = await db.from("sessions").select("user_id").eq("id", sessionId).single()
    if (!session) return NextResponse.json({ error: "Session expired." }, { status: 401 })

    const { data: user } = await db.from("users").select("username").eq("id", session.user_id).single()
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 401 })

    const { data: promo } = await db.from("promo_codes").select("*").eq("code", body.code?.toUpperCase()).single()
    if (!promo || !promo.active) return NextResponse.json({ error: "Invalid code." }, { status: 400 })

    // Calculate expiry
    const now = new Date()
    let expiresAt: string | null = null
    if (promo.type !== "percent_discount") {
      const d = new Date(now)
      if (promo.type === "days_free")   d.setDate(d.getDate() + promo.value)
      if (promo.type === "weeks_free")  d.setDate(d.getDate() + promo.value * 7)
      if (promo.type === "months_free") d.setMonth(d.getMonth() + promo.value)
      if (promo.type === "years_free")  d.setFullYear(d.getFullYear() + promo.value)
      expiresAt = d.toISOString()
    }

    await db.from("promo_redemptions").insert({ code: promo.code, user_id: session.user_id, username: user.username, type: promo.type, value: promo.value, expires_at: expiresAt })
    await db.from("promo_codes").update({ used_count: promo.used_count + 1 }).eq("id", promo.id)

    return NextResponse.json({ ok: true, expiresAt })
  }

  // Admin create
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })

  const { code, type, value, description, maxUses, expiresAt } = body
  if (!code || !type || !value) return NextResponse.json({ error: "Missing fields." }, { status: 400 })

  const { data, error } = await db.from("promo_codes").insert({
    code: code.toUpperCase().trim(), type, value: parseInt(value),
    description, max_uses: maxUses || null, expires_at: expiresAt || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, promo: data })
}

// DELETE /api/promos?id=xxx
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  const id = new URL(req.url).searchParams.get("id")
  if (!id || !isSupabaseConfigured()) return NextResponse.json({ error: "Missing id." }, { status: 400 })
  await supabaseAdmin().from("promo_codes").delete().eq("id", id)
  return NextResponse.json({ ok: true })
}
