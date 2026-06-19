"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, MapPin, Phone, Mail, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface ArchivedAd {
  title: string
  description: string
  category: string
  city: string
  state: string
  zip?: string
  phone: string
  email: string
  website: string
  age: number
  rates_per_hour: number
  ethnicity: string
  created_at: string
  moderation_status: string
  images: Array<{
    id: string
    cloudflare_url: string
  }>
}

interface EternalLink {
  id: string
  code: string
  archived_data: ArchivedAd
  status: string
  created_at: string
  total_views: number
}

export default function EternalLinkPage() {
  const params = useParams()
  const code = params.ecode as string

  const [link, setLink] = useState<EternalLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    // Track view
    const trackView = async () => {
      try {
        await fetch(`/api/eternal-links/${code}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referrer: document.referrer }),
        })
      } catch (error) {
        console.error("Error tracking view:", error)
      }
    }

    // Fetch eternal link data
    const fetchLink = async () => {
      try {
        const res = await fetch(`/api/eternal-links/${code}`)
        const data = await res.json()

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true)
          }
          setLoading(false)
          return
        }

        if (data.link.status === "disabled") {
          setDisabled(true)
          setLoading(false)
          return
        }

        setLink(data.link)
        trackView()
        setLoading(false)
      } catch (error) {
        console.error("Error fetching eternal link:", error)
        setNotFound(true)
        setLoading(false)
      }
    }

    if (code) {
      fetchLink()
    }
  }, [code])

  // Set meta tags
  useEffect(() => {
    const helmet = document.querySelector("meta[name='robots']")
    if (!helmet) {
      const meta = document.createElement("meta")
      meta.name = "robots"
      meta.content = "noindex, nofollow"
      document.head.appendChild(meta)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading archived advertisement...</p>
        </div>
      </div>
    )
  }

  if (notFound || disabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">Link Not Available</h1>
          <p className="text-gray-600">
            {disabled
              ? "This archived link has been disabled."
              : "This archived advertisement link is no longer available."}
          </p>
          <Link href="/">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!link) {
    return null
  }

  const ad = link.archived_data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <p className="text-xs text-gray-500 mt-2">
            ⚠️ This is an archived snapshot of an advertisement
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{ad.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{ad.category}</Badge>
            <Badge variant="outline">{ad.moderation_status}</Badge>
            <Badge variant="outline">
              Archived {new Date(link.created_at).toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {/* Photos Grid */}
        {ad.images && ad.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ad.images.map((img: any) => (
              <div
                key={img.id}
                className="aspect-square rounded-lg overflow-hidden bg-gray-200"
              >
                <img
                  src={img.cloudflare_url}
                  alt="Ad photo"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h2 className="font-bold text-lg">About</h2>

              {ad.age && (
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{ad.age}</p>
                </div>
              )}

              {ad.ethnicity && (
                <div>
                  <p className="text-sm text-gray-600">Ethnicity</p>
                  <p className="font-semibold">{ad.ethnicity}</p>
                </div>
              )}

              {ad.rates_per_hour && (
                <div>
                  <p className="text-sm text-gray-600">Rates</p>
                  <p className="font-semibold text-green-600">
                    ${ad.rates_per_hour}/hour
                  </p>
                </div>
              )}
            </Card>

            {/* Location */}
            <Card className="p-6 space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h2>

              {(ad.city || ad.state) && (
                <p className="font-semibold">
                  {ad.city}
                  {ad.city && ad.state && ", "}
                  {ad.state}
                </p>
              )}

              {ad.zip && <p className="text-sm text-gray-600">ZIP: {ad.zip}</p>}
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Contact Info - REMOVED FROM PUBLIC VIEW FOR PRIVACY */}
            <Card className="p-6 space-y-4 bg-amber-50 border-amber-200">
              <h2 className="font-bold text-lg">Contact Information</h2>
              <p className="text-sm text-gray-600">
                Contact information is not displayed in archived links for privacy
                reasons.
              </p>
            </Card>

            {/* Archive Info */}
            <Card className="p-6 space-y-4 bg-blue-50 border-blue-200">
              <h2 className="font-bold text-lg">Archive Information</h2>

              <div>
                <p className="text-sm text-gray-600">Archived</p>
                <p className="font-semibold">
                  {new Date(link.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Views</p>
                <p className="font-semibold">{link.total_views}</p>
              </div>

              <p className="text-xs text-gray-500 pt-4 border-t">
                This is a permanent archived snapshot of an advertisement. The
                original listing may have been edited, deleted, or expired. This
                archive preserves the state of the advertisement at the time it
                was archived.
              </p>
            </Card>
          </div>
        </div>

        {/* Description */}
        {ad.description && (
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{ad.description}</p>
          </Card>
        )}

        {/* SEO Meta Tags */}
        <meta name="robots" content="noindex, nofollow" />
      </div>
    </div>
  )
}
