"use client"

import Link from "next/link"
import { useState } from "react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, MessageCircle, Heart, Edit2, Trash2, Clock, CheckCircle, AlertCircle, X, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data — replace with real API calls
const MOCK_ADS = [
  {
    id: "1",
    name: "Destiny",
    age: 28,
    city: "Los Angeles",
    state: "CA",
    status: "approved",
    postedDate: "2024-05-15",
    expiresDate: "2024-08-15",
    photos: 6,
    views: 342,
    contacts: 18,
    favorites: 12,
    daysLeft: 76,
  },
  {
    id: "2",
    name: "Vivian",
    age: 25,
    city: "Los Angeles",
    state: "CA",
    status: "expired",
    postedDate: "2024-04-01",
    expiresDate: "2024-07-01",
    photos: 4,
    views: 892,
    contacts: 54,
    favorites: 31,
    daysLeft: 0,
  },
  {
    id: "3",
    name: "Sophia",
    age: 23,
    city: "Los Angeles",
    state: "CA",
    status: "pending",
    postedDate: "2024-05-28",
    expiresDate: null,
    photos: 5,
    views: 0,
    contacts: 0,
    favorites: 0,
    daysLeft: null,
  },
]

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    approved: { bg: "bg-green-50", text: "text-green-700", icon: <CheckCircle className="h-3.5 w-3.5" /> },
    pending: { bg: "bg-amber-50", text: "text-amber-700", icon: <Clock className="h-3.5 w-3.5" /> },
    expired: { bg: "bg-red-50", text: "text-red-700", icon: <X className="h-3.5 w-3.5" /> },
    hidden: { bg: "bg-gray-50", text: "text-gray-700", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  }
  const v = variants[status] || variants.pending
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium", v.bg, v.text)}>
      {v.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  )
}

export default function MyAdsPage() {
  const [selectedAd, setSelectedAd] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <PageShell title="My Ads" description="Manage your active and expired advertisements.">
        {/* Header with action button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="text-sm text-muted-foreground">
            {MOCK_ADS.length} total ads ({MOCK_ADS.filter(a => a.status === 'approved').length} active)
          </div>
          <Button asChild className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto justify-center sm:justify-start">
            <Link href="/post">
              <Plus className="h-4 w-4" /> Post New Ad
            </Link>
          </Button>
        </div>

        {/* Ads Grid */}
        <div className="flex flex-col gap-3">
          {MOCK_ADS.map((ad) => (
            <div
              key={ad.id}
              className={cn(
                "rounded-lg border transition-all p-4 cursor-pointer",
                selectedAd === ad.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-pink-300 hover:shadow-sm"
              )}
              onClick={() => setSelectedAd(selectedAd === ad.id ? null : ad.id)}
            >
              {/* Ad summary row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="text-base font-bold text-rose-600 uppercase">
                      {ad.name}, {ad.age}
                    </h3>
                    <StatusBadge status={ad.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {ad.city}, {ad.state} · {ad.photos} photos
                  </p>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{ad.views} views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{ad.contacts} contacts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-rose-400" />
                      <span className="text-muted-foreground">{ad.favorites} favorites</span>
                    </div>
                  </div>
                </div>

                {/* Expiry badge */}
                {ad.status === "approved" && ad.daysLeft !== null && (
                  <div className="text-right">
                    <div className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-md",
                      ad.daysLeft > 30 ? "bg-green-50 text-green-700" : ad.daysLeft > 7 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                    )}>
                      {ad.daysLeft} days left
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {selectedAd === ad.id && (
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Posted</p>
                      <p className="font-medium text-foreground text-sm">{new Date(ad.postedDate).toLocaleDateString()}</p>
                    </div>
                    {ad.expiresDate && (
                      <div>
                        <p className="text-muted-foreground">Expires</p>
                        <p className="font-medium text-foreground text-sm">{new Date(ad.expiresDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Avg. Daily Views</p>
                      <p className="font-medium text-foreground text-sm">{Math.round(ad.views / (ad.daysLeft || 30))}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contact Rate</p>
                      <p className="font-medium text-foreground text-sm">{ad.views > 0 ? Math.round((ad.contacts / ad.views) * 100) : 0}%</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {ad.status === "approved" && (
                      <>
                        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
                          <Link href={`/providers/${ad.id}`}>
                            <Eye className="h-3.5 w-3.5" /> View Public Profile
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
                          <Link href={`/post?edit=${ad.id}`}>
                            <Edit2 className="h-3.5 w-3.5" /> Edit Ad
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
                          <Link href={`/user/statistics?ad=${ad.id}`}>
                            <BarChart3 className="h-3.5 w-3.5" /> View Stats
                          </Link>
                        </Button>
                        <Button size="sm" className="text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90 ml-auto">
                          Renew for $39.99
                        </Button>
                      </>
                    )}
                    {ad.status === "pending" && (
                      <p className="text-xs text-amber-700">Your ad is under review. This typically takes 1-4 hours.</p>
                    )}
                    {ad.status === "expired" && (
                      <Button size="sm" className="text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90">
                        <Plus className="h-3.5 w-3.5" /> Renew Ad
                      </Button>
                    )}
                    <button
                      onClick={() => setShowDeleteModal(ad.id)}
                      className="ml-auto text-destructive hover:text-destructive/90 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {MOCK_ADS.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-foreground">No ads yet</p>
            <p className="text-xs text-muted-foreground mt-1">Post your first ad to get started.</p>
            <Button asChild className="mt-4 gap-2">
              <Link href="/post">
                <Plus className="h-4 w-4" /> Post Your First Ad
              </Link>
            </Button>
          </div>
        )}
      </PageShell>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete ad?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone. Your ad will be permanently deleted.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium bg-destructive text-white rounded-lg hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
