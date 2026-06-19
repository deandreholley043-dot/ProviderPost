import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// GET /api/admin/ads - List admin-created ads
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 403 }
      )
    }

    const filter = new URL(request.url).searchParams.get("filter") || "admin_created"

    const supabase = supabaseAdmin()

    let query = supabase
      .from("providers")
      .select(
        `id,
        name,
        email,
        phone,
        age,
        city,
        state,
        category,
        rates_per_hour,
        moderation_status,
        active,
        admin_created,
        admin_created_at,
        admin_created_by,
        admin_notes`
      )

    if (filter === "admin_created") {
      query = query.eq("admin_created", true)
    }

    const { data: ads, error } = await query.order("created_at", {
      ascending: false,
    })

    if (error) {
      console.error("Error fetching ads:", error)
      return NextResponse.json(
        { error: "Failed to fetch ads" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: ads?.length || 0,
      ads: ads || [],
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function verifyAdmin() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("pp_session")

    if (!sessionCookie) return null

    const supabase = supabaseAdmin()
    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", sessionCookie.value)
      .single()

    if (!session) return null

    const { data: user } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", session.user_id)
      .single()

    if (user?.role !== "admin") return null

    return user
  } catch (error) {
    console.error("Admin verification error:", error)
    return null
  }
}
