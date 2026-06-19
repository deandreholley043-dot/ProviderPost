// Backend utility functions

import crypto from "crypto"

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

// Hash password (bcrypt wrapper)
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.hash(password, 12)
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.compare(password, hash)
}

// Generate UUID
export function generateUUID(): string {
  return crypto.randomUUID()
}

// Format date for database
export function formatDateForDB(date: Date = new Date()): string {
  return date.toISOString()
}

// Parse database date
export function parseDBDate(dateString: string): Date {
  return new Date(dateString)
}

// Calculate pagination
export function getPaginationParams(page: number = 1, pageSize: number = 20) {
  const offset = (page - 1) * pageSize
  return { offset, limit: pageSize }
}

// Generate slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100)
}

// Format currency
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

// Calculate distance (simple formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Check if email is disposable
export async function isDisposableEmail(email: string): Promise<boolean> {
  const disposableDomains = [
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
  ]
  const domain = email.split("@")[1]?.toLowerCase()
  return disposableDomains.includes(domain || "")
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + "..."
}

// Parse query parameters
export function parseQueryParams(queryString: string): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {}

  if (!queryString) return params

  new URLSearchParams(queryString).forEach((value, key) => {
    if (params[key]) {
      const existing = params[key]
      params[key] = Array.isArray(existing) ? [...existing, value] : [existing as string, value]
    } else {
      params[key] = value
    }
  })

  return params
}

// Escape HTML
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

// Generate secure email token
export function generateEmailToken(): { token: string; hashedToken: string } {
  const token = generateSecureToken(32)
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
  return { token, hashedToken }
}

// Check subscription status
export function isSubscriptionActive(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date()
}

// Calculate time until expiration
export function getTimeUntilExpiration(expiresAt: string): { days: number; hours: number } {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return { days, hours }
}

// Generate random code
export function generateRandomCode(length: number = 6): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase()
}
