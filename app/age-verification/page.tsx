"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Upload, CheckCircle, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AgeVerificationPage() {
  const router = useRouter()
  const [status, setStatus] = useState<{
    verified: boolean
    verification: any
    verified_at?: string
    expires_at?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    documentType: "drivers_license",
    dateOfBirth: "",
    document: null as File | null,
  })

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  async function checkVerificationStatus() {
    try {
      const res = await fetch("/api/age-verification/status")
      const data = await res.json()
      if (data.success) {
        setStatus(data)
      }
    } catch (error) {
      console.error("Error checking status:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage("")

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("documentType", formData.documentType)
      formDataToSend.append("dateOfBirth", formData.dateOfBirth)
      if (formData.document) {
        formDataToSend.append("document", formData.document)
      }

      const res = await fetch("/api/age-verification/submit", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await res.json()

      if (data.success) {
        setMessage("✓ " + data.verification.message)
        setFormData({
          documentType: "drivers_license",
          dateOfBirth: "",
          document: null,
        })
        setTimeout(() => checkVerificationStatus(), 1000)
      } else {
        setMessage("Error: " + (data.error || "Failed to submit"))
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Error: Failed to submit verification")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const isVerified = status?.verified
  const verification = status?.verification

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Age Verification</h1>
          <p className="text-gray-600">
            Verify your age to post on the platform and unlock all features
          </p>
        </div>

        {/* Status Card */}
        {isVerified && (
          <Card className="p-6 bg-green-50 border-green-200 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="font-bold text-lg text-green-900">Verified ✓</h2>
                <p className="text-sm text-green-700">
                  Your age has been verified. Thank you!
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Verified:</strong>{" "}
                {status.verified_at ? new Date(status.verified_at).toLocaleDateString() : "N/A"}
              </p>
              {status.expires_at && (
                <p>
                  <strong>Expires:</strong>{" "}
                  {new Date(status.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <Button onClick={() => router.push("/user/account")}>
              Back to Account
            </Button>
          </Card>
        )}

        {/* Pending Verification */}
        {!isVerified && verification?.status === "pending" && (
          <Card className="p-6 bg-amber-50 border-amber-200 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <div>
                <h2 className="font-bold text-lg text-amber-900">
                  Verification Pending
                </h2>
                <p className="text-sm text-amber-700">
                  Your submission is under review. You'll be notified once it's approved.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Document Type:</strong>{" "}
                {verification.documentType.replace(/_/g, " ")}
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(verification.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </Card>
        )}

        {/* Rejected Verification */}
        {!isVerified && verification?.status === "rejected" && (
          <Card className="p-6 bg-red-50 border-red-200 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h2 className="font-bold text-lg text-red-900">
                  Verification Rejected
                </h2>
                <p className="text-sm text-red-700">
                  Your verification was rejected. You can submit again.
                </p>
              </div>
            </div>

            {verification.rejectionReason && (
              <div className="p-3 bg-white rounded border border-red-200">
                <p className="text-sm">
                  <strong>Reason:</strong> {verification.rejectionReason}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Submission Form */}
        {!isVerified && (!verification || verification.status !== "pending") && (
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Submit Your ID</h2>
              <p className="text-sm text-gray-600">
                Upload a clear photo or scan of your government-issued ID. We
                accept driver's licenses, passports, and state IDs.
              </p>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.startsWith("✓")
                    ? "bg-green-50 text-green-900 border border-green-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Document Type *
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) =>
                    setFormData({ ...formData, documentType: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="drivers_license">Driver's License</option>
                  <option value="passport">Passport</option>
                  <option value="state_id">State ID</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Document *
                </label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        document: e.target.files?.[0] || null,
                      })
                    }
                    className="hidden"
                    id="file-input"
                    required
                  />
                  <label
                    htmlFor="file-input"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium">
                      {formData.document?.name || "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500">
                      JPEG, PNG or PDF (max 10MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                <p>
                  <strong>Privacy:</strong> Your ID will be encrypted and
                  securely stored. It will only be viewed by our admin team for
                  verification purposes and will be deleted 30 days after
                  approval.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || !formData.document || !formData.dateOfBirth}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </form>

            {/* Requirements */}
            <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
              <p className="font-medium">Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Document must be clear and readable</li>
                <li>Must show your full name and date of birth</li>
                <li>Must be a valid government-issued ID</li>
                <li>You must be at least 18 years old</li>
              </ul>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
