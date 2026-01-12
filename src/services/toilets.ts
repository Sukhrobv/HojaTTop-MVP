// Service for managing toilet data with caching support
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc,
} from 'firebase/firestore'
import { db, COLLECTIONS } from '@/services/firebase'
import { Toilet, LocationWithDistance, Coordinates, Filters, DataSource } from '@/types'
import { calculateDistance } from '@/services/location'
import { ToiletCacheService } from '@/services/cache'

// Get all toilets from Firestore with caching
export async function getAllToilets(forceRefresh: boolean = false): Promise<{
  toilets: Toilet[]
  source: DataSource
}> {
  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const isCacheValid = await ToiletCacheService.isToiletsCacheValid()
      
      if (isCacheValid) {
        const cachedToilets = await ToiletCacheService.getCachedToilets()
        if (cachedToilets) {
          console.log('Using cached toilets data')
          return {
            toilets: cachedToilets,
            source: 'cache'
          }
        }
      }
    }

    // Fetch from network
    console.log('Fetching toilets from network')
    const toiletsSnapshot = await getDocs(collection(db, COLLECTIONS.TOILETS))
    const toilets: Toilet[] = []
    
    toiletsSnapshot.forEach((doc) => {
      const data = doc.data()
      
      // Ensure all required fields exist
      const toilet: Toilet = {
        id: doc.id,
        name: data.name || 'Неизвестно',
        address: data.address || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        features: {
          isAccessible: data.features?.isAccessible || false,
          hasBabyChanging: data.features?.hasBabyChanging || false,
          hasAblution: data.features?.hasAblution || false,
          isFree: data.features?.isFree || false
        },
        openHours: data.openHours || '',
        photos: data.photos || [],
        lastUpdated: data.lastUpdated || Date.now()
      }
      
      toilets.push(toilet)
    })
    
    // Cache the fresh data
    await ToiletCacheService.cacheToilets(toilets)
    
    return {
      toilets,
      source: 'network'
    }
  } catch (error) {
    console.error('Error fetching toilets:', error)
    
    // Fallback to cache if network fails
    const cachedToilets = await ToiletCacheService.getCachedToilets()
    if (cachedToilets) {
      console.log('Network failed, using cached toilets')
      return {
        toilets: cachedToilets,
        source: 'cache'
      }
    }
    
    throw error
  }
}

// Get toilet by ID with caching
export async function getToiletById(toiletId: string, forceRefresh: boolean = false): Promise<{
  toilet: Toilet | null
  source: DataSource
}> {
  try {
    // For individual toilets, we'll get them from the cached collection first
    if (!forceRefresh) {
      const cachedToilets = await ToiletCacheService.getCachedToilets()
      if (cachedToilets) {
        const cachedToilet = cachedToilets.find(toilet => toilet.id === toiletId)
        if (cachedToilet) {
          return {
            toilet: cachedToilet,
            source: 'cache'
          }
        }
      }
    }

    // Fetch from network
    const toiletDoc = await getDoc(doc(db, COLLECTIONS.TOILETS, toiletId))
    
    if (!toiletDoc.exists()) {
      return {
        toilet: null,
        source: 'network'
      }
    }
    
    const toilet = {
      id: toiletDoc.id,
      ...toiletDoc.data()
    } as Toilet

    return {
      toilet,
      source: 'network'
    }
  } catch (error) {
    console.error('Error fetching toilet:', error)
    
    // Fallback to cache
    const cachedToilets = await ToiletCacheService.getCachedToilets()
    if (cachedToilets) {
      const cachedToilet = cachedToilets.find(toilet => toilet.id === toiletId)
      if (cachedToilet) {
        return {
          toilet: cachedToilet,
          source: 'cache'
        }
      }
    }
    
    throw error
  }
}

// Get nearby toilets sorted by distance with caching
export async function getNearbyToilets(
  userLocation: Coordinates,
  maxDistanceKm: number = 5,
  forceRefresh: boolean = false
): Promise<{
  toilets: LocationWithDistance[]
  source: DataSource
}> {
  try {
    const { toilets, source } = await getAllToilets(forceRefresh)
    
    // Calculate distances and filter
    const toiletsWithDistance: LocationWithDistance[] = toilets
      .map(toilet => {
        const distance = calculateDistance(userLocation, {
          latitude: toilet.latitude,
          longitude: toilet.longitude
        })
        
        return {
          ...toilet,
          distance: distance * 1000 // Convert to meters
        }
      })
      .filter(toilet => toilet.distance <= maxDistanceKm * 1000) // Filter by max distance
      .sort((a, b) => a.distance - b.distance) // Sort by distance
    
    return {
      toilets: toiletsWithDistance,
      source
    }
  } catch (error) {
    console.error('Error fetching nearby toilets:', error)
    throw error
  }
}

