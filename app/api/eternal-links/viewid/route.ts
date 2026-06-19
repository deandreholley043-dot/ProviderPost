import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// POST /api/eternal-links/[code]/view - Track view
export async function POST(request: NextRequest) {
  try {
    const code = new URL(request.url).pathname.split("/")[3]
    const body = await request.json()
    const { referrer } = body

    if (!code) {
      return NextResponse.json(
        { error: "Code required" },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    // Get eternal link
    const { data: link, error: linkError } = await supabase
      .from("eternal_links")
      .select("id")
      .eq("code", code)
      .eq("status", "active")
      .single()

    if (linkError || !link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      )
    }

    // Get IP and user agent from request
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Try to get country from IP (optional, using simple method)
    let country = null
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip.split(",")[0]}/json/`)
      if (geoRes.ok) {
        const geoData = await geoRes.json()
        country = geoData.country_code
      }
    } catch (error) {
      // Silently fail - country is optional
    }

    // Insert view record
    const { error: viewError } = await supabase
      .from("eternal_link_views")
      .insert({
        eternal_link_id: link.id,
        ip_address: ip.split(",")[0], // Get first IP if multiple
        user_agent: userAgent,
        referrer: referrer || null,
        country: country,
        viewed_at: new Date().toISOString(),
      })

    if (viewError) {
      console.error("Error recording view:", viewError)
      // Don't fail - view tracking is non-critical
    }

    // Increment view count
    await supabase.rpc("increment_eternal_link_views", { p_code: code })

    return NextResponse.json({
      success: true,
      message: "View recorded",
    })
  } catch (error) {
    console.error("Error:", error)
    // Return success anyway - view tracking is non-critical
    return NextResponse.json(
      { success: true, message: "View recorded" },
      { status: 200 }
    )
  }
}
