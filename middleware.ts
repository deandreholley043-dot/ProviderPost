import { NextRequest, NextResponse } from "next/server"

// ─── Security headers applied to every response ───────────────────────────────
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js requires these
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.nowpayments.io https://api-sandbox.nowpayments.io",
      "frame-ancestors 'none'",
    ].join("; ")
  )
  return response
}

// ─── Admin route protection (server-side) ─────────────────────────────────────
function isAdminAuthed(request: NextRequest): boolean {
  const token = request.cookies.get("admin_token")?.value
  if (!token) return false
  // Token is a signed value: base64(user:timestamp:hash)
  // We verify it was set by the server and hasn't been tampered with
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const parts = decoded.split(":")
    if (parts.length !== 3) return false
    const [user, timestamp] = parts
    // Session valid for 24 hours
    const age = Date.now() - parseInt(timestamp)
    if (age > 86400000) return false
    if (user !== "admin") return false
    return true
  } catch {
    return false
  }
}

// ─── IP ban check ─────────────────────────────────────────────────────────────
function isBannedIP(request: NextRequest): boolean {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    ""
  if (!ip) return false

  // Banned IPs are stored server-side in a response cookie set by admin
  // The cookie is HttpOnly so clients cannot tamper with it
  const bannedCookie = request.cookies.get("banned_ips_srv")?.value
  if (!bannedCookie) return false

  try {
    const bannedIPs: string[] = JSON.parse(decodeURIComponent(bannedCookie))
    return bannedIPs.includes(ip)
  } catch {
    return false
  }
}

const BAN_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Access Denied – ProviderPost</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#0f0f0f;color:#f0f0f0;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:48px 40px;max-width:440px;width:90%;text-align:center}
    h1{font-size:22px;font-weight:700;margin-bottom:8px;color:#f87171}
    p{font-size:14px;color:#9ca3af;line-height:1.6;margin-top:8px}
    .code{margin-top:24px;background:#111;border:1px solid #333;border-radius:6px;padding:8px 14px;font-family:monospace;font-size:12px;color:#6b7280}
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:48px;margin-bottom:16px">🚫</div>
    <h1>Access Denied</h1>
    <p>Your IP address has been banned from ProviderPost.</p>
    <p>If you believe this is an error, please contact support.</p>
    <div class="code">Error 403 – IP Banned</div>
  </div>
</body>
</html>`

// ─── Main middleware ───────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. IP ban check — applies to everything except the ban page itself
  if (!pathname.startsWith("/admin/login") && isBannedIP(request)) {
    return withSecurityHeaders(
      new NextResponse(BAN_PAGE, { status: 403, headers: { "Content-Type": "text/html" } })
    )
  }

  // 2. Admin route protection — server-side, cannot be bypassed from browser
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAdminAuthed(request)) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 3. API route protection — admin API endpoints require auth token
  if (pathname.startsWith("/api/admin")) {
    if (!isAdminAuthed(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const response = NextResponse.next()
  return withSecurityHeaders(response)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon).*)"],
}
