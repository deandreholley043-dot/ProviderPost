"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Trash2, CheckCircle, ExternalLink } from "lucide-react"
import { getFavorites, removeFavorite, type SavedProvider } from "@/lib/favorites-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<SavedProvider[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setFavorites(getFavorites())
    setLoaded(true)
  }, [])

  function handleRemove(id: string) {
    removeFavorite(id)
    setFavorites((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Providers you've saved for easy access.
          </p>
        </div>
      </div>

      {!loaded ? null : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <Heart className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm font-medium text-foreground">No saved providers yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse providers and tap the heart icon to save them here.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/browse">Browse Providers</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground mb-1">
            {favorites.length} saved provider{favorites.length !== 1 ? "s" : ""}
          </p>
          {favorites.map((p) => (
            <div
              key={p.id}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              {/* Avatar placeholder */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500 font-bold text-lg">
                {p.name[0] ?? "?"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-rose-600 uppercase">
                    {p.name}{p.age && p.age !== "—" ? `, ${p.age}` : ""}
                  </h3>
                  {p.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" /> Verified
                    </span>
                  )}
                  {p.availableNow && (
                    <Badge className="bg-green-600 text-white text-[10px]">Available Now</Badge>
                  )}
                </div>

                {p.city && p.city !== "—" && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.ethnicity !== "—" ? `${p.ethnicity} · ` : ""}{p.city}, {p.state}
                  </p>
                )}

                {p.shortDescription && p.shortDescription !== "Saved provider" && (
                  <p className="mt-1.5 text-sm text-card-foreground line-clamp-2 leading-relaxed">
                    {p.shortDescription}
                  </p>
                )}

                {p.quickVisit && p.quickVisit !== "—" && (
                  <p className="mt-1.5 text-sm font-bold text-foreground">From {p.quickVisit}</p>
                )}

                <p className="mt-1 text-xs text-muted-foreground">
                  Saved {new Date(p.savedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
                  <Link href={`/providers/${p.id}`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </Link>
                </Button>
                <button
                  onClick={() => handleRemove(p.id)}
                  className="flex items-center gap-1.5 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
