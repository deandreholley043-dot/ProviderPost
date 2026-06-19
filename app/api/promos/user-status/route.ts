import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("pp_session")

    if (!sessionCookie) {
      return NextResponse.json(
        {
          hasFreePosting: false,
          freePostingExpiresAt: null,
          discountPercent: 0,
          freeDaysRemaining: 0,
        }
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
        {
          hasFreePosting: false,
          freePostingExpiresAt: null,
          discountPercent: 0,
          freeDaysRemaining: 0,
        }
      )
    }

    const userId = session.user_id

    // Get user's active redemptions
    const { data: redemptions } = await supabase
      .from("promo_redemptions")
      .select("*")
      .eq("user_id", userId)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    if (!redemptions || redemptions.length === 0) {
      return NextResponse.json({
        hasFreePosting: false,
        freePostingExpiresAt: null,
        discountPercent: 0,
        freeDaysRemaining: 0,
      })
    }

    // Find active free posting promo (latest expiring)
    const freePostingPromo = redemptions
      .filter((r: any) => r.type !== "percent_discount")
      .sort((a: any, b: any) => {
        if (!a.expires_at) return -1
        if (!b.expires_at) return 1
        return (
          new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime()
        )
      })[0]

    // Find best discount
    const discountPromos = redemptions.filter((r: any) => r.type === "percent_discount")
    const bestDiscount =
      discountPromos.length > 0
        ? Math.max(...discountPromos.map((r: any) => r.value))
        : 0

    // Calculate days remaining
    let daysRemaining = 0
    if (freePostingPromo && freePostingPromo.expires_at) {
      const now = new Date()
      const expiresAt = new Date(freePostingPromo.expires_at)
      daysRemaining = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    }

    return NextResponse.json({
      hasFreePosting: freePostingPromo !== undefined,
      freePostingExpiresAt: freePostingPromo?.expires_at || null,
      discountPercent: bestDiscount,
      freeDaysRemaining: daysRemaining,
      activeRedemptions: redemptions,
    })
  } catch (error) {
    console.error("Get user promo status error:", error)
    return NextResponse.json(
      { error: "Failed to get promo status" },
      { status: 500 }
    )
  }
}
