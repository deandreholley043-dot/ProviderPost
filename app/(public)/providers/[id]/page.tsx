"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { getStructuredImageData } from "@/lib/seo-image-store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Star, MessageSquare, Flag, Camera, User, ChevronLeft, ChevronRight } from "lucide-react"
import { isFavorited, toggleFavorite } from "@/lib/favorites-store"
import { getSiteSettings } from "@/lib/site-settings"
import { getReviewsForProvider, addReview } from "@/lib/review-store"
import { cn } from "@/lib/utils"

// ─── Auth placeholder ─────────────────────────────────────────────────────────
// Replace this with your real auth system (NextAuth, Clerk, Supabase, etc.)
// When connected, read isLoggedIn, accountType, and username from the session.
function useSession() {
  return {
    isLoggedIn: false,          // default: not logged in
    accountType: null as "hobbyist" | "provider" | null,
    username: "",
  }
}

const PLACEHOLDER_PHOTOS = 6

export default function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [favorited, setFavorited]           = useState(false)
  const [reviewsEnabled, setReviewsEnabled] = useState(true)
  const [reviews, setReviews]               = useState<ReturnType<typeof getReviewsForProvider>>([])
  const [reviewText, setReviewText]         = useState("")
  const [reviewRating, setReviewRating]     = useState(5)
  const [submitError, setSubmitError]       = useState("")
  const [activePhoto, setActivePhoto]       = useState(0)

  const { isLoggedIn, accountType, username } = useSession()

  useEffect(() => {
    setFavorited(isFavorited(id))
    const settings = getSiteSettings()
    setReviewsEnabled(settings.enableReviews)
    setReviews(getReviewsForProvider(id))

    // Inject Schema.org ImageObject structured data for SEO indexing
    // Uses the SEO-only table — does not affect the user-facing image display
    const baseUrl = window.location.origin
    const imageStructuredData = getStructuredImageData(id, baseUrl)
    if (imageStructuredData.length > 0) {
      const script = document.createElement("script")
      script.type = "application/ld+json"
      script.id   = `seo-images-${id}`
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        "image": imageStructuredData,
      })
      document.head.appendChild(script)
      return () => { document.getElementById(`seo-images-${id}`)?.remove() }
    }
  }, [id])

  function handleToggleFavorite() {
    const wasAdded = toggleFavorite({
      id, name: "Provider", age: "—", ethnicity: "—",
      city: "—", state: "—", shortDescription: "Saved provider",
      quickVisit: "—", verified: false, availableNow: false,
    })
    setFavorited(wasAdded)
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError("")
    if (!reviewText.trim()) { setSubmitError("Please write a review before submitting."); return }
    if (reviewText.trim().length < 10) { setSubmitError("Review must be at least 10 characters."); return }

    addReview({
      providerId: id,
      providerName: "Provider",
      authorUsername: username,
      rating: reviewRating,
      text: reviewText.trim(),
    })

    setReviews(getReviewsForProvider(id))
    setReviewText("")
    setReviewRating(5)
  }

  const canReview = isLoggedIn && accountType === "hobbyist"
  const alreadyReviewed = reviews.some((r) => r.authorUsername === username)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8">

      {/* Back */}
      <Link href="/browse" className="mb-4 inline-flex items-center gap-1 text-sm font-medium bg-foreground text-background px-3 py-1.5 rounded hover:opacity-90 transition-opacity">
        <ArrowLeft className="h-4 w-4" /> Back to Ads
      </Link>

      {/* Name + save */}
      <div className="mt-4 flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold uppercase text-rose-600">Provider Profile</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Latina · Austin, TX · Incall</p>
        </div>
        {isLoggedIn && accountType === "hobbyist" ? (
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all shrink-0",
              favorited ? "border-rose-400 bg-rose-50 text-rose-600" : "border-border bg-card text-muted-foreground hover:border-rose-300 hover:text-rose-500"
            )}
          >
            <Heart className={cn("h-4 w-4", favorited && "fill-rose-500 text-rose-500")} />
            {favorited ? "Saved" : "Save Provider"}
          </button>
        ) : !isLoggedIn ? (
          <Link href="/login" className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-rose-300 hover:text-rose-500 transition-colors shrink-0">
            <Heart className="h-4 w-4" /> Login to save
          </Link>
        ) : null}
      </div>

      {/* ── LARGE PHOTO AREA ── */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-pink-100 flex items-center justify-center mb-2">
        <User className="h-24 w-24 text-rose-300" />
        <Badge className="absolute top-3 left-3 bg-green-600 text-white">Available Now</Badge>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
          <Camera className="h-3 w-3" /> {activePhoto + 1} / {PLACEHOLDER_PHOTOS}
        </div>
        {activePhoto > 0 && (
          <button onClick={() => setActivePhoto(p => p - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {activePhoto < PLACEHOLDER_PHOTOS - 1 && (
          <button onClick={() => setActivePhoto(p => p + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="grid grid-cols-6 gap-1.5 mb-6">
        {Array.from({ length: PLACEHOLDER_PHOTOS }).map((_, i) => (
          <button
            key={i}
            onClick={() => setActivePhoto(i)}
            className={cn(
              "aspect-square rounded-md bg-pink-100 border-2 transition-all",
              activePhoto === i ? "border-rose-500" : "border-transparent hover:border-rose-300"
            )}
          />
        ))}
      </div>

      {/* Contact boxes */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-5">
        <a href="https://wa.me/15125550000" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border-2 border-border bg-card p-3 transition-all hover:border-[#25D366] hover:shadow-sm group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-black" style={{ backgroundColor: "#25D366" }}>W</div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">WhatsApp</p>
            <p className="text-sm font-bold text-foreground group-hover:text-[#25D366]">+1 (512) 555-0000</p>
            <p className="text-[10px] text-muted-foreground">Tap to open chat</p>
          </div>
        </a>
        <div className="flex items-center gap-3 rounded-xl border-2 border-border bg-card p-3 transition-all hover:border-[#07C160] hover:shadow-sm cursor-default">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-black" style={{ backgroundColor: "#07C160" }}>W</div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">WeChat ID</p>
            <p className="text-sm font-bold font-mono text-foreground">provider_id</p>
            <button onClick={() => navigator.clipboard.writeText("provider_id")} className="text-[10px] text-[#07C160] hover:underline">Copy ID</button>
          </div>
        </div>
      </div>

      {/* ── COMPACT INFO GRID ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-5">
        {/* Profile */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-pink-400 px-3 py-1.5">
            <h2 className="text-xs font-bold text-pink-900">Profile</h2>
          </div>
          <div className="bg-pink-50 px-3 py-2 divide-y divide-pink-100">
            {[["Age","28"],["Gender","Female"],["Height","5'5\""],["Weight","125 lbs"],["Ethnicity","Latina"],["Sees","Gentlemen"]].map(([k,v]) => (
              <div key={k} className="flex justify-between items-baseline py-1">
                <span className="text-[10px] text-muted-foreground">{k}</span>
                <span className="text-[10px] font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rates */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-pink-400 px-3 py-1.5">
            <h2 className="text-xs font-bold text-pink-900">Rates</h2>
          </div>
          <div className="bg-pink-50 px-3 py-2 divide-y divide-pink-100">
            {[["Quick Visit","$100"],["Half Hour","$150"],["Hour","$250"],["Overnight","$900"],["Incall","Yes"],["Ethnicity","Latina"]].map(([k,v]) => (
              <div key={k} className="flex justify-between items-baseline py-1">
                <span className="text-[10px] text-muted-foreground">{k}</span>
                <span className={cn("text-[10px] font-medium", v.startsWith("$") ? "text-rose-600" : "text-foreground")}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report */}
      <button className="flex items-center gap-1 text-sm text-destructive hover:underline mb-6">
        <Flag className="h-3.5 w-3.5" /> Report this ad
      </button>

      {/* ── REVIEWS — HOBBYIST ONLY ── */}
      {reviewsEnabled && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-pink-400 px-4 py-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-pink-900" />
            <h2 className="font-bold text-pink-900">Reviews ({reviews.length})</h2>
            <span className="ml-auto flex items-center gap-1 rounded-full bg-pink-200 px-2 py-0.5 text-[10px] font-medium text-pink-800">
              Hobbyists only
            </span>
          </div>
          <div className="bg-pink-50 px-4 py-4 flex flex-col gap-4">

            {/* Review list */}
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to leave one.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="rounded-md border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold uppercase">
                        {r.authorUsername[0]}
                      </div>
                      <p className="text-sm font-semibold text-foreground">@{r.authorUsername}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={cn("h-3.5 w-3.5", si < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(r.postedAt).toLocaleDateString()}</p>
                </div>
              ))
            )}

            {/* Review form */}
            <div className="border-t border-border pt-4">
              {!isLoggedIn ? (
                <p className="text-sm text-muted-foreground">
                  <Link href="/login" className="text-primary font-medium hover:underline">Login</Link> as a hobbyist to leave a review.
                </p>
              ) : accountType === "provider" ? (
                <p className="text-sm text-muted-foreground">Providers cannot post reviews.</p>
              ) : alreadyReviewed ? (
                <p className="text-sm text-muted-foreground">You have already reviewed this provider.</p>
              ) : (
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xs font-bold uppercase">
                      {username[0]}
                    </div>
                    <p className="text-sm font-semibold text-foreground">@{username}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} type="button" onClick={() => setReviewRating(i + 1)}>
                        <Star className={cn("h-6 w-6 transition-colors", i < reviewRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground hover:text-yellow-400")} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">{reviewRating}/5</span>
                  </div>

                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience… (minimum 10 characters)"
                    rows={3}
                  />

                  {submitError && <p className="text-sm text-red-500">{submitError}</p>}

                  <Button type="submit" size="sm" className="w-fit bg-foreground text-background hover:bg-foreground/90">
                    Submit Review
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
