import Link from "next/link"
import { Briefcase, MapPin, Shield, Users, CheckCircle, Globe } from "lucide-react"

export const metadata = {
  title: "About Us – ProviderPost",
  description: "Learn about ProviderPost — who we are, what we do, and how we connect providers with clients across North America.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">

      {/* Header */}
      <div className="rounded-md bg-pink-400 px-6 py-3 mb-10 flex items-center gap-3">
        <Briefcase className="h-5 w-5 text-pink-900" />
        <h1 className="text-xl font-extrabold text-foreground">About ProviderPost</h1>
      </div>

      {/* Mission */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-foreground mb-3">Who We Are</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          ProviderPost is a modern classified advertising platform built for independent providers across the United States and Canada. We give providers a clean, fast, and professional space to publish their ads, connect with clients, and manage their business online.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We believe in simplicity, privacy, and giving providers full control over how they present themselves. Every ad on ProviderPost is reviewed by our moderation team before going live, so clients can browse with confidence.
        </p>
      </section>

      {/* Values */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-foreground mb-4">What We Stand For</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              icon: Shield,
              title: "Safety First",
              desc: "Every advertisement is manually reviewed before going live. We maintain strict content standards and act quickly on reports of abuse.",
            },
            {
              icon: CheckCircle,
              title: "Verified Listings",
              desc: "Providers can earn a verified badge by going through our review process, giving clients an extra layer of trust.",
            },
            {
              icon: Users,
              title: "Community Driven",
              desc: "Hobbyist members can leave honest reviews, save favorites, and help surface the best providers in their area.",
            },
            {
              icon: Globe,
              title: "Built for North America",
              desc: "We cover all 50 US states, DC, and all 13 Canadian provinces and territories — one platform for the entire continent.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">
                  <Icon className="h-4 w-4 text-pink-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-foreground mb-4">How It Works</h2>
        <div className="flex flex-col gap-4">
          {[
            { step: "1", title: "Create an Account", desc: "Register as a Provider to post ads, or as a Hobbyist to browse, save favorites, and leave reviews. Registration is free and takes under a minute." },
            { step: "2", title: "Post Your Ad", desc: "Fill in your profile, upload photos, set your rates, and add your contact details. Choose a subscription plan to keep your ad active and visible." },
            { step: "3", title: "Get Approved", desc: "Our moderation team reviews every submission. Most ads are approved within a few hours. You will be notified when your ad is live." },
            { step: "4", title: "Connect with Clients", desc: "Clients browse by location and ethnicity, view your profile, and reach out via WhatsApp, WeChat, or phone — directly, with no middleman." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-400 text-sm font-extrabold text-pink-900">
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-foreground mb-3">Our Office</h2>
        <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground mb-1">ProviderPost</p>
            <p>#254, Preah Monivong Blvd</p>
            <p>Sangkat Chaktomuk, Khan Daun Penh</p>
            <p>Phnom Penh 120207</p>
            <p>Cambodia</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-lg border border-pink-200 bg-pink-50 p-6 text-center">
        <p className="text-base font-bold text-foreground mb-2">Ready to get started?</p>
        <p className="text-sm text-muted-foreground mb-4">Join thousands of providers already posting on ProviderPost.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
            Create Free Account
          </Link>
          <Link href="/browse" className="inline-flex items-center justify-center rounded-lg border border-border bg-card text-foreground px-5 py-2.5 text-sm font-semibold hover:border-pink-300 transition-colors">
            Browse Ads
          </Link>
        </div>
      </section>

    </div>
  )
}