// Get all toilets without location requirement (for map)
export async function getAllToiletsForMap(forceRefresh: boolean = false): Promise<{
  toilets: LocationWithDistance[]
  source: DataSource
}> {
  try {
    const { toilets, source } = await getAllToilets(forceRefresh)
    
    // Add distance as 0 for all toilets when no user location
    const toiletsWithDistance: LocationWithDistance[] = toilets.map(toilet => ({
      ...toilet,
      distance: 0
    }))
    
    return {
      toilets: toiletsWithDistance,
      source
    }
  } catch (error) {
    console.error('Error fetching toilets for map:', error)
    throw error
  }
}

// Apply filters to toilets
export function applyFilters(
  toilets: LocationWithDistance[],
  filters: Filters
): LocationWithDistance[] {
  return toilets.filter(toilet => {
    // Check if features exist
    if (!toilet.features) return false
    
    // Filter by features
    if (filters.isAccessible && !toilet.features.isAccessible) return false
    if (filters.hasBabyChanging && !toilet.features.hasBabyChanging) return false
    if (filters.hasAblution && !toilet.features.hasAblution) return false
    if (filters.isFree && !toilet.features.isFree) return false
    
    // Filter by rating
    if (filters.minRating && toilet.rating < filters.minRating) return false
    
    // Filter by distance (only if user location is available)
    if (filters.maxDistance && toilet.distance > 0 && toilet.distance > filters.maxDistance * 1000) return false
    
    return true
  })
}

// Add a new toilet (for future feature)
export async function addToilet(toiletData: Omit<Toilet, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.TOILETS), {
      ...toiletData,
      lastUpdated: Date.now()
    })
    
    // Invalidate cache after adding new toilet
    const cachedToilets = await ToiletCacheService.getCachedToilets()
    if (cachedToilets) {
      const newToilet: Toilet = { id: docRef.id, ...toiletData }
      await ToiletCacheService.cacheToilets([...cachedToilets, newToilet])
    }
    
    return docRef.id
  } catch (error) {
    console.error('Error adding toilet:', error)
    throw error
  }
}

// Update toilet rating after new review
export async function updateToiletRating(
  toiletId: string,
  newRating: number,
  newReviewCount: number
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.TOILETS, toiletId), {
      rating: newRating,
      reviewCount: newReviewCount,
      lastUpdated: Date.now()
    })

    // Update cached data
    const cachedToilets = await ToiletCacheService.getCachedToilets()
    if (cachedToilets) {
      const updatedToilets = cachedToilets.map(toilet => 
        toilet.id === toiletId 
          ? { ...toilet, rating: newRating, reviewCount: newReviewCount, lastUpdated: Date.now() }
          : toilet
      )
      await ToiletCacheService.cacheToilets(updatedToilets)
    }
  } catch (error) {
    console.error('Error updating toilet rating:', error)
    throw error
  }
}

// Get toilets for map display (with basic info only) with caching
export async function getToiletsForMap(forceRefresh: boolean = false): Promise<{
  toilets: Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    rating: number
    isFree: boolean
  }>
  source: DataSource
}> {
  try {
    const { toilets, source } = await getAllToilets(forceRefresh)
    
    const mapToilets = toilets.map(toilet => ({
      id: toilet.id,
      name: toilet.name,
      latitude: toilet.latitude,
      longitude: toilet.longitude,
      rating: toilet.rating,
      isFree: toilet.features.isFree
    }))
    
    return {
      toilets: mapToilets,
      source
    }
  } catch (error) {
    console.error('Error fetching toilets for map:', error)
    throw error
  }
}

// Check network connectivity and cache status
export async function getDataStatus(): Promise<{
  hasCache: boolean
  isCacheValid: boolean
  cacheTimestamp: number | null
  toiletsCount: number
}> {
  const hasCache = await ToiletCacheService.getCachedToilets() !== null
  const isCacheValid = await ToiletCacheService.isToiletsCacheValid()
  const cacheTimestamp = await ToiletCacheService.getToiletsCacheTimestamp()
  const cachedToilets = await ToiletCacheService.getCachedToilets()
  
  return {
    hasCache,
    isCacheValid,
    cacheTimestamp,
    toiletsCount: cachedToilets?.length || 0
  }
}