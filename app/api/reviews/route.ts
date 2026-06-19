import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

// GET /api/reviews?providerId=xxx
export async function GET(req: NextRequest) {
  const providerId = new URL(req.url).searchParams.get("providerId")
  if (!providerId) return NextResponse.json({ reviews: [] })
  if (!isSupabaseConfigured()) return NextResponse.json({ reviews: [] })

  try {
    const { data, error } = await supabaseAdmin()
      .from("reviews")
      .select("id, author_username, rating, text, created_at")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ reviews: data || [] })
  } catch {
    return NextResponse.json({ reviews: [] })
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("pp_session")?.value
  if (!sessionId) return NextResponse.json({ error: "Login required." }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })

  try {
    const { providerId, rating, text } = await req.json()
    if (!providerId || !rating || !text?.trim()) return NextResponse.json({ error: "Missing fields." }, { status: 400 })
    if (text.trim().length < 10) return NextResponse.json({ error: "Review must be at least 10 characters." }, { status: 400 })

    const db = supabaseAdmin()
    const { data: session } = await db.from("sessions").select("user_id, expires_at").eq("id", sessionId).single()
    if (!session || new Date(session.expires_at) < new Date()) return NextResponse.json({ error: "Session expired." }, { status: 401 })

    const { data: user } = await db.from("users").select("account_type, username").eq("id", session.user_id).single()
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 401 })
    if (user.account_type !== "hobbyist") return NextResponse.json({ error: "Only hobbyist accounts can post reviews." }, { status: 403 })

    // Prevent self-review
    const { data: provider } = await db.from("providers").select("user_id").eq("id", providerId).single()
    if (provider?.user_id === session.user_id) return NextResponse.json({ error: "You cannot review your own profile." }, { status: 403 })

    // Prevent duplicate
    const { data: existing } = await db.from("reviews").select("id").eq("provider_id", providerId).eq("author_user_id", session.user_id).single()
    if (existing) return NextResponse.json({ error: "You have already reviewed this provider." }, { status: 409 })

    const { data: review, error } = await db.from("reviews").insert({
      provider_id: providerId,
      author_user_id: session.user_id,
      author_username: user.username,
      rating: Math.min(5, Math.max(1, rating)),
      text: text.trim(),
    }).select().single()

    if (error) throw error
    return NextResponse.json({ ok: true, review })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed." }, { status: 500 })
  }
}
