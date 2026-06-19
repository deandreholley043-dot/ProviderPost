"use client"

import { useState, useRef, useCallback } from "react"
import { Video, X, Upload, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const ACCEPTED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/mpeg",
  "video/x-msvideo",
  "video/avi",
]
const ACCEPTED_EXTENSIONS = ".mp4,.mov,.mpeg,.avi"
const MAX_CLIPS = 3
const MAX_DURATION = 30 // seconds
const MAX_SIZE_MB = 50

interface VideoFile {
  file: File
  name: string
  duration: number
  previewUrl: string
  size: string
}

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

export function VideoUploader() {
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null)
      const fileArr = Array.from(files)

      for (const file of fileArr) {
        if (videos.length + 1 > MAX_CLIPS) {
          setError(`Maximum ${MAX_CLIPS} video clips allowed.`)
          return
        }

        // Check type
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError("Invalid file type. Accepted formats: MP4, MOV, MPEG, AVI.")
          continue
        }

        // Check size
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`File "${file.name}" exceeds ${MAX_SIZE_MB}MB limit.`)
          continue
        }

        // Check duration
        try {
          const duration = await getDuration(file)
          if (duration > MAX_DURATION) {
            setError(
              `"${file.name}" is ${Math.round(duration)}s long. Maximum is ${MAX_DURATION} seconds.`
            )
            continue
          }

          const newVideo: VideoFile = {
            file,
            name: file.name,
            duration: Math.round(duration),
            previewUrl: URL.createObjectURL(file),
            size: formatSize(file.size),
          }

          setVideos((prev) => {
            if (prev.length >= MAX_CLIPS) return prev
            return [...prev, newVideo]
          })
        } catch {
          setError(`Could not read "${file.name}". Please try a different file.`)
        }
      }
    },
    [videos.length]
  )

  const removeVideo = (index: number) => {
    setVideos((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].previewUrl)
      updated.splice(index, 1)
      return updated
    })
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const remaining = MAX_CLIPS - videos.length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Upload Videos
        </label>
        <span className="text-xs text-muted-foreground">
          {videos.length}/{MAX_CLIPS} clips
        </span>
      </div>

      {/* Drop zone */}
      {remaining > 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed px-4 py-8 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-input bg-muted/30 hover:border-primary/50"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
          }}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Click or drag to upload video clips
          </p>
          <p className="text-xs text-muted-foreground">
            MP4, MOV, MPEG, AVI &middot; Max 30 seconds &middot; Up to 50MB each
          </p>
          <p className="text-xs text-muted-foreground">
            {remaining} clip{remaining !== 1 ? "s" : ""} remaining
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) processFiles(e.target.files)
              e.target.value = ""
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Previews */}
      {videos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {videos.map((v, i) => (
            <div
              key={i}
              className="relative flex flex-col overflow-hidden rounded-md border border-border bg-card"
            >
              <div className="relative aspect-video bg-foreground/5">
                <video
                  src={v.previewUrl}
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
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-6 w-6"
                  onClick={() => removeVideo(i)}
                  aria-label={`Remove ${v.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-foreground/70 px-1.5 py-0.5">
                  <Video className="h-3 w-3 text-background" />
                  <span className="text-[10px] font-medium text-background">
                    {v.duration}s
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-2.5 py-2">
                <p className="truncate text-xs font-medium text-card-foreground">
                  {v.name}
                </p>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {v.size}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
