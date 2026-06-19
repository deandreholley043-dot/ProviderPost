"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Edit2, Trash2, Plus, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AdminAd {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  category: string
  rates_per_hour: number
  admin_created_at: string
  admin_notes: string | null
  active: boolean
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdminAd[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    city: "",
    state: "",
    description: "",
    rates_per_hour: "",
    category: "escort",
    adminNotes: "",
  })

  useEffect(() => {
    fetchAdminAds()
  }, [])

  async function fetchAdminAds() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/ads?filter=admin_created")
      const data = await res.json()
      if (data.success) {
        setAds(data.ads || [])
      }
    } catch (error) {
      console.error("Error fetching ads:", error)
      setMessage("Failed to load admin-created ads")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAd(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    try {
      const res = await fetch("/api/admin/ads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        setMessage("✓ Ad created successfully (auto-approved)")
        setFormData({
          name: "",
          email: "",
          phone: "",
          age: "",
          city: "",
          state: "",
          description: "",
          rates_per_hour: "",
          category: "escort",
          adminNotes: "",
        })
        setShowForm(false)
        fetchAdminAds()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Failed to create ad")
    } finally {
      setCreating(false)
    }
  }

  async function deleteAd(adId: string) {
    if (!confirm("Delete this ad?")) return

    try {
      const res = await fetch("/api/admin/ads/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: adId }),
      })

      if (res.ok) {
        setMessage("✓ Ad deleted")
        fetchAdminAds()
      } else {
        const data = await res.json()
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Failed to delete ad")
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin-Created Ads</h1>
          <p className="text-gray-600">Create ads without email/photo verification</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Admin Ad
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">{message}</p>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-lg">Create New Ad</h2>

          <form onSubmit={handleCreateAd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium">Name/Title *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Female Provider, 24"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 555 1234567"
                  required
                />
              </div>

              {/* Age */}
              <div>
                <label className="text-sm font-medium">Age *</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="24"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="text-sm font-medium">City *</label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Los Angeles"
                  required
                />
              </div>

              {/* State */}
              <div>
                <label className="text-sm font-medium">State *</label>
                <Input
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="CA"
                  required
                />
              </div>

              {/* Rates */}
              <div>
                <label className="text-sm font-medium">Hourly Rate *</label>
                <Input
                  type="number"
                  value={formData.rates_per_hour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rates_per_hour: e.target.value,
                    })
                  }
                  placeholder="150"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="escort">Escort</option>
                  <option value="massage">Massage</option>
                  <option value="companionship">Companionship</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ad description..."
                rows={4}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Admin Notes */}
            <div>
              <label className="text-sm font-medium">Admin Notes (Private)</label>
              <textarea
                value={formData.adminNotes}
                onChange={(e) =>
                  setFormData({ ...formData, adminNotes: e.target.value })
                }
                placeholder="Internal notes (not shown to public)"
                rows={2}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={creating}
                className="bg-green-600 hover:bg-green-700"
              >
                {creating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Ad"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-gray-500 border-t pt-4">
              ✓ No email verification required
              <br />✓ No photo verification required
              <br />✓ Auto-approved for public site
              <br />✓ Admin can edit/delete anytime
            </p>
          </form>
        </Card>
      )}

      {/* Ads List */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg">
          Admin-Created Ads ({ads.length})
        </h2>

        {loading ? (
          <Card className="p-8 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          </Card>
        ) : ads.length === 0 ? (
          <Card className="p-8 text-center text-gray-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No admin-created ads yet</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {ads.map((ad) => (
              <Card key={ad.id} className="p-4 space-y-3">
                {/* Top */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{ad.name}</p>
                    <p className="text-sm text-gray-600">{ad.email}</p>
                  </div>
                  <Badge variant="default">
                    {ad.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Details */}
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-semibold">
                      {ad.city}, {ad.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rate</p>
                    <p className="font-semibold">${ad.rates_per_hour}/hr</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-semibold capitalize">{ad.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-semibold">
                      {new Date(ad.admin_created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Admin Notes */}
                {ad.admin_notes && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                    <p className="text-gray-600">Admin Notes:</p>
                    <p className="text-amber-900">{ad.admin_notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 border-t pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      window.location.href = `/admin/admin-ads/${ad.id}/edit`
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteAd(ad.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      window.open(`/providers/${ad.id}`, "_blank")
                    }}
                  >
                    View Public
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200 space-y-2">
        <h3 className="font-semibold text-sm">About Admin Ads</h3>
        <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
          <li>No email verification required</li>
          <li>No photo/selfie/ID verification required</li>
          <li>Auto-approved for public site (appears immediately)</li>
          <li>Marked internally as admin-created</li>
          <li>Only admins can edit, renew, or delete</li>
          <li>Works with all features: images, videos, categories, pricing</li>
          <li>Full audit trail of all admin actions</li>
          <li>Regular user ads unaffected</li>
        </ul>
      </Card>
    </div>
  )
}
