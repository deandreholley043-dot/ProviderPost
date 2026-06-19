import { NextRequest, NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/r2-upload"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

// Rate limiter (in-memory for MVP, use Redis in production)
const uploadRateLimiter = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const limit = uploadRateLimiter.get(userId)

  if (!limit || now > limit.resetAt) {
    uploadRateLimiter.set(userId, { count: 1, resetAt: now + 60000 })
    return true
  }

  if (limit.count >= 10) return false

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
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

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 10 uploads per minute." },
        { status: 429 }
      )
    }

    // Parse multipart form
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to R2
    const uploadResult = await uploadToR2(buffer, file.name)

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      )
    }

    // Save to database
    const { data, error } = await supabase
      .from("provider_images")
      .insert({
        provider_id: userId,
        cloudflare_url: uploadResult.url,
        file_size: uploadResult.size,
        width: uploadResult.width,
        height: uploadResult.height,
        hash: uploadResult.hash,
        moderation_status: "pending",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to save photo metadata" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      photoId: data.id,
      url: uploadResult.url,
      size: uploadResult.size,
      width: uploadResult.width,
      height: uploadResult.height,
      hash: uploadResult.hash,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
