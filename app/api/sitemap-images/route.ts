// ─── Image Sitemap API ────────────────────────────────────────────────────────
// Generates /sitemap-images.xml for Google Image Search indexing.
// Uses ONLY the SEO image index table — does not touch the user image system.

import { NextResponse } from "next/server"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://providerpost.com"

// Note: In a server component we cannot import localStorage-backed stores.
// In production, replace this with a direct DB query.
// For now we return a valid empty sitemap that search engines accept.
// The admin SEO page populates the index; a backend DB query would serve it here.

export async function GET() {
  // TODO: Replace with DB query when backend is connected:
  // const records = await db.query("SELECT * FROM seo_image_index")
  // const entries = records.map(r => ({ pageUrl: ..., imageUrl: ..., ... }))

  const entries: { pageUrl: string; imageUrl: string; title: string; caption: string }[] = []

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map((e) => `  <url>
    <loc>${escapeXml(e.pageUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(e.imageUrl)}</image:loc>
      <image:title>${escapeXml(e.title)}</image:title>
      <image:caption>${escapeXml(e.caption)}</image:caption>
    </image:image>
  </url>`).join("\n")}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
