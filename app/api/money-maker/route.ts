// ─── Money Maker Tracker API ──────────────────────────────────────────────────
// Separate route — nothing shared with /api/payments or /api/stats
// All business logic lives in lib/money-maker-store.ts
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server"

// GET /api/money-maker?month=2026-05
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7)

  // In production: query money_maker_* database tables here
  // For now: return 200 with the month so client can use localStorage store
  return NextResponse.json({ month, note: "Connect to money_maker DB tables for server-side data." })
}

// POST /api/money-maker  { type: "log_revenue" | "add_adjustment" | "update_daily", ... }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type } = body

    if (!type) return NextResponse.json({ error: "Missing type" }, { status: 400 })

    // In production: write to money_maker_revenue_logs, money_maker_daily_stats, etc.
    // For now: acknowledge and let client handle localStorage persistence
    return NextResponse.json({ ok: true, type, received: body })
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}

// DELETE /api/money-maker?month=2026-05  — reset a month
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month")
  if (!month) return NextResponse.json({ error: "Missing month" }, { status: 400 })
  // In production: DELETE FROM money_maker_revenue_logs WHERE month = ?
  return NextResponse.json({ ok: true, reset: month })
}
