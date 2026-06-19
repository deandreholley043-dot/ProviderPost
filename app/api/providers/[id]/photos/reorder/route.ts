import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const providerId = id

    // Check authentication
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("pp_session")

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user from session
    const supabase = supabaseAdmin()
    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", sessionCookie.value)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      )
    }

    const userId = session.user_id

    // Verify ownership
    const { data: provider } = await supabase
      .from("providers")
      .select("id")
      .eq("id", providerId)
      .eq("id", userId) // Enforce user owns this provider
      .single()

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found or unauthorized" },
        { status: 403 }
      )
    }

    // Parse request
    const { photoIds } = await request.json()

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid photoIds array" },
        { status: 400 }
      )
    }

    if (photoIds.length > 6) {
      return NextResponse.json(
        { error: "Maximum 6 photos allowed" },
        { status: 400 }
      )
    }

    // Verify all photos belong to this provider
    const { data: photos } = await supabase
      .from("provider_images")
      .select("id")
      .eq("provider_id", providerId)
      .in("id", photoIds)

    if (!photos || photos.length !== photoIds.length) {
      return NextResponse.json(
        { error: "Some photos not found or don't belong to you" },
        { status: 400 }
      )
    }

    // Update display_order for each photo
    const updates = photoIds.map((photoId, index) => ({
      id: photoId,
      display_order: index,
      updated_at: new Date().toISOString(),
    }))

    // Batch update - use individual updates since Supabase doesn't support batch in this way
    for (const update of updates) {
      await supabase
        .from("provider_images")
        .update({ display_order: update.display_order })
        .eq("id", update.id)
    }

    return NextResponse.json({
      success: true,
      message: "Photos reordered successfully",
    })
  } catch (error) {
    console.error("Reorder error:", error)
    return NextResponse.json(
      { error: "Failed to reorder photos" },
      { status: 500 }
    )
  }
}
