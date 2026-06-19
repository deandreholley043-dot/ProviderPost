import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, accountType } = await req.json()

    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
    }

    // If Supabase not configured, return clear error
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured. Set NEXT_PUBLIC_SUPABASE_URL and related env vars." }, { status: 503 })
    }

    const db = supabaseAdmin()

    // Check bans first
    const { data: emailBan } = await db.from("bans").select("reason").eq("type", "email").eq("value", email.toLowerCase()).single()
    if (emailBan) return NextResponse.json({ error: `Email is banned: ${emailBan.reason}` }, { status: 403 })

    const { data: usernameBan } = await db.from("bans").select("reason").eq("type", "username").eq("value", username.toLowerCase()).single()
    if (usernameBan) return NextResponse.json({ error: `Username is banned: ${usernameBan.reason}` }, { status: 403 })

    // Check uniqueness
    const { data: existing } = await db.from("users").select("id").or(`email.eq.${email},username.eq.${username}`).single()
    if (existing) return NextResponse.json({ error: "Email or username already registered." }, { status: 409 })

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Create user
    const { data: user, error } = await db.from("users").insert({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      account_type: accountType || "hobbyist",
    }).select("id, username, email, account_type").single()

    if (error) throw error

    // Create session
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await db.from("sessions").insert({ id: sessionId, user_id: user.id, expires_at: expiresAt })

    const response = NextResponse.json({ ok: true, user: { id: user.id, username: user.username, email: user.email, accountType: user.account_type } })
    response.cookies.set("pp_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })
    return response

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
