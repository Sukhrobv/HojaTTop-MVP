// Hook for managing toilet reviews
import { useState, useEffect, useCallback } from 'react'
import { Review, DataSource, DataState } from '@/types'
import { getReviewsForToilet, addReview, getReviewStats, validateReview } from '@/services/reviews'

interface UseReviewsReturn {
  reviews: Review[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  forceRefresh: () => Promise<void>
  addNewReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => Promise<boolean>
  dataSource: DataSource
  isStale: boolean
  lastUpdated: number | null
  stats: {
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
    averageCleanliness: number
    averageAccessibility: number
  } | null
}

export function useReviews(toiletId: string): UseReviewsReturn {
  const [state, setState] = useState<DataState<Review[]>>({
    data: [],
    loading: false,
    error: null,
    source: 'none',
    lastUpdated: null,
    isStale: false
  })
  
  const [stats, setStats] = useState<{
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
    averageCleanliness: number
    averageAccessibility: number
  } | null>(null)

  // Fetch reviews for toilet
  const fetchReviews = useCallback(async (forceRefresh: boolean = false) => {
    if (!toiletId) return
    
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { reviews, source } = await getReviewsForToilet(toiletId, forceRefresh)
      const now = Date.now()
      
      setState({
        data: reviews,
        loading: false,
        error: null,
        source,
        lastUpdated: now,
        isStale: source === 'cache' && !forceRefresh
      })

      // Update stats
      const reviewStats = await getReviewStats(toiletId)
      setStats(reviewStats)

    } catch (err) {
      // More specific error handling
      let errorMessage = 'Не удалось загрузить отзывы'
      
      if (err instanceof Error) {
        if (err.message.includes('index')) {
          errorMessage = 'Данные временно недоступны'
        } else if (err.message.includes('network')) {
          errorMessage = 'Проверьте интернет-соединение'
        }
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      console.error('Error fetching reviews:', err)
    }
  }, [toiletId])

  // Add new review
  const addNewReview = useCallback(async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      // Validate review data
      const validation = validateReview(reviewData)
      if (!validation.isValid) {
        setState(prev => ({
          ...prev,
          error: validation.errors.join(', ')
        }))
        return false
      }

      // Add review
      const { success, reviewId } = await addReview(reviewData)
      
      if (success) {
        console.log('Review added, refreshing data...')
        
        // Force refresh to get updated data from network
        await fetchReviews(true)
        
        // Also update stats immediately
        const newStats = await getReviewStats(toiletId)
        setStats(newStats)
        
        console.log('Data refreshed after adding review')
        return true
      } else {
        setState(prev => ({
          ...prev,
          error: 'Не удалось добавить отзыв'
        }))
        return false
      }
    } catch (error) {
      console.error('Error adding review:', error)
      setState(prev => ({
        ...prev,
        error: 'Ошибка при добавлении отзыва'
      }))
      return false
    }
  }, [toiletId, fetchReviews]) // Add fetchReviews to dependencies

  // Regular refresh (uses cache if valid)
  const refresh = useCallback(() => fetchReviews(false), [fetchReviews])

  // Force refresh (bypasses cache)
  const forceRefresh = useCallback(() => fetchReviews(true), [fetchReviews])

  // Load reviews when toiletId changes
  useEffect(() => {
    if (toiletId) {
      fetchReviews(false)
    }
  }, [toiletId, fetchReviews])

  return {
    reviews: state.data || [],
    loading: state.loading,
    error: state.error,
    refresh,
    forceRefresh,
    addNewReview,
    dataSource: state.source,
    isStale: state.isStale,
    lastUpdated: state.lastUpdated,
    stats,
  }
}