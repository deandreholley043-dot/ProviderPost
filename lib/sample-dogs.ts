export interface DogListing {
  id: string
  name: string
  age: string
  breed: string
  location: string
  state: string
  zip: string
  description: string
  shortDescription: string
  photoCount: number
  videoCount: number
  verified: boolean
  availableNow: boolean
  category: "puppy" | "adult" | "rescue" | "breeder"
  gender: "male" | "female"
  price: string
  phone: string
  language: string
  size: string
  color: string
  temperament: string
  postedAt: string
}

export const sampleDogs: DogListing[] = []
