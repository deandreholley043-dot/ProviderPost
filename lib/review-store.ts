// ─── Types ────────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  providerId: string
  providerName: string
  authorUsername: string
  rating: number
  text: string
  postedAt: string      // ISO timestamp
  read: boolean         // admin has seen it
}

export interface TrackedProfile {
  id: string            // provider ID
  name: string          // provider display name
  trackedAt: string     // ISO timestamp
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

const REVIEWS_KEY  = "providerpost_reviews"
const TRACKED_KEY  = "providerpost_tracked_profiles"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadReviews(): Review[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveReviews(reviews: Review[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
}

function loadTracked(): TrackedProfile[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(TRACKED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveTracked(tracked: TrackedProfile[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TRACKED_KEY, JSON.stringify(tracked))
}

// ─── Reviews API ──────────────────────────────────────────────────────────────

export function getAllReviews(): Review[] {
  return loadReviews().sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
}

export function getReviewsForProvider(providerId: string): Review[] {
  return loadReviews()
    .filter((r) => r.providerId === providerId)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
}

export function getUnreadCount(): number {
  return loadReviews().filter((r) => !r.read).length
}

export function addReview(params: {
  providerId: string
  providerName: string
  authorUsername: string
  rating: number
  text: string
}): Review {
  const reviews = loadReviews()
  const review: Review = {
    id: crypto.randomUUID(),
    ...params,
    postedAt: new Date().toISOString(),
    read: false,
  }
  reviews.push(review)
  saveReviews(reviews)
  return review
}

export function deleteReview(id: string): void {
  saveReviews(loadReviews().filter((r) => r.id !== id))
}

export function markAllRead(): void {
  saveReviews(loadReviews().map((r) => ({ ...r, read: true })))
}

export function markReviewRead(id: string): void {
  saveReviews(loadReviews().map((r) => r.id === id ? { ...r, read: true } : r))
}

// ─── Tracked Profiles API ─────────────────────────────────────────────────────

export function getTrackedProfiles(): TrackedProfile[] {
  return loadTracked()
}

export function isTracked(providerId: string): boolean {
  return loadTracked().some((p) => p.id === providerId)
}

export function addTrackedProfile(id: string, name: string): void {
  const tracked = loadTracked()
  if (tracked.some((p) => p.id === id)) return
  tracked.push({ id, name, trackedAt: new Date().toISOString() })
  saveTracked(tracked)
}

export function removeTrackedProfile(id: string): void {
  saveTracked(loadTracked().filter((p) => p.id !== id))
}

export function getTrackedReviews(): Review[] {
  const trackedIds = loadTracked().map((p) => p.id)
  return loadReviews()
    .filter((r) => trackedIds.includes(r.providerId))
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
}
