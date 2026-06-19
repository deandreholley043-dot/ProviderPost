"use client"

// ─── ProviderPost Tracker ─────────────────────────────────────────────────────
// Lightweight client-side event tracker. Non-blocking, fire-and-forget.
// Sends events to /api/stats/event via navigator.sendBeacon when possible,
// falls back to fetch. Target: <3KB, <50ms response.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"

// ─── Fingerprinting (no MAC, no invasive APIs) ────────────────────────────────

function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return ""
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.platform || "",
    (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency || 0,
    navigator.cookieEnabled ? "1" : "0",
  ]
  // Simple FNV hash
  let h = 0x811c9dc5
  const str = parts.join("|")
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, "0")
}

function getOrCreateCookieId(): string {
  if (typeof window === "undefined") return ""
  const key = "pp_vid"
  let id = localStorage.getItem(key)
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(key, id)
  }
  return id
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""
  const key = "pp_sid"
  // Session expires after 30 min of inactivity
  const tsKey = "pp_sid_ts"
  const lastTs = parseInt(sessionStorage.getItem(tsKey) || "0")
  const now = Date.now()
  if (now - lastTs > 30 * 60 * 1000) {
    const sid = Math.random().toString(36).slice(2) + now.toString(36)
    sessionStorage.setItem(key, sid)
  }
  sessionStorage.setItem(tsKey, now.toString())
  return sessionStorage.getItem(key) || ""
}

function getDeviceType(): "desktop" | "mobile" | "tablet" {
  if (typeof window === "undefined") return "desktop"
  const ua = navigator.userAgent
  if (/tablet|ipad/i.test(ua)) return "tablet"
  if (/mobile|android|iphone/i.test(ua)) return "mobile"
  return "desktop"
}

// ─── Fire event ───────────────────────────────────────────────────────────────

function fireEvent(type: string, target = "", value = "", meta: Record<string, string> = {}) {
  if (typeof window === "undefined") return
  const payload = {
    t: type,          // event type
    tgt: target,      // target element/page
    val: value,       // value
    pg: window.location.pathname,
    sid: getOrCreateSessionId(),
    vid: getOrCreateCookieId(),
    fp: getDeviceFingerprint(),
    dev: getDeviceType(),
    ref: document.referrer || "",
    lang: navigator.language || "",
    sw: screen.width,
    sh: screen.height,
    ts: Date.now(),
    ...meta,
  }

  // Use sendBeacon for fire-and-forget (does not block page unload)
  const data = JSON.stringify(payload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/stats/event", new Blob([data], { type: "application/json" }))
  } else {
    fetch("/api/stats/event", {
      method: "POST",
      body: data,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {})
  }
}

// ─── Auto-click tracker ───────────────────────────────────────────────────────

function attachClickTracker() {
  if (typeof window === "undefined") return
  document.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest("a,button,[data-track]")
    if (!el) return
    const label = el.getAttribute("data-track") ||
                  el.getAttribute("aria-label") ||
                  el.textContent?.trim().slice(0, 40) ||
                  el.tagName.toLowerCase()
    const href = (el as HTMLAnchorElement).href || ""
    // Detect specific event types from element context
    if (href.startsWith("tel:")) { fireEvent("phone_click", label, href); return }
    if (href.includes("wa.me"))  { fireEvent("whatsapp_click", label, href); return }
    if (label.toLowerCase().includes("wechat")) { fireEvent("wechat_click", label, href); return }
    if (label.toLowerCase().includes("favorite") || label.toLowerCase().includes("save")) { fireEvent("favorite", label, href); return }
    fireEvent("click", label, href)
  }, { passive: true })
}

// ─── Scroll depth tracker ─────────────────────────────────────────────────────

function attachScrollTracker(sessionId: string) {
  if (typeof window === "undefined") return
  let maxDepth = 0
  let sent25 = false, sent50 = false, sent75 = false, sent100 = false

  const handler = () => {
    const depth = Math.round(
      ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    )
    if (depth > maxDepth) {
      maxDepth = depth
      if (!sent25 && depth >= 25)  { sent25  = true; fireEvent("scroll_depth", "25%",  sessionId) }
      if (!sent50 && depth >= 50)  { sent50  = true; fireEvent("scroll_depth", "50%",  sessionId) }
      if (!sent75 && depth >= 75)  { sent75  = true; fireEvent("scroll_depth", "75%",  sessionId) }
      if (!sent100 && depth >= 100){ sent100 = true; fireEvent("scroll_depth", "100%", sessionId) }
    }
  }
  window.addEventListener("scroll", handler, { passive: true })
  return () => window.removeEventListener("scroll", handler)
}

// ─── React hook ───────────────────────────────────────────────────────────────

export function useTracker(userId?: string) {
  const pathname = usePathname()
  const startTimeRef = useRef(Date.now())
  const sessionId = useRef("")

  useEffect(() => {
    sessionId.current = getOrCreateSessionId()
    attachClickTracker()
    const cleanup = attachScrollTracker(sessionId.current)
    return cleanup
  }, [])

  useEffect(() => {
    // Track page view on route change
    const sid = getOrCreateSessionId()
    fireEvent("page_view", pathname, "", { uid: userId || "" })
    startTimeRef.current = Date.now()

    // Track time on page when user leaves
    return () => {
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000)
      fireEvent("time_on_page", pathname, String(timeOnPage), { uid: userId || "" })
    }
  }, [pathname, userId])

  // Expose manual track function
  const track = useCallback((type: string, target = "", value = "", meta: Record<string, string> = {}) => {
    fireEvent(type, target, value, { ...meta, uid: userId || "" })
  }, [userId])

  return { track }
}

// ─── Standalone tracker (for non-React contexts) ──────────────────────────────

export const tracker = {
  pageView:      (page: string)                       => fireEvent("page_view", page),
  click:         (target: string, value = "")         => fireEvent("click", target, value),
  phoneClick:    (number: string)                     => fireEvent("phone_click", number),
  whatsapp:      (number: string)                     => fireEvent("whatsapp_click", number),
  wechat:        (id: string)                         => fireEvent("wechat_click", id),
  adView:        (listingId: string)                  => fireEvent("ad_view", listingId),
  adImpression:  (listingId: string)                  => fireEvent("ad_impression", listingId),
  contact:       (listingId: string)                  => fireEvent("contact", listingId),
  favorite:      (listingId: string)                  => fireEvent("favorite", listingId),
  share:         (listingId: string)                  => fireEvent("share", listingId),
  search:        (query: string)                      => fireEvent("search", query),
  payment:       (paymentId: string, plan: string)    => fireEvent("payment", paymentId, plan),
  login:         (userId: string)                     => fireEvent("login", userId),
  register:      (userId: string, type: string)       => fireEvent("register", userId, type),
  upload:        (type: "photo" | "video", count = 1) => fireEvent("upload", type, String(count)),
  custom:        (name: string, value = "")           => fireEvent("custom", name, value),
}
