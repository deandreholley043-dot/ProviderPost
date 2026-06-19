// ─── SEO Image Indexing System ────────────────────────────────────────────────
//
// This module is a SEPARATE layer from the user-facing photo/video upload system.
// It does NOT touch PhotoUploader, VideoUploader, or any existing image logic.
// It exists purely for: sitemaps, structured data, meta tags, and SEO indexing.
//
// The normal image system continues to function exactly as before.
// ─────────────────────────────────────────────────────────────────────────────

export interface SeoImageRecord {
  // Primary key
  id: string

  // Foreign keys — link to provider/listing without modifying their tables
  provider_id: string
  listing_id: string

  // Reference to the original image in the user-facing system (by filename/id)
  // We store the reference only — we do NOT re-process or replace the image
  original_image_id: string

  // Phone formats — both stored for SEO/indexing purposes
  phone_display_format: string   // e.g. "898-222-2222"
  phone_digits_format: string    // e.g. "8982222222"

  // SEO-specific filename for indexing (does not rename the actual file)
  // Format: {city}-{state}-provider-{sanitized-name}-{index}.jpg
  seo_filename: string

  // Alt text for structured data / image sitemaps
  seo_alt_text: string

  // Caption for structured data (Schema.org ImageObject)
  seo_caption: string

  // Canonical indexable URL for image sitemaps and structured data
  // Points to where search engines should index the image
  seo_indexable_url: string

  // Audit timestamps
  created_at: string   // ISO timestamp
  updated_at: string   // ISO timestamp
}

// ─── Storage ──────────────────────────────────────────────────────────────────
// Backed by localStorage in this frontend-only build.
// In production, replace load/save with database calls (Supabase, Postgres, etc.)

const SEO_TABLE_KEY = "providerpost_seo_image_index"

function loadTable(): SeoImageRecord[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(SEO_TABLE_KEY) || "[]")
  } catch {
    return []
  }
}

function saveTable(records: SeoImageRecord[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SEO_TABLE_KEY, JSON.stringify(records))
}

// ─── Phone format helpers ─────────────────────────────────────────────────────

export function toDisplayFormat(phone: string): string {
  // Strip everything except digits
  const digits = phone.replace(/\D/g, "")
  // Handle 10-digit US numbers: 8982222222 → 898-222-2222
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  // Handle 11-digit with country code: 18982222222 → 1-898-222-2222
  if (digits.length === 11 && digits[0] === "1") {
    return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone // return as-is if unrecognized format
}

export function toDigitsFormat(phone: string): string {
  return phone.replace(/\D/g, "")
}

// ─── SEO filename generator ───────────────────────────────────────────────────

function sanitizeForFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
}

export function generateSeoFilename(params: {
  providerName: string
  city: string
  state: string
  index: number
}): string {
  const name  = sanitizeForFilename(params.providerName)
  const city  = sanitizeForFilename(params.city)
  const state = params.state.toLowerCase()
  return `${city}-${state}-provider-${name}-${params.index + 1}.jpg`
}

// ─── SEO alt text generator ───────────────────────────────────────────────────

export function generateAltText(params: {
  providerName: string
  city: string
  state: string
  ethnicity?: string
}): string {
  const parts = [params.providerName, "provider"]
  if (params.ethnicity) parts.push(params.ethnicity)
  parts.push(`in ${params.city}, ${params.state}`)
  return parts.join(" ")
}

// ─── SEO caption generator ────────────────────────────────────────────────────

