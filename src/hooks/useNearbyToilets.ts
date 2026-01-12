// Hook for fetching nearby toilets with caching support
import { useState, useEffect, useCallback } from 'react'
import { LocationWithDistance, Coordinates, Filters, DataSource, DataState } from '@/types'
import { getNearbyToilets, getAllToiletsForMap, applyFilters, getDataStatus } from '@/services/toilets'

interface UseNearbyToiletsReturn {
  toilets: LocationWithDistance[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  forceRefresh: () => Promise<void>
  applyToiletFilters: (filters: Filters) => void
  filteredToilets: LocationWithDistance[]
  dataSource: DataSource
  isStale: boolean
  lastUpdated: number | null
  cacheInfo: {
    hasCache: boolean
    toiletsCount: number
  } | null
  activeFilters: Filters
}

export function useNearbyToilets(
  userLocation: Coordinates | null,
  maxDistanceKm: number = 5
): UseNearbyToiletsReturn {
  const [state, setState] = useState<DataState<LocationWithDistance[]>>({
    data: [],
    loading: false,
    error: null,
    source: 'none',
    lastUpdated: null,
    isStale: false
  })
  
  const [filteredToilets, setFilteredToilets] = useState<LocationWithDistance[]>([])
  const [activeFilters, setActiveFilters] = useState<Filters>({})
  const [cacheInfo, setCacheInfo] = useState<{
    hasCache: boolean
    toiletsCount: number
  } | null>(null)

  // Get cache information
  const updateCacheInfo = useCallback(async () => {
    try {
      const status = await getDataStatus()
      setCacheInfo({
        hasCache: status.hasCache,
        toiletsCount: status.toiletsCount
      })
    } catch (error) {
      console.error('Error getting cache info:', error)
    }
  }, [])

  // Fetch toilets
  const fetchToilets = useCallback(async (forceRefresh: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      let result: { toilets: LocationWithDistance[], source: DataSource }

      if (userLocation) {
        // Get nearby toilets with user location
        result = await getNearbyToilets(userLocation, maxDistanceKm, forceRefresh)
      } else {
        // Get all toilets for map display (without location filtering)
        result = await getAllToiletsForMap(forceRefresh)
      }

      const { toilets, source } = result
      const now = Date.now()
      
      setState({
        data: toilets,
        loading: false,
        error: null,
        source,
        lastUpdated: now,
        isStale: source === 'cache' && !forceRefresh
      })

      // Apply current filters to new data
      const filtered = applyFilters(toilets, activeFilters)
      setFilteredToilets(filtered)

      // Update cache info
      await updateCacheInfo()

    } catch (err) {
      const errorMessage = userLocation 
        ? 'Не удалось загрузить данные о туалетах'
        : 'Не удалось загрузить туалеты'
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      
      console.error('Error fetching toilets:', err)
    }
  }, [userLocation, maxDistanceKm, activeFilters, updateCacheInfo])

  // Apply filters to toilets
  const applyToiletFilters = useCallback((filters: Filters) => {
    setActiveFilters(filters)
    if (state.data) {
      const filtered = applyFilters(state.data, filters)
      setFilteredToilets(filtered)
    }
  }, [state.data])

  // Regular refresh (uses cache if valid)
  const refresh = useCallback(() => fetchToilets(false), [fetchToilets])

  // Force refresh (bypasses cache)
  const forceRefresh = useCallback(() => fetchToilets(true), [fetchToilets])

  // Initial load and when location changes
  useEffect(() => {
    fetchToilets(false)
  }, [fetchToilets])

  // Update cache info on mount
  useEffect(() => {
    updateCacheInfo()
  }, [updateCacheInfo])

  return {
    toilets: state.data || [],
    loading: state.loading,
    error: state.error,
    refresh,
    forceRefresh,
    applyToiletFilters,
    filteredToilets,
    dataSource: state.source,
    isStale: state.isStale,
    lastUpdated: state.lastUpdated,
    cacheInfo,
    activeFilters,
  }
}