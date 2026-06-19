"use client"

import { useState, useRef, useEffect } from "react"
import { MapPin, Search, X, Loader2 } from "lucide-react"
import { lookupZip, searchLocations, type ZipLookupResult } from "@/lib/zipcode-db"
import { getStateName } from "@/lib/us-states"

interface ZipcodeLookupProps {
  onLocationSelect?: (result: ZipLookupResult) => void
  placeholder?: string
  className?: string
  size?: "sm" | "md"
}

export function ZipcodeLookup({
  onLocationSelect,
  placeholder = "Zip code, postal code, or city...",
  className = "",
  size = "md",
}: ZipcodeLookupProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ZipLookupResult[]>([])
  const [selected, setSelected] = useState<ZipLookupResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleInputChange(value: string) {
    setQuery(value)
    setSelected(null)

    if (!value.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsSearching(true)

    // Check if it's a zip code (all digits)
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length === 5) {
      const zipResult = lookupZip(cleaned)
      if (zipResult) {
        setResults([zipResult])
        setIsOpen(true)
        setIsSearching(false)
        return
      }
    }

    // Search by city name or partial zip
    const searchResults = searchLocations(value, 8)
    setResults(searchResults)
    setIsOpen(searchResults.length > 0)
    setIsSearching(false)
  }

  function handleSelect(result: ZipLookupResult) {
    setSelected(result)
    setQuery(`${result.city}, ${result.state} ${result.zip}`)
    setIsOpen(false)
    onLocationSelect?.(result)
  }

  function handleClear() {
    setQuery("")
    setSelected(null)
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const h = size === "sm" ? "h-9" : "h-11"
  const text = size === "sm" ? "text-sm" : "text-sm"

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`${h} w-full rounded-lg border border-input bg-background ${size === "sm" ? "pl-9 pr-8" : "pl-10 pr-10"} ${text} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {query && !isSearching && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selected badge */}
      {selected && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            <MapPin className="h-3 w-3" />
            {selected.city}, {getStateName(selected.state)} {selected.zip}
          </span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
          {results.map((r, i) => (
            <button
              key={`${r.zip}-${i}`}
              onClick={() => handleSelect(r)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium text-card-foreground">
                  {r.city}, {getStateName(r.state)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ZIP: {r.zip} &middot; {r.state}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 3 && results.length === 0 && !isSearching && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card p-4 text-center shadow-lg">
          <Search className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="mt-1.5 text-sm text-muted-foreground">
            No results found for &quot;{query}&quot;
          </p>
          <p className="text-xs text-muted-foreground">
            Try a different zip code or city name
          </p>
        </div>
      )}
    </div>
  )
}
