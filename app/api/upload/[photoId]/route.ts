import { NextRequest, NextResponse } from "next/server"
import { deleteFromR2 } from "@/lib/r2-upload"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params

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

    // Verify ownership - photo must belong to this user
    const { data: photo, error: photoError } = await supabase
      .from("provider_images")
      .select("provider_id")
      .eq("id", photoId)
      .single()

    if (photoError || !photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      )
    }

    if (photo.provider_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Delete from R2
    const deleted = await deleteFromR2(photoId)

    if (!deleted) {
      console.warn(`Failed to delete photo ${photoId} from R2`)
      // Continue anyway, remove from DB
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("provider_images")
      .delete()
      .eq("id", photoId)

    if (deleteError) {
      console.error("Database delete error:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete photo" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}
