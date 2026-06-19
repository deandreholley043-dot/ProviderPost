import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// GET /api/eternal-links/[code] - Get eternal link data (public)
export async function GET(request: NextRequest) {
  try {
    const code = new URL(request.url).pathname.split("/")[3]

    if (!code || code.length < 6 || code.length > 10) {
      return NextResponse.json(
        { error: "Invalid code" },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    // Get eternal link (bypasses RLS for public view)
    const { data: link, error } = await supabase
      .from("eternal_links")
      .select("*")
      .eq("code", code)
      .eq("status", "active")
      .single()

    if (error || !link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        code: link.code,
        archived_data: link.archived_data,
        status: link.status,
        created_at: link.created_at,
        total_views: link.total_views,
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
