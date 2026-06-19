import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function FeaturedListings() {
  return (
    <section className="bg-secondary/50 py-14">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl text-balance">
              Featured Providers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Verified providers from across the US
            </p>
          </div>
          <Link href="/browse" className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:flex">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No providers listed yet.</p>
          <Link href="/post" className="mt-4 text-sm font-semibold text-primary hover:underline">
            Post the first ad
          </Link>
        </div>
      </div>
    </section>
  )
}
