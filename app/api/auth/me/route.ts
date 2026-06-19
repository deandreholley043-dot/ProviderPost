import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("pp_session")?.value
  if (!sessionId) return NextResponse.json({ user: null })

  if (!isSupabaseConfigured()) return NextResponse.json({ user: null })

  try {
    const db = supabaseAdmin()
    const { data: session } = await db.from("sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .single()

    if (!session) return NextResponse.json({ user: null })
    if (new Date(session.expires_at) < new Date()) {
      await db.from("sessions").delete().eq("id", sessionId)
      return NextResponse.json({ user: null })
    }

    const { data: user } = await db.from("users")
      .select("id, username, email, account_type, verified, banned")
      .eq("id", session.user_id)
      .single()

    if (!user || user.banned) return NextResponse.json({ user: null })

    return NextResponse.json({ user: { id: user.id, username: user.username, email: user.email, accountType: user.account_type, verified: user.verified } })
  } catch {
    return NextResponse.json({ user: null })
  }
}
