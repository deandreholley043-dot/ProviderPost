import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"
import { DEFAULT_PLANS } from "@/lib/nowpayments"

// NowPayments sends payment confirmation to this endpoint
// Set this URL in NowPayments dashboard: https://yourdomain.com/api/payments/webhook

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-nowpayments-sig") || ""
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || ""

    // ── Verify HMAC-SHA512 signature ───────────────────────
    if (ipnSecret && signature) {
      const hmac = createHmac("sha512", ipnSecret)
      // NowPayments requires sorted JSON for signature verification
      const sorted = JSON.stringify(JSON.parse(rawBody), Object.keys(JSON.parse(rawBody)).sort())
      hmac.update(sorted)
      const expected = hmac.digest("hex")
      if (expected !== signature) {
        console.warn("[IPN] Invalid signature — possible spoofed webhook")
        return NextResponse.json({ error: "Invalid signature." }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const { payment_id, payment_status, order_id, price_amount, price_currency, pay_currency, pay_amount } = payload

    // Log every IPN regardless of status
    if (isSupabaseConfigured()) {
      await supabaseAdmin().from("ipn_logs").insert({
        payment_id,
        status: payment_status,
        raw_body: payload,
        verified: !!(ipnSecret && signature),
      })
    }

    // Only activate on confirmed/finished status
    if (payment_status !== "finished" && payment_status !== "confirmed") {
      return NextResponse.json({ ok: true, status: payment_status })
    }

    if (!isSupabaseConfigured()) {
      console.log(`[IPN] Payment confirmed: ${payment_id} but DB not configured`)
      return NextResponse.json({ ok: true })
    }

    const db = supabaseAdmin()

    // Find pending subscription by payment_id
    const { data: sub } = await db.from("subscriptions")
      .select("id, user_id, plan, expires_at")
      .eq("payment_id", payment_id)
      .eq("status", "pending")
      .single()

    if (!sub) {
      // Try by order_id prefix (pp-{timestamp}-{random})
      const { data: subByOrder } = await db.from("subscriptions")
        .select("id, user_id, plan")
        .ilike("payment_id", `%${order_id}%`)
        .single()

      if (!subByOrder) {
        console.warn(`[IPN] No pending subscription found for payment_id=${payment_id}`)
        return NextResponse.json({ ok: true })
      }

      await activateSubscription(db, subByOrder.id, subByOrder.user_id, subByOrder.plan, payment_id, pay_currency, pay_amount, price_amount)
      return NextResponse.json({ ok: true })
    }

    await activateSubscription(db, sub.id, sub.user_id, sub.plan, payment_id, pay_currency, pay_amount, price_amount)
    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error("[IPN] Error:", err)
    // Always return 200 to NowPayments — otherwise they retry
    return NextResponse.json({ ok: true })
  }
}

async function activateSubscription(
  db: ReturnType<typeof supabaseAdmin>,
  subId: string,
  userId: string,
  plan: string,
  paymentId: string,
  coin: string,
  cryptoAmount: number,
  usdAmount: number
) {
  const now = new Date()

  // Calculate expiry from plan
  const planDef = DEFAULT_PLANS.find(p => p.id === plan)
  const months = planDef?.months || 1
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + months)

  // Activate subscription
  await db.from("subscriptions").update({
    status: "confirmed",
    paid_at: now.toISOString(),
    starts_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    payment_id: paymentId,
    coin,
  }).eq("id", subId)

  // Activate the user's pending provider ad (most recent)
  const { data: pendingAd } = await db.from("providers")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (pendingAd) {
    await db.from("providers").update({
      status: "approved",
      expires_at: expiresAt.toISOString(),
    }).eq("id", pendingAd.id)
  }

  // Log revenue for money maker
  const monthStr = now.toISOString().slice(0, 7)
  await db.from("mm_revenue_logs").insert({
    month: monthStr,
    date: now.toISOString().slice(0, 10),
    category: `membership_${plan}` as string,
    amount_usd: usdAmount,
    description: `${plan} subscription — ${coin.toUpperCase()}`,
    user_id: userId,
    payment_id: paymentId,
    added_by: "system",
    note: `${cryptoAmount} ${coin.toUpperCase()} paid`,
  })

  const today = now.toISOString().slice(0, 10)
  let existingRev = 0, existingPaid = 0
  try {
    const { data: existing } = await db.from("mm_daily_stats").select("revenue_usd, new_paid_users").eq("date", today).single()
    if (existing) { existingRev = existing.revenue_usd || 0; existingPaid = existing.new_paid_users || 0 }
  } catch { /* row may not exist yet */ }
  await db.from("mm_daily_stats").upsert({
    date: today,
    revenue_usd: existingRev + usdAmount,
    new_paid_users: existingPaid + 1,
    updated_at: now.toISOString(),
  }, { onConflict: "date" })

  console.log(`[IPN] ✓ Activated subscription ${subId} for user ${userId} — plan ${plan} expires ${expiresAt.toISOString()}`)
}