export function generateCaption(params: {
  providerName: string
  city: string
  state: string
  phone: string
}): string {
  return `${params.providerName} – Provider in ${params.city}, ${params.state}. Contact: ${toDisplayFormat(params.phone)}`
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function getAllSeoRecords(): SeoImageRecord[] {
  return loadTable().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getSeoRecordsByProvider(providerId: string): SeoImageRecord[] {
  return loadTable().filter((r) => r.provider_id === providerId)
}

export function getSeoRecordById(id: string): SeoImageRecord | null {
  return loadTable().find((r) => r.id === id) ?? null
}

export function addSeoRecord(
  params: Omit<SeoImageRecord, "id" | "created_at" | "updated_at">
): SeoImageRecord {
  const table = loadTable()
  const now = new Date().toISOString()
  const record: SeoImageRecord = {
    ...params,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  }
  table.push(record)
  saveTable(table)
  return record
}

export function updateSeoRecord(
  id: string,
  patch: Partial<Omit<SeoImageRecord, "id" | "created_at">>
): SeoImageRecord | null {
  const table = loadTable()
  const idx = table.findIndex((r) => r.id === id)
  if (idx === -1) return null
  table[idx] = { ...table[idx], ...patch, updated_at: new Date().toISOString() }
  saveTable(table)
  return table[idx]
}

export function deleteSeoRecord(id: string): void {
  saveTable(loadTable().filter((r) => r.id !== id))
}

export function deleteSeoRecordsByProvider(providerId: string): void {
  saveTable(loadTable().filter((r) => r.provider_id !== providerId))
}

// ─── Bulk indexing helper ─────────────────────────────────────────────────────
// Called when a provider's ad is published — generates SEO records for all images.
// Does NOT touch the actual image files or the user-facing image system.

export interface BulkIndexParams {
  providerId: string
  listingId: string
  providerName: string
  city: string
  state: string
  phone: string
  ethnicity?: string
  baseUrl: string   // e.g. "https://providerpost.com"
  // Array of original image IDs/filenames from the existing image system
  originalImageIds: string[]
}

export function bulkIndexProviderImages(params: BulkIndexParams): SeoImageRecord[] {
  // Remove any existing SEO records for this provider first (re-indexing)
  deleteSeoRecordsByProvider(params.providerId)

  const created: SeoImageRecord[] = []

  for (let i = 0; i < params.originalImageIds.length; i++) {
    const seoFilename = generateSeoFilename({
      providerName: params.providerName,
      city: params.city,
      state: params.state,
      index: i,
    })

    const record = addSeoRecord({
      provider_id: params.providerId,
      listing_id: params.listingId,
      original_image_id: params.originalImageIds[i],
      phone_display_format: toDisplayFormat(params.phone),
      phone_digits_format: toDigitsFormat(params.phone),
      seo_filename: seoFilename,
      seo_alt_text: generateAltText({
        providerName: params.providerName,
        city: params.city,
        state: params.state,
        ethnicity: params.ethnicity,
      }),
      seo_caption: generateCaption({
        providerName: params.providerName,
        city: params.city,
        state: params.state,
        phone: params.phone,
      }),
      seo_indexable_url: `${params.baseUrl}/images/seo/${params.state.toLowerCase()}/${params.city.toLowerCase().replace(/\s+/g, "-")}/${seoFilename}`,
    })

    created.push(record)
  }

  return created
}

// ─── Sitemap data generator ───────────────────────────────────────────────────
// Returns structured data ready for /sitemap-images.xml

export interface SitemapImageEntry {
  pageUrl: string
  imageUrl: string
  title: string
  caption: string
}

export function getSitemapImageEntries(baseUrl: string): SitemapImageEntry[] {
  return loadTable().map((r) => ({
    pageUrl: `${baseUrl}/providers/${r.provider_id}`,
    imageUrl: r.seo_indexable_url,
    title: r.seo_alt_text,
    caption: r.seo_caption,
  }))
}

// ─── Schema.org structured data generator ────────────────────────────────────
// Returns JSON-LD ImageObject array for a provider's profile page

export function getStructuredImageData(providerId: string, baseUrl: string) {
  return getSeoRecordsByProvider(providerId).map((r) => ({
    "@type": "ImageObject",
    "url": r.seo_indexable_url,
    "name": r.seo_filename,
    "description": r.seo_alt_text,
    "caption": r.seo_caption,
    "contentUrl": r.seo_indexable_url,
    "thumbnailUrl": r.seo_indexable_url,
  }))
}
