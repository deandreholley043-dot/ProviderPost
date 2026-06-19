import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Promo code required" },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    // Get the promo code
    const { data: promoCode, error: promoError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .single()

    if (promoError || !promoCode) {
      return NextResponse.json(
        { valid: false, error: "Promo code not found" },
        { status: 400 }
      )
    }

    // Check if active
    if (!promoCode.active) {
      return NextResponse.json(
        { valid: false, error: "This promo code is no longer active" },
        { status: 400 }
      )
    }

    // Check if expired
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This promo code has expired" },
        { status: 400 }
      )
    }

    // Check max uses
    if (
      promoCode.max_uses !== null &&
      promoCode.used_count >= promoCode.max_uses
    ) {
      return NextResponse.json(
        { valid: false, error: "This promo code has reached its usage limit" },
        { status: 400 }
      )
    }

    // Check if user already redeemed (only if authenticated)
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("pp_session")

    if (sessionCookie) {
      const { data: session } = await supabase
        .from("sessions")
        .select("user_id")
        .eq("token", sessionCookie.value)
        .single()

      if (session) {
        const { data: alreadyRedeemed } = await supabase
          .from("promo_redemptions")
          .select("id")
          .eq("user_id", session.user_id)
          .eq("code", promoCode.code)
          .maybeSingle()

        if (alreadyRedeemed) {
          return NextResponse.json(
            { valid: false, error: "You have already redeemed this code" },
            { status: 400 }
          )
        }
      }
    }

    // Valid! Return promo details
    const freeDays = calculateFreeDays(promoCode)
    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      description: promoCode.description,
      discount: promoCode.type === "percent_discount" ? promoCode.value : 0,
      freePostingDays: freeDays,
    })
  } catch (error) {
    console.error("Validate promo error:", error)
    return NextResponse.json(
      { error: "Failed to validate promo code" },
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
