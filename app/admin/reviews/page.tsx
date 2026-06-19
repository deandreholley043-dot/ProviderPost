"use client"

import { useState, useEffect, useCallback } from "react"
import {
  MessageSquare, Bell, BellOff, Trash2, Eye, Plus, X,
  Star, RefreshCw, Bookmark, BookmarkX, CheckCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getAllReviews, getTrackedReviews, getUnreadCount, getTrackedProfiles,
  addTrackedProfile, removeTrackedProfile, deleteReview, markAllRead, markReviewRead,
  type Review, type TrackedProfile,
} from "@/lib/review-store"

type Tab = "all" | "unread" | "tracked"

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
      ))}
    </div>
  )
}

function ReviewCard({ review, onDelete, onRead }: { review: Review; onDelete: (id: string) => void; onRead: (id: string) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className={cn("rounded-lg border bg-card p-4 transition-colors", !review.read && "border-pink-300 bg-pink-50/40")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xs font-bold uppercase shrink-0">
            {review.authorUsername[0]}
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">@{review.authorUsername}</span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="text-sm font-medium text-rose-600">{review.providerName}</span>
            {!review.read && <Badge className="ml-2 bg-pink-100 text-pink-700 text-[10px]">New</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StarRow rating={review.rating} />
          {!review.read && (
            <button onClick={() => onRead(review.id)} title="Mark as read" className="rounded p-1 text-muted-foreground hover:text-foreground">
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => { if (confirmDelete) { onDelete(review.id) } else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) } }}
            className={cn("rounded p-1 transition-colors", confirmDelete ? "text-red-500 hover:text-red-700" : "text-muted-foreground hover:text-red-500")}
            title={confirmDelete ? "Click again to confirm" : "Delete review"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed pl-9">{review.text}</p>
      <p className="mt-1 text-xs text-muted-foreground pl-9">{new Date(review.postedAt).toLocaleString()}</p>
    </div>
  )
}

export default function ReviewsAdminPage() {
  const [tab, setTab]                 = useState<Tab>("all")
  const [allReviews, setAllReviews]   = useState<Review[]>([])
  const [tracked, setTracked]         = useState<TrackedProfile[]>([])
  const [unread, setUnread]           = useState(0)

  // Add tracked profile form
  const [addId, setAddId]             = useState("")
  const [addName, setAddName]         = useState("")
  const [addError, setAddError]       = useState("")

  const refresh = useCallback(() => {
    setAllReviews(getAllReviews())
    setTracked(getTrackedProfiles())
    setUnread(getUnreadCount())
  }, [])

  useEffect(() => {
    refresh()
    // Poll every 15s for new reviews
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [refresh])

  function handleDelete(id: string) {
    deleteReview(id)
    refresh()
  }

  function handleRead(id: string) {
    markReviewRead(id)
    refresh()
  }

  function handleMarkAllRead() {
    markAllRead()
    refresh()
  }

  function handleRemoveTracked(id: string) {
    removeTrackedProfile(id)
    refresh()
  }

  function handleAddTracked(e: React.FormEvent) {
    e.preventDefault()
    setAddError("")
    if (!addId.trim()) { setAddError("Provider ID is required."); return }
    if (!addName.trim()) { setAddError("Provider name is required."); return }
    addTrackedProfile(addId.trim(), addName.trim())
    setAddId("")
    setAddName("")
    refresh()
  }

  const trackedReviews = getTrackedReviews()
  const unreadReviews  = allReviews.filter((r) => !r.read)

  const displayed =
    tab === "all"     ? allReviews :
    tab === "unread"  ? unreadReviews :
    trackedReviews

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-primary" />
            Reviews &amp; Comments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor hobbyist reviews, track specific provider profiles, and manage submitted comments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
          {unread > 0 && (
            <Button size="sm" onClick={handleMarkAllRead} className="bg-foreground text-background hover:bg-foreground/90">
              <CheckCheck className="h-4 w-4 mr-1.5" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Reviews</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">{allReviews.length}</p>
        </div>
        <div className={cn("rounded-lg border bg-card p-4", unread > 0 ? "border-pink-300 bg-pink-50/50" : "border-border")}>
          <p className="text-xs text-muted-foreground">Unread</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-2xl font-bold text-foreground">{unread}</p>
            {unread > 0 && <Bell className="h-5 w-5 text-pink-500 animate-pulse" />}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Tracked Profiles</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">{tracked.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        {([
          { id: "all",     label: `All Reviews (${allReviews.length})` },
          { id: "unread",  label: `Unread (${unread})` },
          { id: "tracked", label: `Tracked Profiles (${trackedReviews.length})` },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {t.label}
            {t.id === "unread" && unread > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tracked Profiles management — shown in tracked tab */}
      {tab === "tracked" && (
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" /> Track a Provider Profile
          </h2>
          <p className="text-xs text-muted-foreground -mt-2">
            Enter a provider ID and name to watch for new reviews on that profile.
            You will see all their reviews here and unread counts will highlight when new ones arrive.
          </p>

          <form onSubmit={handleAddTracked} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-id">Provider ID</Label>
              <Input id="add-id" value={addId} onChange={(e) => setAddId(e.target.value)} placeholder="e.g. 1" className="w-36" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-name">Provider Name</Label>
              <Input id="add-name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Lisa, 28" className="w-44" />
            </div>
            <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-4 w-4 mr-1.5" /> Track Profile
            </Button>
            {addError && <p className="text-sm text-red-500 w-full">{addError}</p>}
          </form>

          {tracked.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {tracked.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-3 py-1">
                  <Bookmark className="h-3 w-3 text-pink-500" />
                  <span className="text-xs font-medium text-pink-800">{p.name}</span>
                  <span className="text-xs text-pink-400">#{p.id}</span>
                  <button onClick={() => handleRemoveTracked(p.id)} className="ml-1 text-pink-400 hover:text-pink-700">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review list */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          {tab === "unread"
            ? <><BellOff className="mb-3 h-10 w-10 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">No unread reviews.</p></>
            : tab === "tracked"
            ? <><BookmarkX className="mb-3 h-10 w-10 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">No reviews on tracked profiles yet.</p></>
            : <><MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">No reviews submitted yet.</p></>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((r) => (
            <ReviewCard key={r.id} review={r} onDelete={handleDelete} onRead={handleRead} />
          ))}
        </div>
      )}

    </div>
  )
}
