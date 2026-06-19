"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, XCircle, Flag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Photo {
  id: string
  provider_id: string
  cloudflare_url: string
  width: number
  height: number
  created_at: string
  moderation_status: string
  flagged_for_moderation: boolean
  manually_verified: boolean
  providers: {
    id: string
    name: string
    email: string
    age: number
  }
}

type FilterType = "pending" | "flagged" | "approved" | "rejected"

export default function PhotoVerificationPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("pending")
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [reason, setReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPhotos()
  }, [filter])

  async function fetchPhotos() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/photos/pending?filter=${filter}`)
      const data = await res.json()
      if (data.success) {
        setPhotos(data.photos || [])
      }
    } catch (error) {
      console.error("Error fetching photos:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprovePhoto(photoId: string) {
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/photos/photo?id=${photoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", reason: reason || "Admin approved" }),
      })
      
      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== photoId))
        setSelectedPhoto(null)
        setReason("")
      } else {
        alert("Failed to approve photo")
      }
    } catch (error) {
      console.error("Error approving photo:", error)
      alert("Error approving photo")
    } finally {
      setProcessing(false)
    }
  }

  async function handleRejectPhoto(photoId: string) {
    if (!reason.trim()) {
      alert("Please provide a rejection reason")
      return
    }
    
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/photos/photo?id=${photoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      })
      
      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== photoId))
        setSelectedPhoto(null)
        setReason("")
      } else {
        alert("Failed to reject photo")
      }
    } catch (error) {
      console.error("Error rejecting photo:", error)
      alert("Error rejecting photo")
    } finally {
      setProcessing(false)
    }
  }

  async function handleFlagPhoto(photoId: string) {
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/photos/photo?id=${photoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "flag", reason: reason || "Admin flagged for manual review" }),
      })
      
      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== photoId))
        setSelectedPhoto(null)
        setReason("")
      } else {
        alert("Failed to flag photo")
      }
    } catch (error) {
      console.error("Error flagging photo:", error)
      alert("Error flagging photo")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Photo Verification</h1>
        <div className="flex gap-2 flex-wrap">
          {(["pending", "flagged", "approved", "rejected"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              onClick={() => { setFilter(f); setSelectedPhoto(null) }}
              size="sm"
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Photo List */}
        <div className="lg:col-span-3 space-y-2 max-h-[70vh] overflow-y-auto border rounded-lg p-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading photos...</div>
          ) : photos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {filter} photos to review
            </div>
          ) : (
            photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedPhoto?.id === photo.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-border hover:bg-accent"
                }`}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={photo.cloudflare_url}
                    alt="Photo"
                    className="w-20 h-20 object-cover rounded"
                  />
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{photo.providers.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{photo.providers.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(photo.created_at).toLocaleDateString()}
                    </p>
                    
                    {/* Badges */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {photo.manually_verified && (
                        <Badge variant="default" className="bg-green-600 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {photo.flagged_for_moderation && (
                        <Badge variant="destructive" className="text-xs">
                          <Flag className="w-3 h-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {photo.moderation_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selectedPhoto && (
          <div className="lg:col-span-1 border rounded-lg p-4 bg-card sticky top-4 h-fit space-y-4">
            <h2 className="font-bold text-lg">Photo Review</h2>
            
            {/* Large Preview */}
            <img
              src={selectedPhoto.cloudflare_url}
              alt="Preview"
              className="w-full rounded"
            />
            
            {/* Provider Info */}
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Provider</p>
                <p className="font-semibold">{selectedPhoto.providers.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Age</p>
                <p className="font-semibold">{selectedPhoto.providers.age}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-semibold text-xs break-all">{selectedPhoto.providers.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold capitalize">{selectedPhoto.moderation_status}</p>
              </div>
            </div>

            {/* Reason Textarea */}
            <div>
              <label className="text-sm font-medium">Notes / Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional: Add notes or rejection reason..."
                className="w-full border rounded p-2 text-sm mt-1 resize-none"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => handleApprovePhoto(selectedPhoto.id)}
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              
              <Button
                onClick={() => handleRejectPhoto(selectedPhoto.id)}
                disabled={processing || !reason.trim()}
                variant="destructive"
                className="w-full"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              
              <Button
                onClick={() => handleFlagPhoto(selectedPhoto.id)}
                disabled={processing}
                variant="outline"
                className="w-full"
              >
                <Flag className="w-4 h-4 mr-2" />
                Flag for Review
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1">
              <p>Total to review: <strong>{photos.length}</strong></p>
              <p>Dimensions: <strong>{selectedPhoto.width}×{selectedPhoto.height}</strong></p>
              <p>Uploaded: <strong>{new Date(selectedPhoto.created_at).toLocaleDateString()}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
