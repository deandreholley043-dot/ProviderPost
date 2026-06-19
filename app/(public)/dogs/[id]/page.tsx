"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Star, MessageSquare, Flag } from "lucide-react"
import { isFavorited, toggleFavorite } from "@/lib/favorites-store"
import { getSiteSettings } from "@/lib/site-settings"
import { cn } from "@/lib/utils"

// Simulate hobbyist logged-in user (replace with real auth)
const MOCK_USER = { isLoggedIn: false, accountType: null as "hobbyist" | "provider" | null }

export default function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [favorited, setFavorited]     = useState(false)
  const [reviewsEnabled, setReviewsEnabled] = useState(true)
  const [reviewText, setReviewText]   = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviews, setReviews]         = useState<{ author: string; rating: number; text: string; date: string }[]>([])

  const { isLoggedIn, accountType } = MOCK_USER

  useEffect(() => {
    setFavorited(isFavorited(id))
    const settings = getSiteSettings()
    setReviewsEnabled(settings.enableReviews)
  }, [id])

  function handleToggleFavorite() {
    // Provide minimal provider info for the saved card
    const wasAdded = toggleFavorite({
      id,
      name: "Provider",
      age: "—",
      ethnicity: "—",
      city: "—",
      state: "—",
      shortDescription: "Saved provider",
      quickVisit: "—",
      verified: false,
      availableNow: false,
    })
    setFavorited(wasAdded)
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewText.trim()) return
    setReviews((prev) => [
      { author: "You", rating: reviewRating, text: reviewText, date: "Just now" },
      ...prev,
    ])
    setReviewText("")
    setReviewRating(5)
  }

  // Provider not found / no backend yet — show placeholder with full UI shell
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">

      {/* Back */}
      <Link
        href="/browse"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium bg-foreground text-background px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ads
      </Link>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">

        {/* Left column */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Name row + favorite button */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold uppercase text-rose-600">Provider Profile</h1>
              <p className="mt-1 text-sm text-muted-foreground">ID: {id}</p>
            </div>

            {/* Favorite button — hobbyists only */}
            {isLoggedIn && accountType === "hobbyist" && (
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  "flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all",
                  favorited
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-border bg-card text-muted-foreground hover:border-rose-300 hover:text-rose-500"
                )}
              >
                <Heart
                  className={cn("h-4 w-4", favorited && "fill-rose-500 text-rose-500")}
                />
                {favorited ? "Saved" : "Save Provider"}
              </button>
            )}

            {!isLoggedIn && (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:border-rose-300 hover:text-rose-500 transition-colors"
              >
                <Heart className="h-4 w-4" />
                Login to save
              </Link>
            )}
          </div>

          {/* Placeholder content box */}
          <div className="rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No provider data yet — submit an ad to populate this profile.
            </p>
          </div>

          {/* Report link */}
          <button className="flex w-fit items-center gap-1 text-sm text-destructive hover:underline">
            <Flag className="h-3.5 w-3.5" /> Report this ad
          </button>

          {/* Reviews section — controlled by admin setting */}
          {reviewsEnabled && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-pink-400 px-4 py-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-foreground" />
                <h2 className="font-bold text-foreground">
                  Reviews ({reviews.length})
                </h2>
              </div>
              <div className="bg-pink-50 px-4 py-5 flex flex-col gap-4">

                {/* Existing reviews */}
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <div key={i} className="rounded-md border border-border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground">{r.author}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star
                              key={si}
                              className={cn(
                                "h-3.5 w-3.5",
                                si < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                )}

                {/* Review form */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Leave a Review</h3>
                  {!isLoggedIn ? (
                    <p className="text-sm text-muted-foreground">
                      <Link href="/login" className="text-primary font-medium hover:underline">Login</Link> to leave a review.
                    </p>
                  ) : accountType === "provider" ? (
                    <p className="text-sm text-muted-foreground">Providers cannot post reviews.</p>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
                      {/* Star picker */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewRating(i + 1)}
                          >
                            <Star
                              className={cn(
                                "h-6 w-6 transition-colors",
                                i < reviewRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground hover:text-yellow-400"
                              )}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">{reviewRating}/5</span>
                      </div>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience…"
                        rows={3}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="w-fit bg-foreground text-background hover:bg-foreground/90"
                      >
                        Submit Review
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column — photo placeholder */}
        <div className="w-full lg:w-[380px]">
          <div className="rounded-lg border border-dashed border-border aspect-square flex items-center justify-center bg-muted/30">
            <p className="text-xs text-muted-foreground">Photos will appear here</p>
          </div>
        </div>

      </div>
    </div>
  )
}
