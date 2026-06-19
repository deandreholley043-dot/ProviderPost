import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

async function getUser(req: NextRequest) {
  if (!isSupabaseConfigured()) return null
  const sessionId = req.cookies.get("pp_session")?.value
  if (!sessionId) return null
  const db = supabaseAdmin()
  const { data: session } = await db.from("sessions").select("user_id, expires_at").eq("id", sessionId).single()
  if (!session || new Date(session.expires_at) < new Date()) return null
  return session.user_id as string
}

// GET /api/favorites — get all favorites for logged-in user
export async function GET(req: NextRequest) {
  const userId = await getUser(req)
  if (!userId) return NextResponse.json({ favorites: [] })

  try {
    const { data } = await supabaseAdmin()
      .from("favorites")
      .select("provider_id, created_at, providers(id, name, age, ethnicity, city, state, quick_visit, verified, available_now, short_description)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    return NextResponse.json({ favorites: data || [] })
  } catch {
    return NextResponse.json({ favorites: [] })
  }
}

// POST /api/favorites { providerId }
export async function POST(req: NextRequest) {
  const userId = await getUser(req)
  if (!userId) return NextResponse.json({ error: "Login required." }, { status: 401 })

  const { providerId } = await req.json()
  if (!providerId) return NextResponse.json({ error: "Missing providerId." }, { status: 400 })

  try {
    const { error } = await supabaseAdmin().from("favorites").upsert({ user_id: userId, provider_id: providerId })
    if (error) throw error
    return NextResponse.json({ ok: true, saved: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed." }, { status: 500 })
  }
}

// DELETE /api/favorites?providerId=xxx
export async function DELETE(req: NextRequest) {
  const userId = await getUser(req)
  if (!userId) return NextResponse.json({ error: "Login required." }, { status: 401 })

  const providerId = new URL(req.url).searchParams.get("providerId")
  if (!providerId) return NextResponse.json({ error: "Missing providerId." }, { status: 400 })

  try {
    await supabaseAdmin().from("favorites").delete().eq("user_id", userId).eq("provider_id", providerId)
    return NextResponse.json({ ok: true, saved: false })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed." }, { status: 500 })
  }
}
