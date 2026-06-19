import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// PUT /api/admin/ads/manage - Update admin-created ad
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { providerId, ...updates } = body

    if (!providerId) {
      return NextResponse.json(
        { error: "Provider ID required" },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    // Verify it's an admin-created ad
    const { data: ad, error: checkError } = await supabase
      .from("providers")
      .select("admin_created, admin_created_by")
      .eq("id", providerId)
      .single()

    if (checkError || !ad) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      )
    }

    if (!ad.admin_created) {
      return NextResponse.json(
        { error: "Cannot edit user-created ads through admin endpoint" },
        { status: 403 }
      )
    }

    // Update the ad
    const { data: updated, error: updateError } = await supabase
      .from("providers")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId)
      .select()
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update advertisement" },
        { status: 500 }
      )
    }

    // Log the action
    await supabase.rpc("log_admin_ad_action", {
      p_admin_id: adminUser.id,
      p_provider_id: providerId,
      p_action: "updated",
      p_details: {
        updated_fields: Object.keys(updates),
        admin_notes: updates.admin_notes,
      },
    })

    return NextResponse.json({
      success: true,
      provider: updated,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/ads/manage - Delete admin-created ad
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { providerId } = body

    if (!providerId) {
      return NextResponse.json(
        { error: "Provider ID required" },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    // Verify it's an admin-created ad
    const { data: ad, error: checkError } = await supabase
      .from("providers")
      .select("admin_created, name")
      .eq("id", providerId)
      .single()

    if (checkError || !ad) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      )
    }

    if (!ad.admin_created) {
      return NextResponse.json(
        { error: "Cannot delete user-created ads through admin endpoint" },
        { status: 403 }
      )
    }

    // Log before deletion
    await supabase.rpc("log_admin_ad_action", {
      p_admin_id: adminUser.id,
      p_provider_id: providerId,
      p_action: "deleted",
      p_details: {
        ad_title: ad.name,
      },
    })

    // Delete the ad (cascades to images, etc.)
    const { error: deleteError } = await supabase
      .from("providers")
      .delete()
      .eq("id", providerId)

    if (deleteError) {
      console.error("Delete error:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete advertisement" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Advertisement deleted",
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
