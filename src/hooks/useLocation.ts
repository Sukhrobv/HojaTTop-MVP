// Hook for managing user location
import { useState, useEffect, useCallback } from 'react'
import { Coordinates } from '@/types'
import { 
  getCurrentLocation, 
  watchUserLocation, 
  checkLocationServices 
} from '@/services/location'
import { LocationSubscription } from 'expo-location'

interface UseLocationReturn {
  location: Coordinates | null
  loading: boolean
  error: string | null
  refreshLocation: () => Promise<void>
  isLocationEnabled: boolean
}

export function useLocation(options?: {
  watchPosition?: boolean
  distanceInterval?: number
  timeInterval?: number
}): UseLocationReturn {
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)
  const [subscription, setSubscription] = useState<LocationSubscription | null>(null)

  // Fetch current location
  const fetchLocation = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check if location services are enabled
      const enabled = await checkLocationServices()
      setIsLocationEnabled(enabled)
      
      if (!enabled) {
        setError('Геолокация отключена')
        setLoading(false)
        return
      }
      
      // Get current location
      const currentLocation = await getCurrentLocation()
      
      if (currentLocation) {
        setLocation(currentLocation)
      } else {
        setError('Не удалось определить местоположение')
      }
    } catch (err) {
      setError('Ошибка при получении местоположения')
      console.error('Location error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Set up location watching
  useEffect(() => {
    if (options?.watchPosition) {
      const setupWatcher = async () => {
        const locationSubscription = await watchUserLocation(
          (newLocation) => {
            setLocation(newLocation)
          },
          {
            distanceInterval: options.distanceInterval,
            timeInterval: options.timeInterval,
          }
        )
        
        if (locationSubscription) {
          setSubscription(locationSubscription)
        }
      }
      
      setupWatcher()
      
      // Cleanup subscription on unmount
      return () => {
        if (subscription) {
          subscription.remove()
        }
      }
    }
  }, [options?.watchPosition, options?.distanceInterval, options?.timeInterval])

  // Initial location fetch
  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  return {
    location,
    loading,
    error,
    refreshLocation: fetchLocation,
    isLocationEnabled,
  }
}