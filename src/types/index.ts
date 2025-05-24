// Basic types for HojaTTop application

export interface Toilet {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  rating: number
  reviewCount: number
  features: ToiletFeatures
  openHours: string
  photos: string[]
  lastUpdated: number // timestamp
}

export interface ToiletFeatures {
  isAccessible: boolean      // accessible for disabled
  hasBabyChanging: boolean   // baby changing table
  hasAblution: boolean       // ritual washing facilities
  isFree: boolean           // free to use
}

export interface Review {
  id: string
  toiletId: string
  userId: string
  userName: string
  rating: number          // overall rating, 1-5
  cleanliness: number     // cleanliness rating, 1-5
  accessibility: number   // accessibility rating, 1-5
  comment: string
  photos: string[]
  createdAt: number      // timestamp
  // New feature mentions for Yandex Taxi style functionality
  featureMentions?: {
    accessibility: boolean
    babyChanging: boolean
    ablution: boolean
    isPaid: boolean
  }
}

export interface User {
  id: string
  name: string
  email?: string
  createdAt: number
  reviewCount: number
  isAnonymous: boolean
}

export interface Filters {
  isAccessible?: boolean
  hasBabyChanging?: boolean
  hasAblution?: boolean
  isFree?: boolean
  minRating?: number
  maxDistance?: number  // in kilometers
}

// Location types
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationWithDistance extends Toilet {
  distance: number  // distance from user in meters
}

// Data loading states
export type DataSource = 'network' | 'cache' | 'none'

export interface DataState<T> {
  data: T | null
  loading: boolean
  error: string | null
  source: DataSource
  lastUpdated: number | null
  isStale: boolean // True if data is from cache and might be outdated
}

// Feature counts for statistics
export interface FeatureCounts {
  accessibilityCount: number
  babyChangingCount: number
  ablutionCount: number
  paidCount: number
  freeCount: number
}