import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabaseServer } from "@/lib/supabase"
import { cookies } from "next/headers"
import { sendAdApprovedEmail, sendAdRejectedEmail } from "@/lib/email/send"

// PUT /api/admin/moderation/approve?id=providerId
export async function PUT(request: NextRequest) {
  try {
    const providerId = new URL(request.url).searchParams.get("id")
    
    if (!providerId) {
      return NextResponse.json(
        { error: "Provider ID required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action, reason } = body

    if (!action) {
      return NextResponse.json(
        { error: "Action required (approve, reject, flag)" },
        { status: 400 }
      )
    }

    // Verify admin
    const adminUser = await verifyAdmin()
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - admin only" },
        { status: 403 }
      )
    }

    const supabase = supabaseAdmin()

    // Get the provider/ad
    const { data: provider, error: getError } = await supabase
      .from("providers")
      .select(
        `id, name, email, moderation_status, flagged_for_moderation`
      )
      .eq("id", providerId)
      .single()

    if (getError || !provider) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      )
    }

    let updates: any = {
      updated_at: new Date().toISOString(),
    }

    let actionType = ""
    let newStatus = provider.moderation_status

    // Handle actions
    if (action === "approve") {
      updates.moderation_status = "approved"
      actionType = "approved"
      newStatus = "approved"
    } else if (action === "reject") {
      if (!reason) {
        return NextResponse.json(
          { error: "Reason required for rejection" },
          { status: 400 }
        )
      }
      updates.moderation_status = "rejected"
      updates.rejection_reason = reason
      actionType = "rejected"
      newStatus = "rejected"
    } else if (action === "flag") {
      updates.flagged_for_moderation = true
      actionType = "flagged"
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Update provider
    const { data: updatedProvider, error: updateError } = await supabase
      .from("providers")
      .update(updates)
      .eq("id", providerId)
      .select()
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update ad" },
        { status: 500 }
      )
    }

    // Log action
    const { error: logError } = await supabase
      .from("moderation_logs")
      .insert({
        admin_id: adminUser.id,
        provider_id: providerId,
        action: actionType,
        reason: reason || null,
        old_status: provider.moderation_status,
        new_status: newStatus,
      })

    if (logError) {
      console.warn("Failed to log action:", logError)
    }

    // Send email
    try {
      if (action === "approve") {
        await sendAdApprovedEmail(
          provider.email,
          provider.name,
          provider.name,
          `https://providerpost.com/providers/${providerId}`
        )
      } else if (action === "reject") {
        await sendAdRejectedEmail(provider.email, provider.name, provider.name, reason)
      }
    } catch (emailError) {
      console.warn("Failed to send email:", emailError)
    }

    return NextResponse.json({
      success: true,
      action: actionType,
      provider: updatedProvider,
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
