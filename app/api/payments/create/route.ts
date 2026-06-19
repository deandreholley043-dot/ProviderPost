import { NextRequest, NextResponse } from "next/server"
import { createPayment } from "@/lib/nowpayments"

// Rate limiting: simple in-memory store (use Redis/KV in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10        // max requests
const RATE_WINDOW = 60_000   // per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { sandbox, priceAmount, payCurrency, orderId, orderDescription, successUrl, cancelUrl, ipnCallbackUrl } = body

    // API key lives ONLY on the server — never sent from the client
    const apiKey = process.env.NOWPAYMENTS_API_KEY || ""
    const useSandbox = process.env.NOWPAYMENTS_SANDBOX === "true" || !!sandbox

    if (!apiKey) {
      return NextResponse.json({ error: "Payment system not configured. Contact support." }, { status: 503 })
    }
    if (!payCurrency || !priceAmount || !orderId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    // Validate price is a reasonable number
    const amount = Number(priceAmount)
    if (isNaN(amount) || amount <= 0 || amount > 10000) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 })
    }

    const payment = await createPayment({
      apiKey,
      sandbox: useSandbox,
      priceAmount: amount,
      priceCurrency: "usd",
      payCurrency: String(payCurrency).toLowerCase(),
      orderId: String(orderId).slice(0, 100),
      orderDescription: String(orderDescription || "ProviderPost Subscription").slice(0, 200),
      successUrl,
      cancelUrl,
      ipnCallbackUrl,
    })

    return NextResponse.json(payment)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment creation failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
