import { NextRequest, NextResponse } from "next/server"
import { getPaymentStatus } from "@/lib/nowpayments"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get("paymentId")
  const sandbox   = searchParams.get("sandbox") === "true"

  if (!paymentId || typeof paymentId !== "string" || paymentId.length > 100) {
    return NextResponse.json({ error: "Invalid paymentId." }, { status: 400 })
  }

  // API key from server env — never from the client
  const apiKey = process.env.NOWPAYMENTS_API_KEY || ""
  const useSandbox = process.env.NOWPAYMENTS_SANDBOX === "true" || sandbox

  if (!apiKey) {
    return NextResponse.json({ error: "Payment system not configured." }, { status: 503 })
  }

  try {
    const status = await getPaymentStatus(apiKey, useSandbox, paymentId)
    return NextResponse.json(status)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Status fetch failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
