"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to your error tracking service here (e.g. Sentry)
    console.error("[ProviderPost Error]", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-background font-sans">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 border-2 border-red-200">
            <span className="text-4xl font-extrabold text-red-400">500</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-sm mb-2 leading-relaxed">
            An unexpected error occurred on our end. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          {!error.digest && <div className="mb-6" />}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground px-6 py-2.5 text-sm font-semibold hover:border-pink-300 transition-colors"
            >
              Go to Homepage
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground px-6 py-2.5 text-sm font-semibold hover:border-pink-300 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
