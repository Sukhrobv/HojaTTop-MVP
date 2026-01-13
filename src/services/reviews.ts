// Service for managing reviews with feature counting support
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy,
  limit,
  doc,
  updateDoc,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { db, COLLECTIONS } from '@/services/firebase'
import { Review, DataSource, FeatureCounts } from '@/types'
import { ReviewCacheService } from '@/services/cache'
import { updateToiletRating } from '@/services/toilets'

// Get all reviews for a specific toilet with caching
export async function getReviewsForToilet(
  toiletId: string, 
  forceRefresh: boolean = false
): Promise<{
  reviews: Review[]
  source: DataSource
}> {
  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedReviews = await ReviewCacheService.getCachedReviewsForToilet(toiletId)
      if (cachedReviews.length > 0) {
        console.log('Using cached reviews for toilet:', toiletId)
        return {
          reviews: cachedReviews,
          source: 'cache'
        }
      }
    }

    // Fetch from network
    console.log('Fetching reviews from network for toilet:', toiletId)
    
    let reviewsSnapshot
    try {
      // Try with orderBy first (requires index)
      const reviewsQuery = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('toiletId', '==', toiletId),
        orderBy('createdAt', 'desc')
      )
      reviewsSnapshot = await getDocs(reviewsQuery)
    } catch (indexError) {
      console.log('Ordered query failed, trying simple query:', indexError)
      // Fallback to simple query without ordering (no index required)
      const simpleQuery = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('toiletId', '==', toiletId)
      )
      reviewsSnapshot = await getDocs(simpleQuery)
    }
    const reviews: Review[] = []
    
    reviewsSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as DocumentData
      const review: Review = {
        id: doc.id,
        toiletId: data.toiletId,
        userId: data.userId || 'anonymous',
        userName: data.userName || 'Анонимный пользователь',
        rating: data.rating || 0,
        cleanliness: data.cleanliness || 0,
        accessibility: data.accessibility || 0,
        comment: data.comment || '',
        photos: data.photos || [],
        createdAt: data.createdAt || Date.now(),
        // Include feature mentions if available
        featureMentions: data.featureMentions || undefined
      }
      reviews.push(review)
    })
    
    // Sort manually by date (newest first) in case Firestore didn't sort
    reviews.sort((a, b) => b.createdAt - a.createdAt)
    
    // Update cache with new reviews (replace all reviews for this toilet)
    await ReviewCacheService.updateToiletReviewsInCache(toiletId, reviews)
    
    return {
      reviews,
      source: 'network'
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    
    // Check if it's a Firebase index error
    if (error instanceof Error && error.message.includes('index')) {
      console.log('Firebase index missing, using cache as fallback')
    }
    
    // Fallback to cache if network fails
    const cachedReviews = await ReviewCacheService.getCachedReviewsForToilet(toiletId)
    if (cachedReviews.length > 0) {
      console.log('Network failed, using cached reviews for toilet:', toiletId)
      return {
        reviews: cachedReviews,
        source: 'cache'
      }
    }
    
    // If no cache available, return empty array instead of throwing
    console.log('No reviews available, returning empty array')
    return {
      reviews: [],
      source: 'none'
    }
  }
}

// Add a new review with feature mentions support
export async function addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<{
  reviewId: string
  success: boolean
}> {
  try {
    const newReview = {
      ...reviewData,
      createdAt: Date.now()
    }
    
    // Add to Firebase
    const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), newReview)
    
    // Create full review object
    const fullReview: Review = {
      id: docRef.id,
      ...newReview
    }
    
    // Add to cache
    await ReviewCacheService.addReviewToCache(fullReview)
    
    // Update toilet rating
    await updateToiletAverageRating(reviewData.toiletId)
    
    console.log('Review added successfully:', docRef.id)
    
    return {
      reviewId: docRef.id,
      success: true
    }
  } catch (error) {
    console.error('Error adding review:', error)
    
    // For offline support, we could queue the review to be synced later
    // For now, we'll just return an error
    return {
      reviewId: '',
      success: false
    }
  }
}

// Calculate and update toilet's average rating
async function updateToiletAverageRating(toiletId: string): Promise<void> {
  try {
    const { reviews } = await getReviewsForToilet(toiletId, true) // Force refresh to get latest
    
    if (reviews.length === 0) return
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10 // Round to 1 decimal
    
    // Update toilet with new rating
    await updateToiletRating(toiletId, averageRating, reviews.length)
    
    console.log(`Updated toilet ${toiletId} rating to ${averageRating} (${reviews.length} reviews)`)
  } catch (error) {
    console.error('Error updating toilet rating:', error)
  }
}

