"use client"

import { useState, useMemo } from "react"
import { sampleProviders } from "@/lib/sample-providers"
import { ProviderCard } from "@/components/provider-card"
import { CategoryFilters } from "@/components/category-filters"
import { US_STATES, CA_PROVINCES } from "@/lib/us-states"
import { MapPin, Filter, X, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const cities = useMemo(() => {
    if (!selectedState) return []
    return [...new Set(sampleProviders.filter((p) => p.state === selectedState).map((p) => p.city))].sort()
  }, [selectedState])

  const filtered = useMemo(() => {
    return sampleProviders.filter((p) => {
      const eth = p.ethnicity.toLowerCase()
      const categoryMatch =
        activeCategory === "all" ||
        (activeCategory === "incall"          && (p.category === "incall" || p.category === "both")) ||
        (activeCategory === "verified"        && p.verified) ||
        (activeCategory === "available"       && p.availableNow) ||
        (activeCategory === "ebony"           && eth.includes("ebony")) ||
        (activeCategory === "white"           && eth.includes("white")) ||
        (activeCategory === "latin"           && (eth.includes("latin") || eth.includes("mexican") || eth.includes("colombian") || eth.includes("brazilian") || eth.includes("venezuelan") || eth.includes("salvadorian"))) ||
        (activeCategory === "asian"           && (eth.includes("asian") || eth.includes("chinese") || eth.includes("japanese") || eth.includes("korean") || eth.includes("vietnamese") || eth.includes("thai") || eth.includes("cambodian") || eth.includes("filipina") || eth.includes("indian"))) ||
        (activeCategory === "native-american" && eth.includes("native")) ||
        (activeCategory === "middle-east"     && eth.includes("middle")) ||
        (activeCategory === "mixed"           && eth.includes("mixed")) ||
        (activeCategory === "others"          && eth.includes("other"))
      const stateMatch = !selectedState || p.state === selectedState
      const cityMatch = !selectedCity || p.city === selectedCity
      return categoryMatch && stateMatch && cityMatch
    })
  }, [activeCategory, selectedState, selectedCity])

  const stateCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    sampleProviders.forEach((p) => { map[p.state] = (map[p.state] || 0) + 1 })
    return map
  }, [])

  const statesWithProviders = US_STATES.filter((s) => stateCountMap[s.code])
  const provincesWithProviders = CA_PROVINCES.filter((s) => stateCountMap[s.code])

  function clearFilters() {
    setSelectedState("")
    setSelectedCity("")
    setActiveCategory("all")
  }

  const activeFiltersCount =
    (selectedState ? 1 : 0) + (selectedCity ? 1 : 0) + (activeCategory !== "all" ? 1 : 0)

  const stateName = selectedState ? US_STATES.find((s) => s.code === selectedState)?.name : null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Providers in{" "}
            <span className="text-primary">
              {stateName || "USA & Canada"}
              {selectedCity && `, ${selectedCity}`}
            </span>
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {selectedState
              ? `Browse provider ads in ${stateName}${selectedCity ? `, ${selectedCity}` : ""}.`
              : "Find verified providers across all 50 US states and Canadian provinces."}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedCity("") }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Regions ({sampleProviders.length})</option>
                <optgroup label="🇺🇸 United States">
                  {statesWithProviders.map((s) => (
                    <option key={s.code} value={s.code}>{s.name} ({stateCountMap[s.code]})</option>
                  ))}
                  {statesWithProviders.length === 0 && US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </optgroup>
                <optgroup label="🇨🇦 Canada">
                  {provincesWithProviders.map((s) => (
                    <option key={s.code} value={s.code}>{s.name} ({stateCountMap[s.code]})</option>
                  ))}
                  {provincesWithProviders.length === 0 && CA_PROVINCES.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {selectedState && cities.length > 0 && (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Cities</option>
                {cities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            )}

            <Button variant="outline" size="sm" className="ml-auto sm:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}>
              <Filter className="mr-1.5 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-1.5 h-5 w-5 rounded-full bg-primary p-0 text-[10px]">{activeFiltersCount}</Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                <X className="mr-1 h-4 w-4" /> Clear all
              </Button>
            )}

            <div className="ml-auto hidden items-center gap-1 rounded-md border border-border p-0.5 sm:flex">
              <button onClick={() => setViewMode("grid")} className={`rounded p-1.5 ${viewMode === "grid" ? "bg-muted" : ""}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`rounded p-1.5 ${viewMode === "list" ? "bg-muted" : ""}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={showMobileFilters ? "block" : "hidden sm:block"}>
            <CategoryFilters active={activeCategory} onSelect={setActiveCategory} />
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          {filtered.length} ad{filtered.length !== 1 ? "s" : ""} found
          {stateName && ` in ${stateName}`}{selectedCity && `, ${selectedCity}`}
        </p>

        {filtered.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => <ProviderCard key={p.id} provider={p} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((p) => <ProviderCard key={p.id} provider={p} />)}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <MapPin className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground">No ads found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try adjusting your filters or check back later for new ads in this area.
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button>
          </div>
        )}
      </div>
    </div>
  )
}
