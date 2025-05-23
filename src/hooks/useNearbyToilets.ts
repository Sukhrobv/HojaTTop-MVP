// Hook for fetching nearby toilets
import { useState, useEffect, useCallback } from 'react'
import { LocationWithDistance, Coordinates, Filters } from '@/types'
import { getNearbyToilets, applyFilters, getAllToilets } from '@/services/toilets'
import { calculateDistance } from '@/services/location'

interface UseNearbyToiletsReturn {
  toilets: LocationWithDistance[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  applyToiletFilters: (filters: Filters) => void
  filteredToilets: LocationWithDistance[]
}

export function useNearbyToilets(
  userLocation: Coordinates | null,
  maxDistanceKm: number = 5
): UseNearbyToiletsReturn {
  const [toilets, setToilets] = useState<LocationWithDistance[]>([])
  const [filteredToilets, setFilteredToilets] = useState<LocationWithDistance[]>([])
  const [loading, setLoading] = useState(true) // Start with loading true
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Filters>({})

  // Fetch toilets - if no location, get all toilets
  const fetchToilets = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let toiletsData: LocationWithDistance[]
      
      if (userLocation) {
        // If we have location, get nearby toilets with distance
        toiletsData = await getNearbyToilets(userLocation, maxDistanceKm)
      } else {
        // If no location, get all toilets without distance filtering
        const allToilets = await getAllToilets()
        toiletsData = allToilets.map(toilet => ({
          ...toilet,
          distance: 0 // Default distance when no location
        }))
      }
      
      setToilets(toiletsData)
      
      // Apply current filters to new data
      const filtered = applyFilters(toiletsData, activeFilters)
      setFilteredToilets(filtered)
    } catch (err) {
      setError('Не удалось загрузить данные о туалетах')
      console.error('Error fetching toilets:', err)
    } finally {
      setLoading(false)
    }
  }, [userLocation, maxDistanceKm, activeFilters])

  // Apply filters to toilets
  const applyToiletFilters = useCallback((filters: Filters) => {
    setActiveFilters(filters)
    const filtered = applyFilters(toilets, filters)
    setFilteredToilets(filtered)
  }, [toilets])

  // Initial load - always fetch toilets, even without location
  useEffect(() => {
    fetchToilets()
  }, [fetchToilets])

  return {
    toilets,
    loading,
    error,
    refresh: fetchToilets,
    applyToiletFilters,
    filteredToilets,
  }
}