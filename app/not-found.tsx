import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-50 border-2 border-pink-200">
        <span className="text-4xl font-extrabold text-pink-400">404</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
        The page you are looking for doesn't exist, has been moved, or the link may be incorrect.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Go to Homepage
        </Link>
        <Link
          href="/browse"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground px-6 py-2.5 text-sm font-semibold hover:border-pink-300 transition-colors"
        >
          Browse Ads
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground px-6 py-2.5 text-sm font-semibold hover:border-pink-300 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  )
}
