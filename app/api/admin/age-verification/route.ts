import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// GET /api/admin/age-verification - List pending verifications
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("pp_session")

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const supabase = supabaseAdmin()
    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", sessionCookie.value)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: "Session invalid" },
        { status: 401 }
      )
    }

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user_id)
      .single()

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const adminSb = supabaseAdmin()
    const status = request.nextUrl.searchParams.get("status") || "pending"

    // Get verifications
    const { data: verifications, error } = await adminSb
      .from("age_verifications")
      .select(`
        id,
        user_id,
        status,
        document_type,
        document_url,
        created_at,
        reviewed_at,
        rejection_reason,
        users!inner(email)
      `)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching verifications:", error)
      return NextResponse.json(
        { error: "Failed to fetch verifications" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: verifications?.length || 0,
      verifications: verifications || [],
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
