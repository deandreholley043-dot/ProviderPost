import { NextRequest, NextResponse } from "next/server"
import { supabaseServer, supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

// GET /api/admin/promos - Get all promo codes (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const supabase = supabaseAdmin()

    const { data: codes, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching promos:", error)
      return NextResponse.json(
        { error: "Failed to fetch promo codes" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, codes })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/admin/promos - Create new promo code (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { code, type, value, description, maxUses, expiresAt } = body

    // Validation
    if (!code || !type || !value) {
      return NextResponse.json(
        { error: "Missing required fields: code, type, value" },
        { status: 400 }
      )
    }

    if (!["days_free", "weeks_free", "months_free", "years_free", "percent_discount"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid promo type" },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    const { data: newPromo, error } = await supabase
      .from("promo_codes")
      .insert({
        code: code.toUpperCase().trim(),
        type,
        value: parseInt(value),
        description: description || null,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
        active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Promo code already exists" },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "Failed to create promo code" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, promo: newPromo }, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("pp_session")

    if (!sessionCookie) return false

    const supabase = supabaseAdmin()
    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", sessionCookie.value)
      .single()

    if (!session) return false

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user_id)
      .single()

    return user?.role === "admin"
  } catch (error) {
    console.error("Admin verification error:", error)
    return false
  }
}
