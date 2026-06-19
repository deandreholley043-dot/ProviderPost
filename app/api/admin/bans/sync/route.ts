import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { ips } = await req.json()
    if (!Array.isArray(ips)) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 })
    }
    const response = NextResponse.json({ ok: true })
    response.cookies.set("banned_ips_srv", encodeURIComponent(JSON.stringify(ips)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    })
    return response
  } catch {
    return NextResponse.json({ error: "Sync failed." }, { status: 500 })
  }
}
