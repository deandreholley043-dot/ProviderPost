import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

function requireAdmin(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value
  if (!token) return false
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const parts = decoded.split(":")
    if (parts.length !== 3) return false
    const [user, timestamp] = parts
    if (Date.now() - parseInt(timestamp) > 86400000) return false
    return user === (process.env.ADMIN_USERNAME || "admin")
  } catch { return false }
}

// GET /api/bans
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ bans: [] })

  const { data } = await supabaseAdmin().from("bans").select("*").order("created_at", { ascending: false })
  return NextResponse.json({ bans: data || [] })
}

// POST /api/bans
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })

  const body = await req.json()
  const { type, value, reason, permanent, expiresAt, notes } = body
  if (!type || !value || !reason) return NextResponse.json({ error: "Missing fields." }, { status: 400 })

  const { data, error } = await supabaseAdmin().from("bans").insert({
    type, value: value.toLowerCase().trim(), reason, permanent: permanent ?? true,
    expires_at: expiresAt || null, notes, banned_by: "admin",
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If IP ban, also sync to response cookie for middleware
  if (type === "ip") {
    const { data: allIpBans } = await supabaseAdmin()
      .from("bans").select("value").eq("type", "ip")
      .or(`permanent.eq.true,expires_at.gt.${new Date().toISOString()}`)
    const ips = (allIpBans || []).map((b: { value: string }) => b.value)
    const response = NextResponse.json({ ok: true, ban: data })
    response.cookies.set("banned_ips_srv", encodeURIComponent(JSON.stringify(ips)), {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", maxAge: 60 * 60 * 24 * 365, path: "/",
    })
    return response
  }

  return NextResponse.json({ ok: true, ban: data })
}

// DELETE /api/bans?id=xxx
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 })

  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 })
  await supabaseAdmin().from("bans").delete().eq("id", id)
  return NextResponse.json({ ok: true })
}

// Check a single value — used by middleware/login
// GET /api/bans/check?type=email&value=xxx
export async function HEAD(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const value = searchParams.get("value")
  if (!type || !value || !isSupabaseConfigured()) return new NextResponse(null, { status: 404 })

  const { data } = await supabaseAdmin().from("bans").select("id").eq("type", type).eq("value", value.toLowerCase())
    .or(`permanent.eq.true,expires_at.gt.${new Date().toISOString()}`).limit(1).single()

  return new NextResponse(null, { status: data ? 200 : 404 })
}
