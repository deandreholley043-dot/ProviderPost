import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// GET /api/admin/moderation?filter=pending|flagged|all
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

    // Build query
    let query = supabase
      .from("providers")
      .select(
        `id,
        name,
        description,
        moderation_status,
        flagged_for_moderation,
        created_at,
        email,
        phone,
        age,
        city,
        state,
        rates_per_hour,
        provider_images(id, cloudflare_url, width, height)`
      )

    // Apply filter
    if (filter === "pending") {
      query = query.eq("moderation_status", "pending")
    } else if (filter === "flagged") {
      query = query.eq("flagged_for_moderation", true)
    }
    // else "all" - no filter

    const { data: providers, error } = await query.order("created_at", {
      ascending: true,
    })

    if (error) {
      console.error("Error fetching ads:", error)
      return NextResponse.json(
        { error: "Failed to fetch ads" },
        { status: 500 }
      )
    }

    // Get stats
    const { data: stats } = await supabase.rpc("get_moderation_stats")

    // Transform data
    const ads = (providers || []).map((p: any) => ({
      id: p.id,
      provider_id: p.id,
      name: p.name,
      description: p.description,
      moderation_status: p.moderation_status,
      flagged_for_moderation: p.flagged_for_moderation,
      created_at: p.created_at,
      photo_count: p.provider_images?.length || 0,
      providers: {
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        age: p.age,
        city: p.city,
        state: p.state,
        rates_per_hour: p.rates_per_hour,
        created_at: p.created_at,
      },
      photos: (p.provider_images || []).map((img: any) => ({
        id: img.id,
        cloudflare_url: img.cloudflare_url,
        width: img.width,
        height: img.height,
      })),
    }))

    return NextResponse.json({
      success: true,
      filter,
      count: ads.length,
      ads,
      stats: stats?.[0] || {
        pending: 0,
        flagged: 0,
        approved: 0,
        rejected: 0,
      },
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
