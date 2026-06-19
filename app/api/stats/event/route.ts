import { NextRequest, NextResponse } from "next/server"
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase"

const VALID_TYPES = new Set([
  "click","page_view","form_submit","contact","phone_click","whatsapp_click",
  "wechat_click","favorite","share","search","payment","login","logout","register",
  "upload","message","report","ad_view","ad_impression","bump","scroll_depth",
  "time_on_page","custom",
])

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 200
const RATE_WINDOW = 60_000

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const start = Date.now()
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  if (!checkRateLimit(ip)) return new NextResponse(null, { status: 429 })

  try {
    const body = await req.json()
    if (!body || !VALID_TYPES.has(body.t)) return new NextResponse(null, { status: 400 })

    // Persist to Supabase when configured — fire and forget
    if (isSupabaseConfigured()) {
      void supabaseAdmin().from("analytics_events").insert({
        type:       body.t,
        page:       body.pg,
        session_id: body.sid,
        visitor_id: body.vid,
        device:     body.dev,
        referrer:   body.ref,
        meta:       body,
      })
    }

    const elapsed = Date.now() - start
    return new NextResponse(null, { status: 204, headers: { "X-Stats-Elapsed": String(elapsed) } })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
