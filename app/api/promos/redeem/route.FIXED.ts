import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

const VALID_PROMO_TYPES = ["days_free", "weeks_free", "months_free", "years_free", "percent_discount"]

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Promo code required" },
        { status: 400 }
      )
    }

    // Verify authentication
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("pp_session")

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Login required to redeem promo" },
        { status: 401 }
      )
    }

    const supabase = supabaseAdmin()

    // Get user from session
    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", sessionCookie.value)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      )
    }

    const userId = session.user_id

    // BUG FIX: Get the promo code
    const { data: promoCode, error: promoError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .single()

    if (promoError || !promoCode) {
      return NextResponse.json(
        { error: "Promo code not found" },
        { status: 400 }
      )
    }

    // BUG FIX: Validate promo type before processing
    if (!VALID_PROMO_TYPES.includes(promoCode.type)) {
      return NextResponse.json(
        { error: "Invalid promo type" },
        { status: 400 }
      )
    }

    // Check if active
    if (!promoCode.active) {
      return NextResponse.json(
        { error: "This promo code is no longer active" },
        { status: 400 }
      )
    }

    // Check if expired
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This promo code has expired" },
        { status: 400 }
      )
    }

    // Check max uses
    if (
      promoCode.max_uses !== null &&
      promoCode.used_count >= promoCode.max_uses
    ) {
      return NextResponse.json(
        { error: "This promo code has reached its usage limit" },
        { status: 400 }
      )
    }

    // BUG FIX: Use database unique constraint to prevent race condition
    // Instead of check-then-insert, we rely on the UNIQUE(user_id, code_id) constraint
    // and handle the duplicate key error

    // Calculate expiry date
    let expiresAt: string | null = null
    if (promoCode.type !== "percent_discount") {
      const expiry = new Date()
      if (promoCode.type === "days_free") {
        expiry.setDate(expiry.getDate() + promoCode.value)
      } else if (promoCode.type === "weeks_free") {
        expiry.setDate(expiry.getDate() + promoCode.value * 7)
      } else if (promoCode.type === "months_free") {
        expiry.setMonth(expiry.getMonth() + promoCode.value)
      } else if (promoCode.type === "years_free") {
        expiry.setFullYear(expiry.getFullYear() + promoCode.value)
      }
      expiresAt = expiry.toISOString()
    }

    // BUG FIX: Try to insert redemption
    // If duplicate exists, will fail with unique constraint violation (expected for second attempt)
    const { data: redemption, error: redeemError } = await supabase
      .from("promo_redemptions")
      .insert({
        user_id: userId,
        code_id: promoCode.id,
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (redeemError) {
      // BUG FIX: Check for duplicate key error
      if (redeemError.code === "23505") {
        return NextResponse.json(
          { error: "You have already redeemed this code" },
          { status: 400 }
        )
      }
      console.error("Redemption error:", redeemError)
      return NextResponse.json(
        { error: "Failed to redeem promo code" },
        { status: 500 }
      )
    }

    // BUG FIX: Use atomic UPDATE with increment instead of read-then-write
    const { error: updateError } = await supabase.rpc(
      "increment_promo_used_count",
      { promo_id: promoCode.id }
    )

    if (updateError) {
      console.error("Used count update error:", updateError)
      // Don't fail the request - redemption already recorded
      // The increment is less critical than the redemption itself
    }

    // Return success with details
    const freeDays = calculateFreeDays(promoCode)
    return NextResponse.json({
      success: true,
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      description: promoCode.description,
      discount: promoCode.type === "percent_discount" ? promoCode.value : 0,
      freePostingDays: freeDays,
      expiresAt: expiresAt,
    })
  } catch (error) {
    console.error("Redeem promo error:", error)
    return NextResponse.json(
      { error: "Failed to redeem promo code" },
      { status: 500 }
    )
  }
}

function calculateFreeDays(promo: any): number {
  if (promo.type === "days_free") return promo.value
  if (promo.type === "weeks_free") return promo.value * 7
  if (promo.type === "months_free") return promo.value * 30
  if (promo.type === "years_free") return promo.value * 365
  return 0
}