// Calculate feature counts from reviews (Yandex Taxi style)
export async function getFeatureCounts(toiletId: string): Promise<FeatureCounts> {
  try {
    const { reviews } = await getReviewsForToilet(toiletId)
    
    const counts: FeatureCounts = {
      accessibilityCount: 0,
      babyChangingCount: 0,
      ablutionCount: 0,
      paidCount: 0,
      freeCount: 0
    }
    
    reviews.forEach(review => {
      if (review.featureMentions) {
        if (review.featureMentions.accessibility) counts.accessibilityCount++
        if (review.featureMentions.babyChanging) counts.babyChangingCount++
        if (review.featureMentions.ablution) counts.ablutionCount++
        if (review.featureMentions.isPaid) counts.paidCount++
        else counts.freeCount++
      }
    })
    
    return counts
  } catch (error) {
    console.error('Error calculating feature counts:', error)
    return {
      accessibilityCount: 0,
      babyChangingCount: 0,
      ablutionCount: 0,
      paidCount: 0,
      freeCount: 0
    }
  }
}

// Get recent reviews across all toilets (for feed/dashboard)
export async function getRecentReviews(
  limitCount: number = 10,
  forceRefresh: boolean = false
): Promise<{
  reviews: Review[]
  source: DataSource
}> {
  try {
    // For recent reviews, we'll primarily fetch from network
    // Cache is used as fallback only
    
    if (!forceRefresh) {
      const allCachedReviews = await ReviewCacheService.getCachedReviews()
      if (allCachedReviews && allCachedReviews.length > 0) {
        const recentCached = allCachedReviews
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, limitCount)
        
        return {
          reviews: recentCached,
          source: 'cache'
        }
      }
    }

    // Fetch from network
    const reviewsQuery = query(
      collection(db, COLLECTIONS.REVIEWS),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const reviewsSnapshot = await getDocs(reviewsQuery)
    const reviews: Review[] = []
    
    reviewsSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as DocumentData
      reviews.push({
        id: doc.id,
        toiletId: data.toiletId,
        userId: data.userId || 'anonymous',
        userName: data.userName || 'Анонимный пользователь',
        rating: data.rating || 0,
        cleanliness: data.cleanliness || 0,
        accessibility: data.accessibility || 0,
        comment: data.comment || '',
        photos: data.photos || [],
        createdAt: data.createdAt || Date.now(),
        featureMentions: data.featureMentions || undefined
      } as Review)
    })
    
    return {
      reviews,
      source: 'network'
    }
  } catch (error) {
    console.error('Error fetching recent reviews:', error)
    
    // Fallback to cache
    const allCachedReviews = await ReviewCacheService.getCachedReviews()
    if (allCachedReviews && allCachedReviews.length > 0) {
      const recentCached = allCachedReviews
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limitCount)
      
      return {
        reviews: recentCached,
        source: 'cache'
      }
    }
    
    throw error
  }
}

// Get review statistics for a toilet with feature counts
export async function getReviewStats(toiletId: string): Promise<{
  averageRating: number
  totalReviews: number
  ratingDistribution: { [key: number]: number } // 1-5 stars count
  averageCleanliness: number
  averageAccessibility: number
}> {
  try {
    const { reviews } = await getReviewsForToilet(toiletId)
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        averageCleanliness: 0,
        averageAccessibility: 0
      }
    }
    
    // Calculate stats
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const totalCleanliness = reviews.reduce((sum, review) => sum + (review.cleanliness || 0), 0)
    const totalAccessibility = reviews.reduce((sum, review) => sum + (review.accessibility || 0), 0)
    
    const averageRating = totalRating / reviews.length
    const averageCleanliness = totalCleanliness / reviews.length
    const averageAccessibility = totalAccessibility / reviews.length
    
    // Rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach(review => {
      const rating = Math.round(review.rating)
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating as keyof typeof ratingDistribution]++
      }
    })
    
    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
      averageCleanliness: Math.round(averageCleanliness * 10) / 10,
      averageAccessibility: Math.round(averageAccessibility * 10) / 10
    }
  } catch (error) {
    console.error('Error calculating review stats:', error)
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      averageCleanliness: 0,
      averageAccessibility: 0
    }
  }
}

// Validate review data before submission
export function validateReview(reviewData: Partial<Review>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!reviewData.toiletId) {
    errors.push('ID туалета обязателен')
  }
  
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push('Общая оценка должна быть от 1 до 5')
  }
  
  if (reviewData.cleanliness && (reviewData.cleanliness < 1 || reviewData.cleanliness > 5)) {
    errors.push('Оценка чистоты должна быть от 1 до 5')
  }
  
  if (reviewData.accessibility && (reviewData.accessibility < 1 || reviewData.accessibility > 5)) {
    errors.push('Оценка доступности должна быть от 1 до 5')
  }
  
  if (reviewData.comment && reviewData.comment.length > 500) {
    errors.push('Комментарий не должен превышать 500 символов')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
