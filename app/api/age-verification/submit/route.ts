import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"

// POST /api/age-verification/submit - Submit ID for age verification
export async function POST(request: NextRequest) {
  try {
    // Verify user session
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

    const userId = session.user_id

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("document") as File
    const documentType = formData.get("documentType") as string
    const dateOfBirth = formData.get("dateOfBirth") as string

    // Validate
    if (!file) {
      return NextResponse.json(
        { error: "Document file required" },
        { status: 400 }
      )
    }

    if (!documentType || !["drivers_license", "passport", "state_id"].includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      )
    }

    if (!dateOfBirth) {
      return NextResponse.json(
        { error: "Date of birth required" },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type (JPEG, PNG, PDF only)" },
        { status: 400 }
      )
    }

    // Calculate age
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }

    // Must be 18+
    if (age < 18) {
      return NextResponse.json(
        { error: "You must be at least 18 years old" },
        { status: 400 }
      )
    }

    // Check for existing pending verification
    const adminSb = supabaseAdmin()
    const { data: existing } = await adminSb
      .from("age_verifications")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "pending")
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending verification. Please wait for review." },
        { status: 400 }
      )
    }

    // Create verification record with placeholder URL
    // (File upload would be handled by separate endpoint or S3 presigned URL)
    const { data: verification, error: createError } = await adminSb
      .from("age_verifications")
      .insert({
        user_id: userId,
        document_type: documentType,
        document_url: `pending/${userId}/${documentType}`,
        document_file_name: file.name,
        document_size: file.size,
        status: "pending",
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating verification:", createError)
      return NextResponse.json(
        { error: "Failed to submit verification" },
        { status: 500 }
      )
    }

    // Log submission
    await adminSb.rpc("log_age_verification_event", {
      p_verification_id: verification.id,
      p_admin_id: null,
      p_action: "submitted",
      p_details: {
        document_type: documentType,
        file_size: file.size,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
      },
    })

    return NextResponse.json({
      success: true,
      verification: {
        id: verification.id,
        status: verification.status,
        message: "Your age verification has been submitted and is awaiting admin review.",
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
