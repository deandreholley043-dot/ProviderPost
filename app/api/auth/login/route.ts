import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured." }, { status: 503 })
    }

    const db = supabaseAdmin()

    // Check email ban
    const { data: ban } = await db.from("bans").select("reason").eq("type", "email").eq("value", email.toLowerCase()).single()
    if (ban) return NextResponse.json({ error: `Account banned: ${ban.reason}` }, { status: 403 })

    // Find user
    const { data: user, error } = await db.from("users")
      .select("id, username, email, password_hash, account_type, banned, verified")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (error || !user) {
      await new Promise(r => setTimeout(r, 400)) // timing attack protection
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
    }

    if (user.banned) return NextResponse.json({ error: "This account has been banned." }, { status: 403 })

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
    }

    // Update last login
    await db.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)

    // Create session
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await db.from("sessions").insert({ id: sessionId, user_id: user.id, expires_at: expiresAt })

    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username, email: user.email, accountType: user.account_type, verified: user.verified },
    })
    response.cookies.set("pp_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })
    return response

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
