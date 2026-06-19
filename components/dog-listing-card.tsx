"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Camera, Video, CheckCircle, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ProviderListing } from "@/lib/sample-providers"
import { isFavorited, toggleFavorite } from "@/lib/favorites-store"

export function DogListingCard({ dog }: { dog: ProviderListing }) {
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    setFavorited(isFavorited(dog.id))
  }, [dog.id])

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const wasAdded = toggleFavorite({
      id: dog.id,
      name: dog.name,
      age: dog.age,
      ethnicity: dog.ethnicity,
      city: dog.city,
      state: dog.state,
      shortDescription: dog.shortDescription,
      quickVisit: dog.quickVisit,
      verified: dog.verified,
      availableNow: dog.availableNow,
    })
    setFavorited(wasAdded)
  }

  return (
    <Link
      href={`/dogs/${dog.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      {/* Image + heart */}
      <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-xs">No photo</span>

        {dog.availableNow && (
          <Badge className="absolute right-2 top-2 bg-green-600 text-card hover:bg-green-700">
            Available Now
          </Badge>
        )}

        {dog.videoCount > 0 && (
          <div className="absolute left-2 bottom-2 flex items-center gap-1 rounded bg-foreground/70 px-1.5 py-0.5">
            <Video className="h-3 w-3 text-background" />
            <span className="text-[10px] font-medium text-background">{dog.videoCount}</span>
          </div>
        )}

        {/* Favorite heart — bottom right */}
        <button
          onClick={handleFavorite}
          className={cn(
            "absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full shadow transition-all",
            favorited
              ? "bg-rose-500 text-white"
              : "bg-white/90 text-muted-foreground hover:text-rose-500"
          )}
          title={favorited ? "Remove from favorites" : "Save to favorites"}
        >
          <Heart className={cn("h-4 w-4", favorited && "fill-white")} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 bg-pink-50 p-4">
        <h3 className="text-lg font-bold uppercase text-rose-600 leading-tight text-pretty">
          {dog.name}, {dog.age}
        </h3>
        <p className="text-xs font-medium text-muted-foreground">
          {dog.ethnicity} &middot; {dog.city}, {dog.state}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {dog.photoCount > 0 && (
            <span className="flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" /> {dog.photoCount}
            </span>
          )}
          {dog.videoCount > 0 && (
            <span className="flex items-center gap-1">
              <Video className="h-3.5 w-3.5" /> {dog.videoCount}
            </span>
          )}
          {dog.verified && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-card-foreground leading-relaxed">
          {dog.shortDescription}
        </p>
        <p className="mt-auto pt-2 text-sm font-bold text-foreground">
          From {dog.quickVisit}
        </p>
      </div>
    </Link>
  )
}
