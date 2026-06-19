"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, XCircle, Flag, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Provider {
  id: string
  name: string
  email: string
  age: number
  phone: string
  city: string
  state: string
  rates_per_hour: number
  description: string
  created_at: string
}

interface Photo {
  id: string
  cloudflare_url: string
  width: number
  height: number
}

interface Ad {
  id: string
  provider_id: string
  name: string
  description: string
  moderation_status: string
  flagged_for_moderation: boolean
  created_at: string
  photo_count: number
  providers: Provider
  photos: Photo[]
}

export default function ModerationDashboard() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [filter, setFilter] = useState<"pending" | "flagged" | "all">("pending")
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    flagged: 0,
    approved: 0,
    rejected: 0,
  })

  useEffect(() => {
    fetchAds()
  }, [filter])

  async function fetchAds() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/moderation?filter=${filter}`)
      const data = await res.json()
      if (data.success) {
        setAds(data.ads || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error("Error fetching ads:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApproveAd(adId: string) {
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/moderation/${adId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })

      if (res.ok) {
        setAds(ads.filter((a) => a.id !== adId))
        setSelectedAd(null)
        setRejectionReason("")
      } else {
        const data = await res.json()
        alert(data.error || "Failed to approve ad")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to approve ad")
    } finally {
      setProcessing(false)
    }
  }

  async function handleRejectAd(adId: string) {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }

    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/moderation/${adId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: rejectionReason }),
      })

      if (res.ok) {
        setAds(ads.filter((a) => a.id !== adId))
        setSelectedAd(null)
        setRejectionReason("")
      } else {
        const data = await res.json()
        alert(data.error || "Failed to reject ad")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to reject ad")
    } finally {
      setProcessing(false)
    }
  }

  async function handleFlagAd(adId: string) {
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/moderation/${adId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "flag",
          reason: rejectionReason || "Flagged for manual review",
        }),
      })

      if (res.ok) {
        setAds(ads.filter((a) => a.id !== adId))
        setSelectedAd(null)
        setRejectionReason("")
      } else {
        const data = await res.json()
        alert(data.error || "Failed to flag ad")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to flag ad")
    } finally {
      setProcessing(false)
    }
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return "just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ad Moderation</h1>
          <p className="text-muted-foreground">Review and approve pending ads</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["pending", "flagged", "all"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              size="sm"
            >
              {f === "pending" && `📋 Pending (${stats.pending})`}
              {f === "flagged" && `🚩 Flagged (${stats.flagged})`}
              {f === "all" && `📊 All (${stats.pending + stats.approved + stats.rejected})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-sm text-muted-foreground">Flagged</p>
          <p className="text-2xl font-bold">{stats.flagged}</p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold">{stats.approved}</p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="text-2xl font-bold">{stats.rejected}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ad List */}
        <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto border rounded-lg p-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading ads...</div>
          ) : ads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {filter} ads to review
            </div>
          ) : (
            ads.map((ad) => (
              <div
                key={ad.id}
                onClick={() => setSelectedAd(ad)}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedAd?.id === ad.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-border hover:bg-accent"
                }`}
              >
                <div className="space-y-2">
                  {/* Top Row: Provider Name + Status */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{ad.providers.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{ad.providers.email}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {ad.flagged_for_moderation && (
                        <Badge variant="destructive" className="text-xs">
                          🚩 Flagged
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {ad.moderation_status}
                      </Badge>
                    </div>
                  </div>

                  {/* Ad Details */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{ad.name}</p>
                      <p className="text-xs text-muted-foreground">
                        📍 {ad.providers.city}, {ad.providers.state}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        💰 ${ad.providers.rates_per_hour}/hr
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <Clock className="inline w-3 h-3 mr-1" />
                      {getTimeAgo(ad.created_at)}
                    </div>
                  </div>

                  {/* Photo Count */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    {ad.photo_count} photos
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selectedAd && (
          <div className="lg:col-span-1 border rounded-lg p-4 bg-card sticky top-4 h-fit space-y-4">
            <h2 className="font-bold text-lg">Ad Review</h2>

            {/* Photo Grid */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Photos ({selectedAd.photos.length})</p>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {selectedAd.photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.cloudflare_url}
                    alt="Ad"
                    className="w-full h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>

            {/* Provider Info */}
            <div className="space-y-2 text-sm border-t pt-4">
              <div>
                <p className="text-muted-foreground">Provider</p>
                <p className="font-semibold">{selectedAd.providers.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Age</p>
                <p className="font-semibold">{selectedAd.providers.age}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-semibold">{selectedAd.providers.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-semibold text-xs break-all">{selectedAd.providers.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rates</p>
                <p className="font-semibold">${selectedAd.providers.rates_per_hour}/hr</p>
              </div>
            </div>

            {/* Ad Description */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Description</p>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded max-h-[150px] overflow-y-auto">
                {selectedAd.description}
              </p>
            </div>

            {/* Rejection Reason */}
            <div>
              <label className="text-sm font-medium">Reason (required for rejection)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Why are you rejecting/flagging this ad?"
                className="w-full border rounded p-2 text-sm mt-1 resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {rejectionReason.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 border-t pt-4">
              <Button
                onClick={() => handleApproveAd(selectedAd.id)}
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Ad
              </Button>

              <Button
                onClick={() => handleRejectAd(selectedAd.id)}
                disabled={processing || !rejectionReason.trim()}
                variant="destructive"
                className="w-full"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Ad
              </Button>

              <Button
                onClick={() => handleFlagAd(selectedAd.id)}
                disabled={processing}
                variant="outline"
                className="w-full"
              >
                <Flag className="w-4 h-4 mr-2" />
                Flag for Review
              </Button>
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground border-t pt-4">
              <p>
                Submitted: <strong>{new Date(selectedAd.created_at).toLocaleDateString()}</strong>
              </p>
              <p>
                Status: <strong className="capitalize">{selectedAd.moderation_status}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
