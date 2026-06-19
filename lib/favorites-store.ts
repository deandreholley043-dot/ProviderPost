const KEY = "providerpost_favorites"

export interface SavedProvider {
  id: string
  name: string
  age: string
  ethnicity: string
  city: string
  state: string
  shortDescription: string
  quickVisit: string
  verified: boolean
  availableNow: boolean
  savedAt: string
}

function load(): SavedProvider[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(items: SavedProvider[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function getFavorites(): SavedProvider[] {
  return load()
}

export function isFavorited(id: string): boolean {
  return load().some((p) => p.id === id)
}

export function addFavorite(provider: Omit<SavedProvider, "savedAt">): void {
  const items = load()
  if (items.some((p) => p.id === provider.id)) return
  save([{ ...provider, savedAt: new Date().toISOString() }, ...items])
}

export function removeFavorite(id: string): void {
  save(load().filter((p) => p.id !== id))
}

export function toggleFavorite(provider: Omit<SavedProvider, "savedAt">): boolean {
  if (isFavorited(provider.id)) {
    removeFavorite(provider.id)
    return false
  } else {
    addFavorite(provider)
    return true
  }
}
