import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// GET /api/admin/eternal-links - List all eternal links
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 403 }
      )
    }

    const supabase = supabaseAdmin()

    // Get all eternal links with counts
    const { data: links, error } = await supabase
      .from("eternal_links")
      .select(
        `id,
        code,
        original_ad_id,
        original_user_id,
        archived_data,
        admin_id,
        status,
        created_at,
        total_views`
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching eternal links:", error)
      return NextResponse.json(
        { error: "Failed to fetch eternal links" },
        { status: 500 }
      )
    }

    // Get admin names
    const { data: admins } = await supabase
      .from("users")
      .select("id, email")
      .in("id", (links || []).map((l: any) => l.admin_id))

    const adminMap = Object.fromEntries(
      (admins || []).map((a: any) => [a.id, a.email])
    )

    // Transform data
    const transformedLinks = (links || []).map((link: any) => ({
      id: link.id,
      code: link.code,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/e/${link.code}`,
      originalAdId: link.original_ad_id,
      originalUserId: link.original_user_id,
      adTitle: link.archived_data?.title || "Unknown",
      adCategory: link.archived_data?.category || "Unknown",
      status: link.status,
      createdAt: link.created_at,
      createdByAdmin: adminMap[link.admin_id] || "Unknown",
      totalViews: link.total_views,
    }))

    return NextResponse.json({
      success: true,
      count: transformedLinks.length,
      links: transformedLinks,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/admin/eternal-links - Create new eternal link
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { adId, adminNotes } = body

    if (!adId) {
      return NextResponse.json(
        { error: "Advertisement ID required" },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    // Get the original ad
    const { data: ad, error: adError } = await supabase
      .from("providers")
      .select("*")
      .eq("id", adId)
      .single()

    if (adError || !ad) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      )
    }

    // Get ad images
    const { data: images } = await supabase
      .from("provider_images")
      .select("id, cloudflare_url, width, height")
      .eq("provider_id", adId)

    // Create archived data snapshot
    const archivedData = {
      // Basic info
      title: ad.name,
      description: ad.description,
      category: ad.category || "escort",
      
      // Location
      city: ad.city,
      state: ad.state,
      zip: ad.zip_code,
      region: ad.region,
      
      // Contact
      phone: ad.phone,
      email: ad.email,
      website: ad.website,
      messaging_apps: ad.messaging_apps,
      
      // Details
      age: ad.age,
      rates_per_hour: ad.rates_per_hour,
      ethnicity: ad.ethnicity,
      hair_color: ad.hair_color,
      eye_color: ad.eye_color,
      height: ad.height,
      weight: ad.weight,
      
      // Service info
      service_type: ad.service_type,
      availability: ad.availability,
      languages: ad.languages,
      
      // Account
      membership_level: ad.membership_level,
      membership_expiry: ad.membership_expiry,
      active: ad.active,
      
      // Status
      moderation_status: ad.moderation_status,
      flagged_for_moderation: ad.flagged_for_moderation,
      
      // Dates
      created_at: ad.created_at,
      updated_at: ad.updated_at,
      
      // Images
      images: images || [],
    }

    // Generate unique code
    const { data: codeData, error: codeError } = await supabase.rpc(
      "generate_eternal_link_code"
    )

    if (codeError) {
      console.error("Error generating code:", codeError)
      return NextResponse.json(
        { error: "Failed to generate link code" },
        { status: 500 }
      )
    }

    const code = codeData

    // Create eternal link
    const { data: eternalLink, error: insertError } = await supabase
      .from("eternal_links")
      .insert({
        code: code,
        original_ad_id: adId,
        original_user_id: ad.user_id,
        archived_data: archivedData,
        admin_id: adminUser.id,
        admin_notes: adminNotes || null,
        status: "active",
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating eternal link:", insertError)
      return NextResponse.json(
        { error: "Failed to create eternal link" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      eternalLink: {
        id: eternalLink.id,
        code: eternalLink.code,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/e/${eternalLink.code}`,
        createdAt: eternalLink.created_at,
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
