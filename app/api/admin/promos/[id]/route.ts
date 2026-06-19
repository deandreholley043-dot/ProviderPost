import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deletePromoCodeDb, togglePromoActiveDb } from "@/lib/promo-db"

async function isAdmin(): Promise<boolean> {
  const adminToken = (await cookies()).get("admin_token")
  return !!adminToken && adminToken.value === process.env.ADMIN_TOKEN_SECRET
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Promo ID is required" },
        { status: 400 }
      )
    }

    const success = await deletePromoCodeDb(id)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete promo" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting promo:", error)
    return NextResponse.json(
      { error: "Failed to delete promo" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const { id } = await params
    const { active } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "Promo ID is required" },
        { status: 400 }
      )
    }

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Active flag is required and must be boolean" },
        { status: 400 }
      )
    }

    const success = await togglePromoActiveDb(id, active)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update promo" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      active,
    })
  } catch (error) {
    console.error("Error updating promo:", error)
    return NextResponse.json(
      { error: "Failed to update promo" },
      { status: 500 }
    )
  }
}
