"use client"

import { useEffect, useState } from "react"
import {
  Copy,
  Eye,
  Power,
  Trash2,
  AlertCircle,
  Check,
  Loader,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface EternalLink {
  id: string
  code: string
  url: string
  adTitle: string
  originalAdId: string
  status: string
  createdAt: string
  createdByAdmin: string
  totalViews: number
}

export default function EternalLinksAdmin() {
  const [links, setLinks] = useState<EternalLink[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAdId, setSelectedAdId] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null)

  useEffect(() => {
    fetchLinks()
  }, [])

  async function fetchLinks() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/eternal-links")
      const data = await res.json()

      if (data.success) {
        setLinks(data.links)
      }
    } catch (error) {
      console.error("Error fetching links:", error)
      setMessage("Failed to load eternal links")
    } finally {
      setLoading(false)
    }
  }

  async function createEternalLink() {
    if (!selectedAdId.trim()) {
      setMessage("Please enter an advertisement ID")
      return
    }

    setProcessingId("create")
    try {
      const res = await fetch("/api/admin/eternal-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: selectedAdId }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage(`✓ Eternal link created: ${data.eternalLink.code}`)
        setSelectedAdId("")
        fetchLinks()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Failed to create eternal link")
    } finally {
      setProcessingId(null)
    }
  }

  async function copyLink(url: string, code: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccessId(code)
      setTimeout(() => setCopySuccessId(null), 2000)
    } catch (error) {
      console.error("Copy error:", error)
    }
  }

  async function toggleLink(linkId: string, currentStatus: string) {
    setProcessingId(linkId)
    try {
      const action = currentStatus === "active" ? "disable" : "enable"
      const res = await fetch("/api/admin/eternal-links/linkid", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId, action }),
      })

      if (res.ok) {
        setMessage(`✓ Link ${action}d`)
        fetchLinks()
      } else {
        setMessage("Failed to update link")
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Error updating link")
    } finally {
      setProcessingId(null)
    }
  }

  async function deleteLink(linkId: string) {
    if (!confirm("Are you sure you want to delete this eternal link?")) {
      return
    }

    setProcessingId(linkId)
    try {
      const res = await fetch("/api/admin/eternal-links/linkid", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      })

      if (res.ok) {
        setMessage("✓ Link deleted")
        fetchLinks()
      } else {
        setMessage("Failed to delete link")
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Error deleting link")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Eternal Links</h1>
        <p className="text-gray-600">
          Create permanent archived snapshots of advertisements
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-900">{message}</p>
        </div>
      )}

      {/* Create New Eternal Link */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Create New Eternal Link</h2>

        <div>
          <label className="text-sm font-medium">Advertisement ID (UUID)</label>
          <div className="flex gap-2 mt-2">
            <Input
              value={selectedAdId}
              onChange={(e) => setSelectedAdId(e.target.value)}
              placeholder="Paste advertisement ID here"
              className="flex-1"
            />
            <Button
              onClick={createEternalLink}
              disabled={processingId === "create" || !selectedAdId.trim()}
            >
              {processingId === "create" ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Find the advertisement ID in the admin ads management area
          </p>
        </div>
      </Card>

      {/* Eternal Links List */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg">Existing Eternal Links</h2>

        {loading ? (
          <Card className="p-8 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          </Card>
        ) : links.length === 0 ? (
          <Card className="p-8 text-center text-gray-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No eternal links created yet</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <Card key={link.id} className="p-4 space-y-3">
                {/* Title & Code */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg truncate">
                      {link.adTitle}
                    </p>
                    <p className="text-sm text-gray-600 font-mono">
                      Code: {link.code}
                    </p>
                  </div>
                  <Badge
                    variant={link.status === "active" ? "default" : "secondary"}
                  >
                    {link.status}
                  </Badge>
                </div>

                {/* URL & Copy */}
                <div className="flex gap-2">
                  <Input
                    value={link.url}
                    readOnly
                    className="bg-gray-50 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyLink(link.url, link.id)}
                  >
                    {copySuccessId === link.id ? (
                      <>
                        <Check className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-2 border-t border-b text-sm">
                  <div>
                    <p className="text-gray-600">Views</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {link.totalViews}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-semibold">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">By</p>
                    <p className="font-semibold text-xs truncate">
                      {link.createdByAdmin}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={
                      link.status === "active" ? "destructive" : "outline"
                    }
                    onClick={() => toggleLink(link.id, link.status)}
                    disabled={processingId === link.id}
                  >
                    {processingId === link.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-2" />
                        {link.status === "active" ? "Disable" : "Enable"}
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteLink(link.id)}
                    disabled={processingId === link.id}
                  >
                    {processingId === link.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>

                {/* Meta */}
                <p className="text-xs text-gray-500">
                  Original Ad ID: {link.originalAdId}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200 space-y-2">
        <h3 className="font-semibold text-sm">About Eternal Links</h3>
        <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
          <li>Creates a permanent snapshot of an advertisement</li>
          <li>Snapshot persists even if original ad is deleted or edited</li>
          <li>Links are private and not indexed by search engines</li>
          <li>Contact information is hidden for privacy</li>
          <li>View analytics are tracked for each link</li>
          <li>Links can be disabled/enabled or deleted at any time</li>
        </ul>
      </Card>
    </div>
  )
}
