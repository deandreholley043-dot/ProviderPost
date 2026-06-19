import { NextRequest, NextResponse } from "next/server"
import { getActivePromosDb } from "@/lib/promo-db"
import { promoTypeLabel } from "@/lib/promo-store"

export async function GET(request: NextRequest) {
  try {
    const promos = await getActivePromosDb()

    // Map to public-facing format
    const publicPromos = promos.map((promo) => ({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      label: promoTypeLabel(promo.type, promo.value),
      description: promo.description,
    }))

    return NextResponse.json({
      success: true,
      promos: publicPromos,
      count: publicPromos.length,
    })
  } catch (error) {
    console.error("Error fetching active promos:", error)
    return NextResponse.json(
      { error: "Failed to fetch active promos" },
      { status: 500 }
    )
  }
}
