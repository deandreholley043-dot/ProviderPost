import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

// GET /api/providers?state=TX&city=Austin&category=incall&ethnicity=Latin&page=1
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ providers: [], total: 0 })
  }

  const { searchParams } = new URL(req.url)
  const state     = searchParams.get("state")
  const city      = searchParams.get("city")
  const category  = searchParams.get("category")
  const ethnicity = searchParams.get("ethnicity")
  const page      = parseInt(searchParams.get("page") || "1")
  const limit     = 24

  try {
    const db = supabaseAdmin()
    let query = db.from("providers")
      .select("*", { count: "exact" })
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (state)     query = query.eq("state", state)
    if (city)      query = query.ilike("city", city)
    if (category)  query = query.eq("category", category)
    if (ethnicity) query = query.ilike("ethnicity", `%${ethnicity}%`)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ providers: data || [], total: count || 0, page, limit })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 })
  }
}

// POST /api/providers — create a new ad
export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("pp_session")?.value
  if (!sessionId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  }

  try {
    const db = supabaseAdmin()

    // Verify session
    const { data: session } = await db.from("sessions").select("user_id, expires_at").eq("id", sessionId).single()
    if (!session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: "Session expired." }, { status: 401 })
    }

    // Verify user is a provider
    const { data: user } = await db.from("users").select("account_type, banned").eq("id", session.user_id).single()
    if (!user || user.banned) return NextResponse.json({ error: "Account not found or banned." }, { status: 403 })
    if (user.account_type !== "provider") return NextResponse.json({ error: "Only provider accounts can post ads." }, { status: 403 })

    const body = await req.json()
    const { name, age, gender, height, weight, ethnicity, sees, quickVisit, halfHour, hour, overnight, category, phone, whatsapp, wechat, messagingApps, city, state, zip, description } = body

    if (!name?.trim() || !phone?.trim() || !city?.trim() || !state?.trim()) {
      return NextResponse.json({ error: "Name, phone, city and state are required." }, { status: 400 })
    }

    // Check if subscription is active
    const { data: sub } = await db.from("subscriptions")
      .select("id, expires_at, plan")
      .eq("user_id", session.user_id)
      .eq("status", "confirmed")
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .single()

    const status = sub ? "pending" : "pending" // always pending for admin review

    const short = description ? description.slice(0, 120) + (description.length > 120 ? "…" : "") : ""

    const { data: provider, error } = await db.from("providers").insert({
      user_id: session.user_id,
      name: name.trim(),
      age, gender, height, weight, ethnicity, sees,
      quick_visit: quickVisit, half_hour: halfHour, hour, overnight,
      category: category || "incall",
      phone: phone.trim(), whatsapp, wechat, messaging_apps: messagingApps,
      city: city.trim(), state: state.trim(), zip,
      description, short_description: short,
      status,
      expires_at: sub ? sub.expires_at : null,
    }).select("id, status").single()

    if (error) throw error

    return NextResponse.json({ ok: true, providerId: provider.id, status: provider.status })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create ad." }, { status: 500 })
  }
}
