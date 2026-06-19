import { Search, Star, Phone } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Browse",
    description:
      "Browse provider ads by location or category. Use filters to find the right provider near you.",
  },
  {
    icon: Star,
    title: "Review",
    description:
      "Read verified reviews, check photos, and view detailed profiles to make an informed choice.",
  },
  {
    icon: Phone,
    title: "Connect",
    description:
      "Contact the provider directly by phone or messaging app. Set up your appointment with ease.",
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl text-balance">
          How ProviderPost Works
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Three simple steps to connecting with a provider
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
              <step.icon className="h-7 w-7 text-pink-600" />
            </div>
            <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-card">
              {i + 1}
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{step.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
