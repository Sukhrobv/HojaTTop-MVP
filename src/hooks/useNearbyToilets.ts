// Hook for fetching nearby toilets
import { useState, useEffect, useCallback } from 'react'
import { LocationWithDistance, Coordinates, Filters } from '@/types'
import { getNearbyToilets, applyFilters } from '@/services/toilets'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Filters>({})

  // Fetch nearby toilets
  const fetchToilets = useCallback(async () => {
    if (!userLocation) {
      setError('Местоположение не определено')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const nearbyToilets = await getNearbyToilets(userLocation, maxDistanceKm)
      setToilets(nearbyToilets)
      
      // Apply current filters to new data
      const filtered = applyFilters(nearbyToilets, activeFilters)
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

  // Fetch toilets when location changes
  useEffect(() => {
    if (userLocation) {
      fetchToilets()
    }
  }, [userLocation, fetchToilets])

  return {
    toilets,
    loading,
    error,
    refresh: fetchToilets,
    applyToiletFilters,
    filteredToilets,
  }
}