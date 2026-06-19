"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Camera, Video, CheckCircle, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ProviderListing } from "@/lib/sample-providers"
import { isFavorited, toggleFavorite } from "@/lib/favorites-store"

export function ProviderCard({ provider }: { provider: ProviderListing }) {
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    setFavorited(isFavorited(provider.id))
  }, [provider.id])

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const wasAdded = toggleFavorite({
      id: provider.id,
      name: provider.name,
      age: provider.age,
      ethnicity: provider.ethnicity,
      city: provider.city,
      state: provider.state,
      shortDescription: provider.shortDescription,
      quickVisit: provider.quickVisit,
      verified: provider.verified,
      availableNow: provider.availableNow,
    })
    setFavorited(wasAdded)
  }

  return (
    <Link
      href={`/providers/${provider.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg active:scale-[0.98]"
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-xs">No photo</span>

        {provider.availableNow && (
          <Badge className="absolute left-2 top-2 bg-green-600 text-white text-[10px] px-2 py-0.5">
            Available
          </Badge>
        )}

        {provider.videoCount > 0 && (
          <div className="absolute left-2 bottom-2 flex items-center gap-1 rounded bg-foreground/70 px-1.5 py-0.5">
            <Video className="h-3 w-3 text-background" />
            <span className="text-[10px] font-medium text-background">{provider.videoCount}</span>
          </div>
        )}

        {/* Favorite heart — larger touch target on mobile */}
        <button
          onClick={handleFavorite}
          className={cn(
            "absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all active:scale-90",
            favorited
              ? "bg-rose-500 text-white"
              : "bg-white/95 text-muted-foreground hover:text-rose-500"
          )}
          title={favorited ? "Remove from favorites" : "Save to favorites"}
        >
          <Heart className={cn("h-4 w-4", favorited && "fill-white")} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 bg-pink-50 p-3 sm:p-4">
        <h3 className="text-sm font-bold uppercase text-rose-600 leading-tight sm:text-base">
          {provider.name}, {provider.age}
        </h3>
        <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
          {provider.ethnicity} &middot; {provider.city}, {provider.state}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
          {provider.photoCount > 0 && (
            <span className="flex items-center gap-0.5">
              <Camera className="h-3 w-3" /> {provider.photoCount}
            </span>
          )}
          {provider.videoCount > 0 && (
            <span className="flex items-center gap-0.5">
              <Video className="h-3 w-3" /> {provider.videoCount}
            </span>
          )}
          {provider.verified && (
            <span className="flex items-center gap-0.5 text-green-600">
              <CheckCircle className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-card-foreground leading-relaxed hidden sm:block">
          {provider.shortDescription}
        </p>
        <p className="mt-auto pt-1.5 text-xs font-bold text-foreground sm:text-sm">
          From {provider.quickVisit}
        </p>
      </div>
    </Link>
  )
}
