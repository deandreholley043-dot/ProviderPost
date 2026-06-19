import { NextRequest, NextResponse } from "next/server"
import { supabaseServer, supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

// PUT /api/admin/photos/photo?id=photoId - Admin verify/reject photo
export async function PUT(request: NextRequest) {
  try {
    const photoId = new URL(request.url).searchParams.get("id")
    
    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action, reason } = body // action: 'approve' | 'reject' | 'flag' | 'unflag'

    if (!action) {
      return NextResponse.json(
        { error: "Action required (approve, reject, flag, unflag)" },
        { status: 400 }
      )
    }

    // Verify admin
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 403 }
      )
    }

    const supabase = supabaseAdmin()

    // Get the photo
    const { data: photo } = await supabase
      .from("provider_images")
      .select("*")
      .eq("id", photoId)
      .single()

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      )
    }

    let updates: any = {
      updated_at: new Date().toISOString(),
    }

    let actionType = ""
    let newStatus = photo.moderation_status

    // Handle different actions
    if (action === "approve") {
      updates.manually_verified = true
      updates.manually_verified_by = adminUser.id
      updates.manually_verified_at = new Date().toISOString()
      updates.moderation_status = "approved"
      actionType = "approved"
      newStatus = "approved"
    } else if (action === "reject") {
      updates.moderation_status = "rejected"
      updates.verification_notes = reason || "Admin rejected"
      actionType = "rejected"
      newStatus = "rejected"
    } else if (action === "flag") {
      updates.flagged_for_moderation = true
      updates.verification_notes = reason || "Admin flagged for review"
      actionType = "flagged"
    } else if (action === "unflag") {
      updates.flagged_for_moderation = false
      updates.verification_notes = reason || "Admin unflagged"
      actionType = "unflagged"
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    // Update photo
    const { data: updatedPhoto, error: updateError } = await supabase
      .from("provider_images")
      .update(updates)
      .eq("id", photoId)
      .select()
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update photo" },
        { status: 500 }
      )
    }

    // Log action
    const { error: logError } = await supabase
      .from("admin_photo_actions")
      .insert({
        admin_id: adminUser.id,
        photo_id: photoId,
        action: actionType,
        reason: reason || null,
        old_status: photo.moderation_status,
        new_status: newStatus,
      })

    if (logError) {
      console.warn("Failed to log admin action:", logError)
    }

    // Get provider info for the response
    const { data: provider } = await supabase
      .from("providers")
      .select("id, name")
      .eq("id", photo.provider_id)
      .single()

    return NextResponse.json({
      success: true,
      action: actionType,
      photo: updatedPhoto,
      provider: provider,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/admin/photos/photo?id=photoId - Get photo details with admin info
export async function GET(request: NextRequest) {
  try {
    const photoId = new URL(request.url).searchParams.get("id")

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID required" },
        { status: 400 }
      )
    }

    // Verify admin
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 403 }
      )
    }

    const supabase = supabaseAdmin()

    // Get photo with provider info
    const { data: photo } = await supabase
      .from("provider_images")
      .select("*")
      .eq("id", photoId)
      .single()

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      )
    }

    // Get provider
    const { data: provider } = await supabase
      .from("providers")
      .select("id, name, email, phone, age, created_at")
      .eq("id", photo.provider_id)
      .single()

    // Get admin actions history
    const { data: actions } = await supabase
      .from("admin_photo_actions")
      .select("*")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      success: true,
      photo,
      provider,
      actions: actions || [],
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
