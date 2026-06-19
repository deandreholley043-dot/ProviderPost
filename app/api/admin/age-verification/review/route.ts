import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// POST /api/admin/age-verification/review - Approve or reject verification
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { verificationId, action, dateOfBirth, rejectionReason, adminNotes } = body

    if (!verificationId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    const adminSb = supabaseAdmin()

    if (action === "approve") {
      if (!dateOfBirth) {
        return NextResponse.json(
          { error: "Date of birth required for approval" },
          { status: 400 }
        )
      }

      // Call approval function
      const { error: approvalError } = await adminSb.rpc("approve_age_verification", {
        p_verification_id: verificationId,
        p_admin_id: session.user_id,
        p_dob: dateOfBirth,
      })

      if (approvalError) {
        console.error("Approval error:", approvalError)
        return NextResponse.json(
          { error: "Failed to approve verification" },
          { status: 500 }
        )
      }

      // Update admin notes if provided
      if (adminNotes) {
        await adminSb
          .from("age_verifications")
          .update({ admin_notes: adminNotes })
          .eq("id", verificationId)
      }

      return NextResponse.json({
        success: true,
        message: "Age verification approved",
      })
    } else if (action === "reject") {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: "Rejection reason required" },
          { status: 400 }
        )
      }

      // Call rejection function
      const { error: rejectionError } = await adminSb.rpc("reject_age_verification", {
        p_verification_id: verificationId,
        p_admin_id: session.user_id,
        p_reason: rejectionReason,
      })

      if (rejectionError) {
        console.error("Rejection error:", rejectionError)
        return NextResponse.json(
          { error: "Failed to reject verification" },
          { status: 500 }
        )
      }

      // Update admin notes if provided
      if (adminNotes) {
        await adminSb
          .from("age_verifications")
          .update({ admin_notes: adminNotes })
          .eq("id", verificationId)
      }

      return NextResponse.json({
        success: true,
        message: "Age verification rejected",
      })
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
