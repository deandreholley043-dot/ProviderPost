const KEY = "providerpost_site_settings"

export interface SiteSettings {
  siteName: string
  siteDescription: string
  enableRegistration: boolean
  enableReviews: boolean
  enableForum: boolean
  requireEmailVerification: boolean
}

const DEFAULTS: SiteSettings = {
  siteName: "ProviderPost",
  siteDescription: "",
  enableRegistration: true,
  enableReviews: true,
  enableForum: true,
  requireEmailVerification: false,
}

export function getSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function saveSiteSettings(settings: SiteSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(settings))
}
