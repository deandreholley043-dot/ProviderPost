"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Check, X, Loader, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Verification {
  id: string
  user_id: string
  status: string
  document_type: string
  document_url: string
  created_at: string
  reviewed_at: string
  rejection_reason: string
  users: { email: string }
}

export default function AgeVerificationAdminPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [reviewData, setReviewData] = useState({
    dateOfBirth: "",
    rejectionReason: "",
    adminNotes: "",
  })

  useEffect(() => {
    fetchVerifications()
  }, [activeTab])

  async function fetchVerifications() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/age-verification?status=${activeTab}`)
      const data = await res.json()
      if (data.success) {
        setVerifications(data.verifications || [])
      }
    } catch (error) {
      console.error("Error fetching verifications:", error)
      setMessage("Failed to load verifications")
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(verificationId: string) {
    if (!reviewData.dateOfBirth) {
      alert("Please enter date of birth")
      return
    }

    try {
      const res = await fetch("/api/admin/age-verification/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId,
          action: "approve",
          dateOfBirth: reviewData.dateOfBirth,
          adminNotes: reviewData.adminNotes,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage("✓ Verification approved")
        setReviewingId(null)
        setReviewData({ dateOfBirth: "", rejectionReason: "", adminNotes: "" })
        fetchVerifications()
      } else {
        setMessage("Error: " + (data.error || "Failed to approve"))
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Error: Failed to approve")
    }
  }

  async function handleReject(verificationId: string) {
    if (!reviewData.rejectionReason) {
      alert("Please enter rejection reason")
      return
    }

    try {
      const res = await fetch("/api/admin/age-verification/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId,
          action: "reject",
          rejectionReason: reviewData.rejectionReason,
          adminNotes: reviewData.adminNotes,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage("✓ Verification rejected")
        setReviewingId(null)
        setReviewData({ dateOfBirth: "", rejectionReason: "", adminNotes: "" })
        fetchVerifications()
      } else {
        setMessage("Error: " + (data.error || "Failed to reject"))
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Error: Failed to reject")
    }
  }

  const stats = {
    pending: verifications.length,
    approved: 0,
    rejected: 0,
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Age Verification Reviews</h1>
        <p className="text-gray-600">Review and approve user age verifications</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.startsWith("✓")
              ? "bg-green-50 text-green-900"
              : "bg-red-50 text-red-900"
          }`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {["pending", "approved", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Verifications List */}
      {loading ? (
        <Card className="p-8 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto" />
        </Card>
      ) : verifications.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No {activeTab} verifications</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <Card key={verification.id} className="p-6 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-lg">{verification.users.email}</p>
                  <p className="text-sm text-gray-600">
                    {verification.document_type.replace(/_/g, " ")}
                  </p>
                </div>
                <Badge
                  variant={
                    verification.status === "approved"
                      ? "default"
                      : verification.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {verification.status}
                </Badge>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-semibold">
                    {new Date(verification.created_at).toLocaleDateString()}
                  </p>
                </div>
                {verification.reviewed_at && (
                  <div>
                    <p className="text-gray-600">Reviewed</p>
                    <p className="font-semibold">
                      {new Date(verification.reviewed_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Document Link */}
              {verification.document_url && !verification.document_url.startsWith("pending") && (
                <div className="flex gap-2">
                  <a
                    href={verification.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Document
                  </a>
                </div>
              )}

              {/* Rejection Reason */}
              {verification.rejection_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                  <p className="text-gray-600">Rejection Reason:</p>
                  <p className="text-red-900">{verification.rejection_reason}</p>
                </div>
              )}

              {/* Review Form */}
              {verification.status === "pending" && reviewingId === verification.id && (
                <div className="border-t pt-4 space-y-4 bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold">Review Verification</h3>

                  {/* Approve Fields */}
                  <div>
                    <label className="text-sm font-medium">Date of Birth *</label>
                    <input
                      type="date"
                      value={reviewData.dateOfBirth}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded mt-1"
                    />
                  </div>

                  {/* Rejection Reason */}
                  <div>
                    <label className="text-sm font-medium">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={reviewData.rejectionReason}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          rejectionReason: e.target.value,
                        })
                      }
                      placeholder="e.g., Document illegible, expired, etc."
                      className="w-full px-3 py-2 border rounded mt-1 text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="text-sm font-medium">Admin Notes</label>
                    <textarea
                      value={reviewData.adminNotes}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          adminNotes: e.target.value,
                        })
                      }
                      placeholder="Internal notes..."
                      className="w-full px-3 py-2 border rounded mt-1 text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(verification.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(verification.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setReviewingId(null)
                        setReviewData({
                          dateOfBirth: "",
                          rejectionReason: "",
                          adminNotes: "",
                        })
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Button */}
              {verification.status === "pending" && reviewingId !== verification.id && (
                <Button
                  onClick={() => setReviewingId(verification.id)}
                  className="w-full"
                >
                  Review
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200 space-y-2">
        <h3 className="font-semibold text-sm">Age Verification Guidelines</h3>
        <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
          <li>Only approve if document is clearly readable</li>
          <li>Verify the date matches the stated age</li>
          <li>Reject if document appears expired or forged</li>
          <li>User must be at least 18 years old</li>
          <li>ID documents will be deleted 30 days after approval</li>
        </ul>
      </Card>
    </div>
  )
}
