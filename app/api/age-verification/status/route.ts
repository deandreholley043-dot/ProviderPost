import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// GET /api/age-verification/status - Get verification status
export async function GET(request: NextRequest) {
  try {
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

    const adminSb = supabaseAdmin()

    // Get user's verification status
    const { data: user } = await adminSb
      .from("users")
      .select("age_verified, age_verified_at, age_verification_expires_at")
      .eq("id", session.user_id)
      .single()

    // Get latest verification record
    const { data: verification } = await adminSb
      .from("age_verifications")
      .select("*")
      .eq("user_id", session.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    const isVerified = user?.age_verified && 
      (!user?.age_verification_expires_at || new Date(user.age_verification_expires_at) > new Date())

    return NextResponse.json({
      success: true,
      verified: isVerified,
      verification: verification ? {
        id: verification.id,
        status: verification.status,
        documentType: verification.document_type,
        submittedAt: verification.created_at,
        reviewedAt: verification.reviewed_at,
        rejectionReason: verification.rejection_reason,
        expiresAt: verification.verification_expiry_date,
      } : null,
      verified_at: user?.age_verified_at,
      expires_at: user?.age_verification_expires_at,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
