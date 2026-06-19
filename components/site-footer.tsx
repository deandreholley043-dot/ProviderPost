import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-foreground mb-1">Pages</p>
            <Link href="/" className="text-sm text-primary hover:underline">Home</Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary hover:underline">About Us</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary hover:underline">Privacy Policy</Link>
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary hover:underline">FAQ / Help</Link>
            <Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-primary hover:underline">Disclaimer</Link>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-foreground mb-1">Support</p>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary hover:underline">Contact Us</Link>
            <Link href="/post" className="text-sm text-muted-foreground hover:text-primary hover:underline">Advertise With Us</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary hover:underline">Support</Link>
          </div>

          {/* Column 3 — full width on small screens */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-foreground mb-1">About</p>
            <p className="text-xs text-muted-foreground">
              ProviderPost connects people with verified providers across all 50 states and Canadian provinces. All ads are reviewed by our team.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Report suspicious ads to help keep our community safe.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-5 text-center">
          <p className="text-xs text-muted-foreground">
            ProviderPost 2026. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
