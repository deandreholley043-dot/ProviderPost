"use client"

import { useState, useRef, useCallback } from "react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Camera,
  Video,
  X,
  AlertCircle,
  Search,
  Trash2,
  Eye,
  Filter,
} from "lucide-react"

// Types
interface MediaFile {
  id: string
  file: File
  name: string
  type: "photo" | "video"
  previewUrl: string
  size: string
  duration?: number
  uploadedAt: string
  status: "approved" | "pending"
}

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/mpeg", "video/x-msvideo", "video/avi"]
const MAX_PHOTO_MB = 5
const MAX_VIDEO_MB = 50
const MAX_VIDEO_DURATION = 30

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = () => reject(new Error("Unable to read video"))
    video.src = URL.createObjectURL(file)
  })
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function MediaPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "photo" | "video">("all")
  const [previewItem, setPreviewItem] = useState<MediaFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null)
      const fileArr = Array.from(files)

      for (const file of fileArr) {
        const isPhoto = PHOTO_TYPES.includes(file.type)
        const isVideo = VIDEO_TYPES.includes(file.type)

        if (!isPhoto && !isVideo) {
          setError(`"${file.name}" is not a supported format. Use JPG, PNG, WebP, MP4, MOV, MPEG, or AVI.`)
          continue
        }

        if (isPhoto && file.size > MAX_PHOTO_MB * 1024 * 1024) {
          setError(`Photo "${file.name}" exceeds ${MAX_PHOTO_MB}MB limit.`)
          continue
        }

        if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
          setError(`Video "${file.name}" exceeds ${MAX_VIDEO_MB}MB limit.`)
          continue
        }

        let duration: number | undefined
        if (isVideo) {
          try {
            duration = await getDuration(file)
            if (duration > MAX_VIDEO_DURATION) {
              setError(`"${file.name}" is ${Math.round(duration)}s. Max is ${MAX_VIDEO_DURATION}s.`)
              continue
            }
            duration = Math.round(duration)
          } catch {
            setError(`Could not read "${file.name}". Try a different file.`)
            continue
          }
        }

        const newFile: MediaFile = {
          id: generateId(),
          file,
          name: file.name,
          type: isPhoto ? "photo" : "video",
          previewUrl: URL.createObjectURL(file),
          size: formatSize(file.size),
          duration,
          uploadedAt: formatDate(),
          status: "approved",
        }

        setMediaFiles((prev) => [newFile, ...prev])
      }
    },
    []
  )

  const removeFile = (id: string) => {
    setMediaFiles((prev) => {
      const item = prev.find((f) => f.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
    if (previewItem?.id === id) setPreviewItem(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files)
  }

  const filteredFiles = mediaFiles.filter((f) => {
    const matchesType = filterType === "all" || f.type === filterType
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const photoCount = mediaFiles.filter((f) => f.type === "photo").length
  const videoCount = mediaFiles.filter((f) => f.type === "video").length

  return (
    <PageShell
      title="Media Library"
      description="Upload and manage photos and videos for provider ads."
    >
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary" className="px-3 py-1">
          <Camera className="mr-1.5 h-3 w-3" />
          {photoCount} Photo{photoCount !== 1 ? "s" : ""}
        </Badge>
        <Badge variant="secondary" className="px-3 py-1">
          <Video className="mr-1.5 h-3 w-3" />
          {videoCount} Video{videoCount !== 1 ? "s" : ""}
        </Badge>
        <Badge variant="secondary" className="px-3 py-1">
          {mediaFiles.length} Total
        </Badge>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-input bg-card hover:border-primary/50"
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
      >
        <Upload className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Click or drag files to upload
        </p>
        <p className="text-xs text-muted-foreground">
          Photos: JPG, PNG, WebP (up to {MAX_PHOTO_MB}MB) &middot; Videos: MP4, MOV, MPEG, AVI (up to {MAX_VIDEO_MB}MB, {MAX_VIDEO_DURATION}s max)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.mpeg,.avi"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Search & filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            className="bg-card pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["all", "photo", "video"] as const).map((t) => (
            <Button
              key={t}
              variant={filterType === t ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(t)}
              className="capitalize"
            >
              {t === "all" ? "All" : t === "photo" ? "Photos" : "Videos"}
            </Button>
          ))}
        </div>
      </div>

      {/* Media grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredFiles.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card"
            >
              {/* Preview */}
              <div className="relative aspect-square bg-muted">
                {item.type === "photo" ? (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={item.previewUrl}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseLeave={(e) => {
                      const el = e.target as HTMLVideoElement
                      el.pause()
                      el.currentTime = 0
                    }}
                  />
                )}

                {/* Type badge */}
                <div className="absolute left-1.5 top-1.5">
                  {item.type === "photo" ? (
                    <div className="flex items-center gap-1 rounded bg-foreground/70 px-1.5 py-0.5">
                      <Camera className="h-3 w-3 text-background" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 rounded bg-foreground/70 px-1.5 py-0.5">
                      <Video className="h-3 w-3 text-background" />
                      <span className="text-[10px] font-medium text-background">{item.duration}s</span>
                    </div>
                  )}
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPreviewItem(item)}
                    aria-label="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(item.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-0.5 px-2.5 py-2">
                <p className="truncate text-xs font-medium text-card-foreground">{item.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{item.size}</span>
                  <Badge
                    className={
                      item.status === "approved"
                        ? "h-4 bg-emerald-100 px-1.5 text-[9px] text-emerald-700"
                        : "h-4 bg-pink-100 px-1.5 text-[9px] text-pink-700"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-16">
          {mediaFiles.length === 0 ? (
            <>
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">No media uploaded yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload photos and videos using the area above
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No results match your search.</p>
          )}
        </div>
      )}

      {/* Preview modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-lg bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 h-8 w-8 bg-card/80"
              onClick={() => setPreviewItem(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {previewItem.type === "photo" ? (
              <img
                src={previewItem.previewUrl}
                alt={previewItem.name}
                className="max-h-[80vh] w-auto object-contain"
              />
            ) : (
              <video
                src={previewItem.previewUrl}
                controls
                autoPlay
                className="max-h-[80vh] w-auto"
              />
            )}
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-card-foreground">{previewItem.name}</p>
                <p className="text-xs text-muted-foreground">
                  {previewItem.size} &middot; {previewItem.uploadedAt}
                  {previewItem.duration ? ` \u00B7 ${previewItem.duration}s` : ""}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeFile(previewItem.id)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
