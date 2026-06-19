import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { createHash } from "crypto"
import sharp from "sharp"

// Cloudflare R2 is S3-compatible
const r2Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || "",
})

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "providerpost"
const PUBLIC_URL_BASE = process.env.CLOUDFLARE_R2_PUBLIC_URL || ""

export interface UploadResult {
  success: boolean
  photoId: string
  url: string
  size: number
  width: number
  height: number
  hash: string
  error?: string
}

/**
 * Upload image to Cloudflare R2
 * - Validates file type
 * - Strips EXIF data
 * - Compresses to 1200px width
 * - Generates SHA256 hash for deduplication
 */
export async function uploadToR2(
  file: Buffer,
  originalName: string
): Promise<UploadResult> {
  try {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    // For now, accept based on extension (sharp will validate)
    const ext = originalName.split(".").pop()?.toLowerCase()
    if (!["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      return {
        success: false,
        photoId: "",
        url: "",
        size: 0,
        width: 0,
        height: 0,
        hash: "",
        error: "Invalid file type. Only JPEG, PNG, WebP allowed.",
      }
    }

    // Validate file size (5MB max)
    if (file.length > 5 * 1024 * 1024) {
      return {
        success: false,
        photoId: "",
        url: "",
        size: 0,
        width: 0,
        height: 0,
        hash: "",
        error: "File too large. Max 5MB.",
      }
    }

    // Generate hash for deduplication
    const hash = createHash("sha256").update(file).digest("hex")

    // Process image with sharp
    // - Strip EXIF
    // - Resize to max 1200px width
    // - Convert to JPEG for consistency
    const image = sharp(file).withMetadata(false)

    const metadata = await image.metadata()
    let width = metadata.width || 1200
    let height = metadata.height || 800

    // Resize if wider than 1200px
    if (width > 1200) {
      const resized = await sharp(file)
        .withMetadata(false)
        .resize(1200, Math.round((height * 1200) / width), {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer()

      const resizedMeta = await sharp(resized).metadata()
      width = resizedMeta.width || 1200
      height = resizedMeta.height || 800

      // Upload to R2
      const photoId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const key = `photos/${photoId}.jpg`

      await r2Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: resized,
          ContentType: "image/jpeg",
          Metadata: {
            "original-name": originalName,
            "uploaded-at": new Date().toISOString(),
          },
        })
      )

      const url = `${PUBLIC_URL_BASE}/${key}`

      return {
        success: true,
        photoId,
        url,
        size: resized.length,
        width,
        height,
        hash,
      }
    }

    // Original is smaller than 1200px, just remove EXIF and upload
    const processed = await sharp(file)
      .withMetadata(false)
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()

    const photoId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const key = `photos/${photoId}.jpg`

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: processed,
        ContentType: "image/jpeg",
        Metadata: {
          "original-name": originalName,
          "uploaded-at": new Date().toISOString(),
        },
      })
    )

    const url = `${PUBLIC_URL_BASE}/${key}`

    return {
      success: true,
      photoId,
      url,
      size: processed.length,
      width,
      height,
      hash,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      photoId: "",
      url: "",
      size: 0,
      width: 0,
      height: 0,
      hash: "",
      error: "Upload failed. Please try again.",
    }
  }
}

/**
 * Delete photo from R2 and database
 */
export async function deleteFromR2(photoId: string): Promise<boolean> {
  try {
    const key = `photos/${photoId}.jpg`
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    )
    return true
  } catch (error) {
    console.error("Delete error:", error)
    return false
  }
}
