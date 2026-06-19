import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"

const perks = [
  "Unlimited reposts -- bump your ad to the top for free",
  "Display your contact details for free",
  "Unlimited location changes",
  "Verified badge for trusted providers",
]

export function CtaBanner() {
  return (
    <section className="bg-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 text-center lg:flex-row lg:px-8 lg:text-left">
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-card sm:text-3xl text-balance">
            All Ads Are <span className="text-pink-400">100% Free</span> on ProviderPost
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm text-card/80">
                <CheckCircle className="h-4 w-4 shrink-0 text-pink-400" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/post"
            className="flex items-center justify-center gap-2 rounded-lg bg-pink-400 px-8 py-3.5 font-bold text-foreground transition-colors hover:bg-pink-500"
          >
            Post Free Ad <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/browse"
            className="flex items-center justify-center gap-2 rounded-lg border border-card/30 px-8 py-3.5 font-bold text-card transition-colors hover:bg-card/10"
          >
            Browse Ads
          </Link>
        </div>
      </div>
    </section>
  )
}
