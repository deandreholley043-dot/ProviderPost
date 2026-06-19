"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search, Image, Plus, Trash2, Edit3, RefreshCw, Copy,
  CheckCircle, Globe, Phone, FileText, ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  getAllSeoRecords, addSeoRecord, updateSeoRecord, deleteSeoRecord,
  bulkIndexProviderImages, generateSeoFilename, generateAltText,
  generateCaption, toDisplayFormat, toDigitsFormat,
  type SeoImageRecord,
} from "@/lib/seo-image-store"

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "https://providerpost.com"

// ─── Add / Edit form ──────────────────────────────────────────────────────────

function RecordForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<SeoImageRecord>
  onSave: (r: Omit<SeoImageRecord, "id" | "created_at" | "updated_at">) => void
  onCancel: () => void
}) {
  const [providerId, setProviderId]   = useState(initial?.provider_id ?? "")
  const [listingId, setListingId]     = useState(initial?.listing_id ?? "")
  const [origImgId, setOrigImgId]     = useState(initial?.original_image_id ?? "")
  const [phone, setPhone]             = useState(initial?.phone_display_format ?? "")
  const [filename, setFilename]       = useState(initial?.seo_filename ?? "")
  const [altText, setAltText]         = useState(initial?.seo_alt_text ?? "")
  const [caption, setCaption]         = useState(initial?.seo_caption ?? "")
  const [indexUrl, setIndexUrl]       = useState(initial?.seo_indexable_url ?? "")
  const [error, setError]             = useState("")

  // Auto-fill helpers
  const [autoName, setAutoName]   = useState("")
  const [autoCity, setAutoCity]   = useState("")
  const [autoState, setAutoState] = useState("")
  const [autoIdx, setAutoIdx]     = useState("0")

  function autoFill() {
    if (!autoName || !autoCity || !autoState) { setError("Enter provider name, city and state to auto-fill."); return }
    const idx = parseInt(autoIdx) || 0
    const fn  = generateSeoFilename({ providerName: autoName, city: autoCity, state: autoState, index: idx })
    const alt = generateAltText({ providerName: autoName, city: autoCity, state: autoState })
    const cap = generateCaption({ providerName: autoName, city: autoCity, state: autoState, phone })
    const url = `${BASE_URL}/images/seo/${autoState.toLowerCase()}/${autoCity.toLowerCase().replace(/\s+/g, "-")}/${fn}`
    setFilename(fn); setAltText(alt); setCaption(cap); setIndexUrl(url)
    setError("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("")
    if (!providerId.trim()) { setError("Provider ID is required."); return }
    if (!origImgId.trim()) { setError("Original image ID is required."); return }
    if (!phone.trim())     { setError("Phone number is required."); return }
    if (!filename.trim())  { setError("SEO filename is required."); return }
    if (!altText.trim())   { setError("Alt text is required."); return }
    if (!indexUrl.trim())  { setError("Indexable URL is required."); return }

    onSave({
      provider_id: providerId.trim(),
      listing_id: listingId.trim() || providerId.trim(),
      original_image_id: origImgId.trim(),
      phone_display_format: toDisplayFormat(phone),
      phone_digits_format: toDigitsFormat(phone),
      seo_filename: filename.trim(),
      seo_alt_text: altText.trim(),
      seo_caption: caption.trim(),
      seo_indexable_url: indexUrl.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5">
      <h3 className="text-sm font-bold text-card-foreground">
        {initial?.id ? "Edit SEO Image Record" : "Add SEO Image Record"}
      </h3>

      {/* Auto-fill helpers */}
      <div className="rounded-md bg-muted/50 p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Auto-fill from provider info</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Provider Name</Label>
            <Input value={autoName} onChange={(e) => setAutoName(e.target.value)} placeholder="e.g. Lisa" className="text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">City</Label>
            <Input value={autoCity} onChange={(e) => setAutoCity(e.target.value)} placeholder="e.g. Austin" className="text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">State</Label>
            <Input value={autoState} onChange={(e) => setAutoState(e.target.value)} placeholder="e.g. TX" className="text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Image #</Label>
            <Input value={autoIdx} onChange={(e) => setAutoIdx(e.target.value)} placeholder="0" className="text-sm" type="number" min="0" />
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={autoFill}>
          Auto-fill SEO fields
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-pid">Provider ID *</Label>
          <Input id="f-pid" value={providerId} onChange={(e) => setProviderId(e.target.value)} placeholder="e.g. 1" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-lid">Listing ID</Label>
          <Input id="f-lid" value={listingId} onChange={(e) => setListingId(e.target.value)} placeholder="Same as provider ID if blank" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-oid">Original Image ID *</Label>
          <Input id="f-oid" value={origImgId} onChange={(e) => setOrigImgId(e.target.value)} placeholder="From the image upload system" />
          <p className="text-xs text-muted-foreground">Reference to the existing image — does not affect the image itself</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-phone">Phone Number *</Label>
          <Input id="f-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 8982222222 or 898-222-2222" />
          {phone && (
            <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Display: <strong>{toDisplayFormat(phone)}</strong></span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Digits: <strong>{toDigitsFormat(phone)}</strong></span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-fn">SEO Filename *</Label>
        <Input id="f-fn" value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="e.g. austin-tx-provider-lisa-1.jpg" className="font-mono text-sm" />
        <p className="text-xs text-muted-foreground">Used for image sitemaps and structured data only — does not rename any actual file</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-alt">SEO Alt Text *</Label>
        <Input id="f-alt" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="e.g. Lisa provider in Austin, TX" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-cap">SEO Caption</Label>
        <Textarea id="f-cap" value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} placeholder="Caption for structured data / Schema.org ImageObject" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-url">SEO Indexable URL *</Label>
        <Input id="f-url" value={indexUrl} onChange={(e) => setIndexUrl(e.target.value)} placeholder={`${BASE_URL}/images/seo/tx/austin/austin-tx-provider-lisa-1.jpg`} className="font-mono text-sm" />
        <p className="text-xs text-muted-foreground">URL submitted to search engines in sitemap and structured data</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">
          {initial?.id ? "Save Changes" : "Add Record"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

// ─── Record row ───────────────────────────────────────────────────────────────

function RecordRow({ record, onDelete, onEdit }: {
  record: SeoImageRecord
  onDelete: (id: string) => void
  onEdit: (r: SeoImageRecord) => void
}) {
  const [confirm, setConfirm]   = useState(false)
  const [copied, setCopied]     = useState<string | null>(null)

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  function handleDelete() {
    if (confirm) { onDelete(record.id); setConfirm(false) }
    else { setConfirm(true); setTimeout(() => setConfirm(false), 3000) }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">Provider #{record.provider_id}</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-mono text-xs text-muted-foreground">Image: {record.original_image_id}</span>
            <Badge className="text-[10px] bg-blue-100 text-blue-700">SEO Only</Badge>
          </div>
          <p className="font-mono text-sm font-semibold text-foreground mt-0.5">{record.seo_filename}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onEdit(record)} className="text-xs gap-1">
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </Button>
          <button onClick={handleDelete} className={`rounded p-1.5 transition-colors ${confirm ? "text-red-500 hover:text-red-700" : "text-muted-foreground hover:text-red-500"}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
        {/* Phone formats */}
        <div className="flex flex-col gap-1 rounded-md bg-muted/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone Formats</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-foreground">{record.phone_display_format}</span>
            <button onClick={() => copy(record.phone_display_format, "disp")} className="text-muted-foreground hover:text-foreground">
              {copied === "disp" ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{record.phone_digits_format}</span>
            <button onClick={() => copy(record.phone_digits_format, "digs")} className="text-muted-foreground hover:text-foreground">
              {copied === "digs" ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Alt text */}
        <div className="flex flex-col gap-1 rounded-md bg-muted/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Alt Text</p>
          <p className="text-xs text-foreground leading-relaxed">{record.seo_alt_text}</p>
        </div>

        {/* Caption */}
        <div className="flex flex-col gap-1 rounded-md bg-muted/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Caption</p>
          <p className="text-xs text-foreground leading-relaxed">{record.seo_caption}</p>
        </div>

        {/* Indexable URL */}
        <div className="flex flex-col gap-1 rounded-md bg-muted/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> SEO URL</p>
          <div className="flex items-start gap-1.5">
            <p className="font-mono text-xs text-blue-600 break-all leading-relaxed flex-1">{record.seo_indexable_url}</p>
            <button onClick={() => copy(record.seo_indexable_url, "url")} className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5">
              {copied === "url" ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Added {new Date(record.created_at).toLocaleString()} · Updated {new Date(record.updated_at).toLocaleString()}
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaSeoPage() {
  const [records, setRecords]       = useState<SeoImageRecord[]>([])
  const [search, setSearch]         = useState("")
  const [showForm, setShowForm]     = useState(false)
  const [editRecord, setEditRecord] = useState<SeoImageRecord | null>(null)

  const refresh = useCallback(() => setRecords(getAllSeoRecords()), [])
  useEffect(() => { refresh() }, [refresh])

  const filtered = records.filter(
    (r) =>
      !search ||
      r.provider_id.includes(search) ||
      r.seo_filename.toLowerCase().includes(search.toLowerCase()) ||
      r.phone_display_format.includes(search) ||
      r.phone_digits_format.includes(search) ||
      r.seo_alt_text.toLowerCase().includes(search.toLowerCase())
  )

  function handleAdd(data: Omit<SeoImageRecord, "id" | "created_at" | "updated_at">) {
    addSeoRecord(data)
    refresh()
    setShowForm(false)
  }

  function handleEdit(data: Omit<SeoImageRecord, "id" | "created_at" | "updated_at">) {
    if (!editRecord) return
    updateSeoRecord(editRecord.id, data)
    refresh()
    setEditRecord(null)
  }

  function handleDelete(id: string) {
    deleteSeoRecord(id)
    refresh()
  }

  const sitemapUrl = `${BASE_URL}/api/sitemap-images`

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Image className="h-7 w-7 text-primary" />
          SEO Image Index
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Separate SEO-only metadata layer for image sitemaps and structured data.
          Does not affect the user-facing image upload or display system.
        </p>
      </div>

      {/* Important notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Separate system:</strong> Records here are used only for SEO (sitemaps, structured data, meta tags).
        They reference images by ID but do not modify, replace, or re-process any uploaded images.
        The normal photo uploader and gallery remain completely unchanged.
      </div>

      {/* Stats + sitemap link */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Indexed Images</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">{records.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Unique Providers</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">{new Set(records.map((r) => r.provider_id)).size}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between">
          <p className="text-xs text-muted-foreground">Image Sitemap</p>
          <a href={sitemapUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-1">
            <Globe className="h-4 w-4" /> /api/sitemap-images <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by provider ID, phone, filename…" className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
        </Button>
        {!showForm && !editRecord && (
          <Button onClick={() => setShowForm(true)} className="bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" /> Add SEO Record
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <RecordForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {/* Edit form */}
      {editRecord && (
        <RecordForm initial={editRecord} onSave={handleEdit} onCancel={() => setEditRecord(null)} />
      )}

      {/* Record list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <Image className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search ? "No records match your search." : "No SEO image records yet. Add one above."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
          {filtered.map((r) => (
            <RecordRow key={r.id} record={r} onDelete={handleDelete} onEdit={setEditRecord} />
          ))}
        </div>
      )}

      {/* Schema.org info */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-bold text-card-foreground mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" /> How This System Is Used
        </h2>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><span className="shrink-0 font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">GET /api/sitemap-images</span> — Google Image Sitemap XML. Submit this URL to Google Search Console.</li>
          <li className="flex items-start gap-2"><span className="shrink-0 font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">seo_alt_text</span> — Used in &lt;img alt=""&gt; on SEO pages and Schema.org ImageObject "description".</li>
          <li className="flex items-start gap-2"><span className="shrink-0 font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">seo_caption</span> — Used in Schema.org ImageObject "caption" and Open Graph metadata.</li>
          <li className="flex items-start gap-2"><span className="shrink-0 font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">phone_display_format</span> — Shown in SEO-indexable text (898-222-2222).</li>
          <li className="flex items-start gap-2"><span className="shrink-0 font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">phone_digits_format</span> — Used in tel: links and schema.org telephone (8982222222).</li>
          <li className="flex items-start gap-2"><span className="shrink-0 font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">seo_indexable_url</span> — The canonical URL search engines index for each image.</li>
        </ul>
      </div>

    </div>
  )
}
