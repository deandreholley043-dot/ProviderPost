"use client"

import { cn } from "@/lib/utils"

const categories = [
  { label: "ALL ADS",         value: "all",              color: "bg-foreground text-background" },
  { label: "INCALL",          value: "incall",           color: "bg-rose-400 text-card" },
  { label: "VERIFIED",        value: "verified",         color: "bg-green-500 text-card" },
  { label: "AVAILABLE NOW",   value: "available",        color: "bg-pink-500 text-card" },
  { label: "EBONY",           value: "ebony",            color: "bg-amber-800 text-card" },
  { label: "WHITE",           value: "white",            color: "bg-rose-200 text-rose-900" },
  { label: "LATIN",           value: "latin",            color: "bg-orange-400 text-card" },
  { label: "ASIAN",           value: "asian",            color: "bg-pink-400 text-card" },
  { label: "NATIVE AMERICAN", value: "native-american",  color: "bg-red-700 text-card" },
  { label: "MIDDLE EAST",     value: "middle-east",      color: "bg-yellow-600 text-card" },
  { label: "MIXED",           value: "mixed",            color: "bg-purple-500 text-card" },
  { label: "OTHERS",          value: "others",           color: "bg-muted text-muted-foreground" },
]

interface CategoryFiltersProps {
  active: string
  onSelect: (value: string) => void
}

export function CategoryFilters({ active, onSelect }: CategoryFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
      <style>{`.scrollbar-none::-webkit-scrollbar { display: none; }`}</style>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold tracking-wide transition-all whitespace-nowrap shrink-0 touch-manipulation",
            active === cat.value
              ? cn(cat.color, "shadow-md scale-105")
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
