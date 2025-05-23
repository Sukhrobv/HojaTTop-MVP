// Cache service for offline data storage
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Toilet, Review } from '@/types'

// Cache keys
const CACHE_KEYS = {
  TOILETS: 'toilets_cache',
  REVIEWS: 'reviews_cache',
  LAST_UPDATE: 'last_update_timestamp',
  USER_LOCATION: 'user_location_cache'
} as const

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000

export interface CacheData<T> {
  data: T
  timestamp: number
  version: string
}

// Generic cache operations
export class CacheService {
  
  // Save data to cache with timestamp
  static async setCache<T>(key: string, data: T): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        version: '1.0' // For future cache migrations
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheData))
      console.log(`Cache saved for key: ${key}`)
    } catch (error) {
      console.error('Error saving to cache:', error)
    }
  }

  // Get data from cache
  static async getCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await AsyncStorage.getItem(key)
      
      if (!cachedData) {
        return null
      }

      const parsedData: CacheData<T> = JSON.parse(cachedData)
      return parsedData.data
    } catch (error) {
      console.error('Error reading from cache:', error)
      return null
    }
  }

  // Check if cache is valid (not expired)
  static async isCacheValid(key: string): Promise<boolean> {
    try {
      const cachedData = await AsyncStorage.getItem(key)
      
      if (!cachedData) {
        return false
      }

      const parsedData: CacheData<any> = JSON.parse(cachedData)
      const isExpired = Date.now() - parsedData.timestamp > CACHE_EXPIRATION_TIME
      
      return !isExpired
    } catch (error) {
      console.error('Error checking cache validity:', error)
      return false
    }
  }

  // Get cache timestamp
  static async getCacheTimestamp(key: string): Promise<number | null> {
    try {
      const cachedData = await AsyncStorage.getItem(key)
      
      if (!cachedData) {
        return null
      }

      const parsedData: CacheData<any> = JSON.parse(cachedData)
      return parsedData.timestamp
    } catch (error) {
      console.error('Error getting cache timestamp:', error)
      return null
    }
  }

  // Clear specific cache
  static async clearCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
      console.log(`Cache cleared for key: ${key}`)
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  // Clear all app cache
  static async clearAllCache(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS)
      await AsyncStorage.multiRemove(keys)
      console.log('All cache cleared')
    } catch (error) {
      console.error('Error clearing all cache:', error)
    }
  }

  // Get cache size information
  static async getCacheInfo(): Promise<{
    toiletsCount: number
    reviewsCount: number
    lastUpdate: number | null
    isValid: boolean
  }> {
    try {
      const toilets = await this.getCache<Toilet[]>(CACHE_KEYS.TOILETS)
      const reviews = await this.getCache<Review[]>(CACHE_KEYS.REVIEWS)
      const lastUpdate = await this.getCacheTimestamp(CACHE_KEYS.TOILETS)
      const isValid = await this.isCacheValid(CACHE_KEYS.TOILETS)

      return {
        toiletsCount: toilets?.length || 0,
        reviewsCount: reviews?.length || 0,
        lastUpdate,
        isValid
      }
    } catch (error) {
      console.error('Error getting cache info:', error)
      return {
        toiletsCount: 0,
        reviewsCount: 0,
        lastUpdate: null,
        isValid: false
      }
    }
  }
}

// Specialized toilet cache operations
export class ToiletCacheService extends CacheService {
  
  // Save toilets to cache
  static async cacheToilets(toilets: Toilet[]): Promise<void> {
    await this.setCache(CACHE_KEYS.TOILETS, toilets)
  }

  // Get cached toilets
  static async getCachedToilets(): Promise<Toilet[] | null> {
    return await this.getCache<Toilet[]>(CACHE_KEYS.TOILETS)
  }

  // Check if toilets cache is valid
  static async isToiletsCacheValid(): Promise<boolean> {
    return await this.isCacheValid(CACHE_KEYS.TOILETS)
  }

  // Get toilets cache timestamp
  static async getToiletsCacheTimestamp(): Promise<number | null> {
    return await this.getCacheTimestamp(CACHE_KEYS.TOILETS)
  }
}

// Specialized review cache operations  
export class ReviewCacheService extends CacheService {
  
  // Save reviews to cache
  static async cacheReviews(reviews: Review[]): Promise<void> {
    await this.setCache(CACHE_KEYS.REVIEWS, reviews)
  }

  // Get cached reviews
  static async getCachedReviews(): Promise<Review[] | null> {
    return await this.getCache<Review[]>(CACHE_KEYS.REVIEWS)
  }

  // Get cached reviews for specific toilet
  static async getCachedReviewsForToilet(toiletId: string): Promise<Review[]> {
    const allReviews = await this.getCachedReviews()
    return allReviews?.filter(review => review.toiletId === toiletId) || []
  }

  // Add review to cache
  static async addReviewToCache(review: Review): Promise<void> {
    const cachedReviews = await this.getCachedReviews() || []
    const updatedReviews = [...cachedReviews, review]
    await this.cacheReviews(updatedReviews)
  }
}

export { CACHE_KEYS }