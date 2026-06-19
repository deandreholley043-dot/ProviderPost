"use client"

import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { ZipcodeLookup } from "@/components/zipcode-lookup"
import type { ZipLookupResult } from "@/lib/zipcode-db"

export function HeroSection() {
  const router = useRouter()

  function handleLocationSelect(result: ZipLookupResult) {
    router.push(`/browse?state=${result.state}&city=${encodeURIComponent(result.city)}`)
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-foreground/65" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-12 text-center sm:py-20 lg:px-8 lg:py-32">
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-card sm:text-4xl lg:text-6xl text-balance">
          Browse &amp; Connect with
          <span className="text-pink-400"> Verified </span>
          Providers
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-card/80 sm:text-lg">
          Browse provider ads by location, read real reviews, and post your own ad free.
          Enter your zip code to find providers near you.
        </p>

        {/* Search bar */}
        <div className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <ZipcodeLookup
              placeholder="Enter your zip code or city..."
              onLocationSelect={handleLocationSelect}
              className="w-full [&_input]:h-12 [&_input]:rounded-lg [&_input]:border-0 [&_input]:bg-card [&_input]:shadow-lg [&_input]:focus:ring-pink-400"
            />
          </div>
          <button
            onClick={() => router.push("/browse")}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-pink-400 px-8 font-bold text-foreground shadow-lg transition-colors hover:bg-pink-500"
          >
            <Search className="h-5 w-5" />
            Browse Ads
          </button>
        </div>

        {/* Quick stats */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-card/90">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-card">2,500+</p>
            <p className="text-xs text-card/70">Active Ads</p>
          </div>
          <div className="hidden h-8 w-px bg-card/30 sm:block" />
          <div className="text-center">
            <p className="text-2xl font-extrabold text-card">1,000+</p>
            <p className="text-xs text-card/70">Verified Providers</p>
          </div>
          <div className="hidden h-8 w-px bg-card/30 sm:block" />
          <div className="text-center">
            <p className="text-2xl font-extrabold text-card">50+</p>
            <p className="text-xs text-card/70">States &amp; Provinces</p>
          </div>
          <div className="hidden h-8 w-px bg-card/30 sm:block" />
          <div className="text-center">
            <p className="text-2xl font-extrabold text-card">100%</p>
            <p className="text-xs text-card/70">Free to Post</p>
          </div>
        </div>
      </div>
    </section>
  )
}
