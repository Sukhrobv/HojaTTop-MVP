// Service for managing toilet data
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit 
} from 'firebase/firestore'
import { db, COLLECTIONS } from '@/services/firebase'
import { Toilet, LocationWithDistance, Coordinates, Filters } from '@/types'
import { calculateDistance } from '@/services/location'

// Get all toilets from Firestore
export async function getAllToilets(): Promise<Toilet[]> {
  try {
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
    
    return toilets
  } catch (error) {
    console.error('Error fetching toilets:', error)
    throw error
  }
}

// Get toilet by ID
export async function getToiletById(toiletId: string): Promise<Toilet | null> {
  try {
    const toiletDoc = await getDoc(doc(db, COLLECTIONS.TOILETS, toiletId))
    
    if (!toiletDoc.exists()) {
      return null
    }
    
    return {
      id: toiletDoc.id,
      ...toiletDoc.data()
    } as Toilet
  } catch (error) {
    console.error('Error fetching toilet:', error)
    throw error
  }
}

// Get nearby toilets sorted by distance
export async function getNearbyToilets(
  userLocation: Coordinates,
  maxDistanceKm: number = 5
): Promise<LocationWithDistance[]> {
  try {
    const allToilets = await getAllToilets()
    
    // Calculate distances and filter
    const toiletsWithDistance: LocationWithDistance[] = allToilets
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
    
    return toiletsWithDistance
  } catch (error) {
    console.error('Error fetching nearby toilets:', error)
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
    if (filters.isFree !== undefined && toilet.features.isFree !== filters.isFree) return false
    
    // Filter by rating
    if (filters.minRating && toilet.rating < filters.minRating) return false
    
    // Filter by distance
    if (filters.maxDistance && toilet.distance > filters.maxDistance * 1000) return false
    
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
  } catch (error) {
    console.error('Error updating toilet rating:', error)
    throw error
  }
}

// Get toilets for map display (with basic info only)
export async function getToiletsForMap(): Promise<
  Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    rating: number
    isFree: boolean
  }>
> {
  try {
    const toiletsSnapshot = await getDocs(collection(db, COLLECTIONS.TOILETS))
    const toilets: Array<{
      id: string
      name: string
      latitude: number
      longitude: number
      rating: number
      isFree: boolean
    }> = []
    
    toiletsSnapshot.forEach((doc) => {
      const data = doc.data()
      toilets.push({
        id: doc.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        rating: data.rating || 0,
        isFree: data.features?.isFree || false
      })
    })
    
    return toilets
  } catch (error) {
    console.error('Error fetching toilets for map:', error)
    throw error
  }
}