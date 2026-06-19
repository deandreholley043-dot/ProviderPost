import { HeroSection } from "@/components/home/hero-section"
import { BreedCategories } from "@/components/home/breed-categories"
import { FeaturedListings } from "@/components/home/featured-listings"
import { HowItWorks } from "@/components/home/how-it-works"
import { CtaBanner } from "@/components/home/cta-banner"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BreedCategories />
      <FeaturedListings />
      <HowItWorks />
      <CtaBanner />
    </>
  )
}
