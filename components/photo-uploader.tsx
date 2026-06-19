"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, X, Upload, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp"
const MAX_PHOTOS = 6
const MAX_SIZE_MB = 10
const COMPRESSED_MAX_WIDTH = 1200
const COMPRESSED_QUALITY = 0.75

interface PhotoFile {
  file: File
  name: string
  previewUrl: string
  originalSize: string
  compressedSize: string
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function compressImage(file: File): Promise<{ blob: Blob; url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      let width = img.width
      let height = img.height

      if (width > COMPRESSED_MAX_WIDTH) {
        height = Math.round((height * COMPRESSED_MAX_WIDTH) / width)
        width = COMPRESSED_MAX_WIDTH
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas context failed"))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"))
            return
          }
          const url = URL.createObjectURL(blob)
          resolve({ blob, url })
        },
        "image/jpeg",
        COMPRESSED_QUALITY
      )
    }
    img.onerror = () => reject(new Error("Could not load image"))
    img.src = URL.createObjectURL(file)
  })
}

export function PhotoUploader() {
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null)
      const fileArr = Array.from(files)
      setCompressing(true)

      try {
        for (const file of fileArr) {
          if (photos.length + 1 > MAX_PHOTOS) {
            setError(`Maximum ${MAX_PHOTOS} photos allowed.`)
            break
          }

          if (!ACCEPTED_TYPES.includes(file.type)) {
            setError("Invalid file type. Accepted: JPG, PNG, WebP.")
            continue
          }

          if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`"${file.name}" exceeds ${MAX_SIZE_MB}MB limit.`)
            continue
          }

          const { blob, url } = await compressImage(file)

          const newPhoto: PhotoFile = {
            file: new File([blob], file.name, { type: "image/jpeg" }),
            name: file.name,
            previewUrl: url,
            originalSize: formatSize(file.size),
            compressedSize: formatSize(blob.size),
          }

          setPhotos((prev) => {
            if (prev.length >= MAX_PHOTOS) return prev
            return [...prev, newPhoto]
          })
        }
      } finally {
        setCompressing(false)
      }
    },
    [photos.length]
  )

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
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
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files)
  }

  const remaining = MAX_PHOTOS - photos.length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Upload Photos
        </label>
        <span className="text-xs text-muted-foreground">
          {photos.length}/{MAX_PHOTOS} photos
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
          {compressing ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">
                Compressing...
              </p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Click or drag to upload photos
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP &middot; Auto-compressed to 1200px
              </p>
              <p className="text-xs text-muted-foreground">
                {remaining} photo{remaining !== 1 ? "s" : ""} remaining
              </p>
            </>
          )}
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

      {remaining === 0 && (
        <p className="text-center text-xs font-medium text-primary">
          Maximum {MAX_PHOTOS} photos reached.
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {photos.map((p, i) => (
            <div
              key={i}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-border bg-card"
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={p.previewUrl}
                alt={p.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  removePhoto(i)
                }}
                aria-label={`Remove ${p.name}`}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute inset-x-0 bottom-0 bg-foreground/60 px-1.5 py-0.5">
                <p className="truncate text-[9px] text-background">
                  {p.originalSize} &rarr; {p.compressedSize}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].previewUrl}
              alt={photos[lightboxIndex].name}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />

            {/* Close */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute -right-3 -top-3 h-8 w-8 rounded-full shadow-lg"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Prev / Next */}
            {photos.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 px-3 py-2 text-sm font-bold text-foreground shadow hover:bg-card"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + photos.length) % photos.length
                    )
                  }
                >
                  &#8249;
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 px-3 py-2 text-sm font-bold text-foreground shadow hover:bg-card"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % photos.length)
                  }
                >
                  &#8250;
                </button>
              </>
            )}

            {/* Info bar */}
            <div className="mt-2 flex items-center justify-between rounded-md bg-card px-3 py-2 shadow">
              <p className="text-sm font-medium text-card-foreground">
                {photos[lightboxIndex].name}
              </p>
              <p className="text-xs text-muted-foreground">
                {lightboxIndex + 1} of {photos.length} &middot;{" "}
                {photos[lightboxIndex].compressedSize}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
