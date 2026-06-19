import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// GET /api/admin/photos/pending?filter=pending|flagged|all - Get photos for review
export async function GET(request: NextRequest) {
  try {
    const filter = new URL(request.url).searchParams.get("filter") || "pending"
    
    // Verify admin
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 403 }
      )
    }

    const supabase = supabaseAdmin()

    let query = supabase
      .from("provider_images")
      .select(
        `id,
        provider_id,
        cloudflare_url,
        width,
        height,
        created_at,
        moderation_status,
        flagged_for_moderation,
        manually_verified,
        providers!inner(id, name, email, age)`
      )

    // Apply filter
    if (filter === "pending") {
      query = query.eq("moderation_status", "pending")
    } else if (filter === "flagged") {
      query = query.eq("flagged_for_moderation", true)
    } else if (filter === "approved") {
      query = query.eq("moderation_status", "approved")
    } else if (filter === "rejected") {
      query = query.eq("moderation_status", "rejected")
    }
    // else "all" - no filter

    const { data: photos, error } = await query
      .order("created_at", { ascending: true })
      .limit(100)

    if (error) {
      console.error("Error fetching photos:", error)
      return NextResponse.json(
        { error: "Failed to fetch photos" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      filter,
      count: photos?.length || 0,
      photos: photos || [],
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
