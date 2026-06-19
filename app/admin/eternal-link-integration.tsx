// ETERNAL LINK BUTTON INTEGRATION
// Add this to your existing admin ads listing page

import { useState } from "react"
import { Link2, Loader, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EternalLinkButtonProps {
  adId: string
  adTitle: string
}

export function EternalLinkButton({ adId, adTitle }: EternalLinkButtonProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  async function createAndCopyEternalLink() {
    setLoading(true)
    setError("")
    
    try {
      // Create eternal link
      const res = await fetch("/api/admin/eternal-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Failed to create eternal link")
        setLoading(false)
        return
      }

      // Copy URL to clipboard
      const url = data.eternalLink.url
      await navigator.clipboard.writeText(url)
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      setError("Error creating eternal link")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={createAndCopyEternalLink}
        disabled={loading}
        className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
        title={`Create eternal archive for: ${adTitle}`}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
          </>
        ) : copied ? (
          <>
            <Check className="w-4 h-4" />
            <span className="ml-1 text-xs">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" />
            <span className="ml-1 text-xs">Eternal</span>
          </>
        )}
      </Button>
      
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  )
}

// USAGE IN YOUR EXISTING ADMIN ADS PAGE:
// 
// Add this import at the top:
// import { EternalLinkButton } from "@/app/admin/eternal-link-integration"
//
// Then in your table rows, add the button:
//
// <TableRow key={ad.id}>
//   <TableCell>{ad.name}</TableCell>
//   <TableCell>{ad.email}</TableCell>
//   <TableCell>{ad.moderation_status}</TableCell>
//   <TableCell className="text-right space-x-2 flex justify-end gap-2">
//     {/* Existing buttons */}
//     <Button variant="outline" size="sm">View</Button>
//     <Button variant="outline" size="sm">Edit</Button>
//     
//     {/* ADD THIS NEW BUTTON */}
//     <EternalLinkButton adId={ad.id} adTitle={ad.name} />
//     
//     {/* More existing buttons */}
//     <Button variant="destructive" size="sm">Delete</Button>
//   </TableCell>
// </TableRow>
