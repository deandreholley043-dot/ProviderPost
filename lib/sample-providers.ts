export interface ProviderListing {
  id: string
  name: string
  age: string
  gender: "male" | "female"
  height: string
  weight: string
  ethnicity: string
  location: string
  city: string
  state: string
  zip: string
  description: string
  shortDescription: string
  photoCount: number
  videoCount: number
  verified: boolean
  availableNow: boolean
  category: "incall" | "both"
  phone: string
  messagingApps: string
  quickVisit: string
  halfHour: string
  hour: string
  overnight: string
  sees: string
  postedAt: string
}

export const sampleProviders: ProviderListing[] = []
