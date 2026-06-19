import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// POST /api/admin/ads/create - Create ad as admin (no verification required)
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
    const {
      name,
      email,
      phone,
      age,
      city,
      state,
      description,
      rates_per_hour,
      category,
      ethnicity,
      hair_color,
      eye_color,
      height,
      weight,
      website,
      messaging_apps,
      service_type,
      availability,
      languages,
      membership_level,
      adminNotes,
    } = body

    // Validate required fields
    if (!name || !email || !phone || !age || !city || !state || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    // Create the admin-created ad
    const { data: provider, error: createError } = await supabase
      .from("providers")
      .insert({
        // Basic info
        name: name,
        email: email,
        phone: phone,
        age: parseInt(age),
        city: city,
        state: state,
        description: description,
        
        // Rates & services
        rates_per_hour: parseFloat(rates_per_hour),
        category: category || "escort",
        service_type: service_type || "incall",
        
        // Appearance
        ethnicity: ethnicity || null,
        hair_color: hair_color || null,
        eye_color: eye_color || null,
        height: height || null,
        weight: weight || null,
        
        // Contact & links
        website: website || null,
        messaging_apps: messaging_apps || null,
        
        // Details
        availability: availability || null,
        languages: languages || null,
        
        // Membership
        membership_level: membership_level || "free",
        membership_expiry: null,
        active: true,
        
        // Moderation
        moderation_status: "approved", // Auto-approve admin-created ads
        flagged_for_moderation: false,
        
        // Admin creation flags
        admin_created: true,
        admin_created_by: adminUser.id,
        admin_created_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
        
        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating admin ad:", createError)
      return NextResponse.json(
        { error: "Failed to create advertisement" },
        { status: 500 }
      )
    }

    // Log the action
    await supabase.rpc("log_admin_ad_action", {
      p_admin_id: adminUser.id,
      p_provider_id: provider.id,
      p_action: "created",
      p_details: {
        name: name,
        email: email,
        category: category,
        admin_notes: adminNotes,
      },
    })

    return NextResponse.json({
      success: true,
      provider: provider,
      message: `Ad created successfully. Auto-approved (admin-created).`,
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
