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