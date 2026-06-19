import { NextRequest, NextResponse } from "next/server"

// ─── Stats export endpoint ────────────────────────────────────────────────────
// GET /api/stats/export?type=users&format=csv
// In production: query DB and stream response. For now returns structured JSON.
// ─────────────────────────────────────────────────────────────────────────────

const VALID_TYPES = new Set([
  "users","listings","payments","moderation","security","geo","media","revenue","alerts","audit"
])

function escapeCSV(v: unknown): string {
  const s = String(v ?? "").replace(/"/g, '""')
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escapeCSV(r[h])).join(",")),
  ].join("\n")
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type   = searchParams.get("type") || ""
  const format = searchParams.get("format") || "json"

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid report type." }, { status: 400 })
  }

  // In production: query the appropriate DB table here.
  // Placeholder column schemas for each type — client populates from localStorage.
  const schemas: Record<string, string[]> = {
    users:      ["userId","username","email","accountType","registeredAt","lastLoginAt","loginCount","adsCreated","totalSpentUSD","banned","riskScore"],
    listings:   ["listingId","ownerUserId","category","region","city","status","impressionsTotal","pageViews","contactClicks","favoritesSaved","riskScore"],
    payments:   ["paymentId","userId","coin","amountUSD","plan","processorStatus","invoicePaidAt","discountSource"],
    moderation: ["id","adminName","action","targetType","targetId","reason","timestamp"],
    security:   ["id","type","severity","hashedIp","userId","description","riskScore","resolved","timestamp"],
    geo:        ["country","state","city","visitors","users","listingViews","revenue","spamAttempts"],
    media:      ["id","userId","mediaType","sizeBytes","region","status","views","reports","uploadedAt"],
    revenue:    ["date","totalUSD","newSubscriptions","renewals","refunds","discounts","pending","failed"],
    alerts:     ["id","type","severity","title","message","read","resolved","createdAt"],
    audit:      ["id","adminName","action","resource","resourceId","timestamp"],
  }

  const columns = schemas[type] || []
  const today   = new Date().toISOString().slice(0, 10)
  const filename = `providerpost-${type}-${today}`

  if (format === "csv") {
    // Return empty CSV with correct headers — client will have populated data via localStorage
    const csv = columns.join(",") + "\n"
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    })
  }

  // JSON response with schema info
  return NextResponse.json({
    type,
    columns,
    exportedAt: new Date().toISOString(),
    note: "Connect to database to populate rows.",
  })
}
