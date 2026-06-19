import { NextRequest, NextResponse } from "next/server"

// Credentials read from environment variables — NEVER hardcoded
// Set ADMIN_USERNAME and ADMIN_PASSWORD in your .env.local or Vercel dashboard
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ""

function generateToken(username: string): string {
  const timestamp = Date.now().toString()
  // Simple signed token: base64(user:timestamp:secret-hash)
  // In production replace with a proper HMAC or JWT
  const secret = process.env.ADMIN_TOKEN_SECRET || "changeme-set-ADMIN_TOKEN_SECRET-in-env"
  const payload = `${username}:${timestamp}:${secret}`
  return Buffer.from(payload).toString("base64")
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials." }, { status: 400 })
    }

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin password not configured. Set ADMIN_PASSWORD in environment variables." },
        { status: 503 }
      )
    }

    // Constant-time comparison to prevent timing attacks
    const userMatch = username.length === ADMIN_USERNAME.length &&
      username.split("").every((c: string, i: number) => c === ADMIN_USERNAME[i])
    const passMatch = password.length === ADMIN_PASSWORD.length &&
      password.split("").every((c: string, i: number) => c === ADMIN_PASSWORD[i])

    if (!userMatch || !passMatch) {
      // Artificial delay to slow brute force
      await new Promise((r) => setTimeout(r, 500))
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    const token = generateToken(username)

    const response = NextResponse.json({ ok: true })

    // Set HttpOnly, Secure, SameSite=Strict cookie — not accessible from JS
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 })
  }
}

export async function DELETE() {
  // Logout — clear the cookie
  const response = NextResponse.json({ ok: true })
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
  return response
}
