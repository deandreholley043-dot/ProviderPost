import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// PUT /api/admin/eternal-links/[id] - Update eternal link status
export async function PUT(request: NextRequest) {
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
    const { linkId, action } = body // action: 'enable' | 'disable'

    if (!linkId || !action) {
      return NextResponse.json(
        { error: "Link ID and action required" },
        { status: 400 }
      )
    }

    if (!["enable", "disable"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    // Get the eternal link
    const { data: link, error: getError } = await supabase
      .from("eternal_links")
      .select("*")
      .eq("id", linkId)
      .single()

    if (getError || !link) {
      return NextResponse.json(
        { error: "Eternal link not found" },
        { status: 404 }
      )
    }

    // Update status
    const newStatus = action === "enable" ? "active" : "disabled"

    const { data: updated, error: updateError } = await supabase
      .from("eternal_links")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", linkId)
      .select()
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update eternal link" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      link: updated,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/eternal-links/[id] - Delete eternal link
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 403 }
      )
    }

    const { linkId } = await request.json()

    if (!linkId) {
      return NextResponse.json(
        { error: "Link ID required" },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    // Delete the eternal link (cascades to views)
    const { error } = await supabase
      .from("eternal_links")
      .delete()
      .eq("id", linkId)

    if (error) {
      console.error("Delete error:", error)
      return NextResponse.json(
        { error: "Failed to delete eternal link" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Eternal link deleted",
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
