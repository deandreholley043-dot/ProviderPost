// Middleware utilities for backend

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseServer, supabaseAdmin } from "@/lib/supabase"
import { AuthenticationError, AuthorizationError, RateLimitError } from "./errors"

// Verify user session
export async function verifyUserSession(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("pp_session")

    if (!sessionCookie) {
      throw new AuthenticationError()
    }

    const supabase = supabaseAdmin()
    const { data: session } = await supabase
      .from("sessions")
      .select("user_id, expires_at")
      .eq("token", sessionCookie.value)
      .single()

    if (!session) {
      throw new AuthenticationError()
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      throw new AuthenticationError("Session expired")
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", session.user_id)
      .single()

    return user
  } catch (error) {
    throw new AuthenticationError()
  }
}

// Verify admin session
export async function verifyAdminSession(request: NextRequest) {
  try {
    const user = await verifyUserSession(request)

    if (user?.role !== "admin") {
      throw new AuthorizationError()
    }

    return user
  } catch (error) {
    throw error instanceof AuthenticationError
      ? error
      : new AuthorizationError()
  }
}

// Rate limiting (in-memory for MVP, replace with Redis for scale)
const rateLimitStore = new Map<string, Array<number>>()

export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<boolean> {
  const now = Date.now()
  const key = identifier

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, [])
  }

  const timestamps = rateLimitStore.get(key)!
  const recentTimestamps = timestamps.filter((ts) => now - ts < windowMs)

  if (recentTimestamps.length >= limit) {
    throw new RateLimitError(Math.ceil(windowMs / 1000))
  }

  recentTimestamps.push(now)
  rateLimitStore.set(key, recentTimestamps)

  return true
}

// IP whitelist check
export async function verifyIPAllowed(ipAddress: string) {
  const supabase = supabaseAdmin()
  const { data: ban } = await supabase
    .from("bans")
    .select("id")
    .eq("ip_address", ipAddress)
    .eq("status", "active")
    .single()

  if (ban) {
    throw new AuthorizationError("IP address is banned")
  }

  return true
}

// Extract IP from request
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = request.headers.get("x-real-ip")
  return forwarded ? forwarded.split(",")[0] : ip || "unknown"
}

// CORS headers
export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

// Security headers
export function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  }
}

// Log request
export function logRequest(
  method: string,
  path: string,
  userId?: string,
  details?: any
) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${method} ${path}${userId ? ` [User: ${userId}]` : ""}`, details)
}
