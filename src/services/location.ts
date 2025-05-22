// Location service for HojaTTop
import * as Location from 'expo-location'
import { Alert } from 'react-native'
import { Coordinates } from '@/types'

// Constants
const EARTH_RADIUS_KM = 6371 // Earth's radius in kilometers
const DEFAULT_LOCATION: Coordinates = {
  latitude: 41.2995, // Tashkent center
  longitude: 69.2401
}

// Get current user location
export async function getCurrentLocation(): Promise<Coordinates | null> {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync()
    
    if (status !== 'granted') {
      Alert.alert(
        'Разрешение не получено',
        'Для показа ближайших туалетов нужно разрешение на определение местоположения',
        [{ text: 'OK' }]
      )
      return null
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }
  } catch (error) {
    console.error('Error getting location:', error)
    Alert.alert(
      'Ошибка геолокации',
      'Не удалось определить местоположение. Используется центр Ташкента.',
      [{ text: 'OK' }]
    )
    return DEFAULT_LOCATION
  }
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const lat1Rad = toRadians(coord1.latitude)
  const lat2Rad = toRadians(coord2.latitude)
  const deltaLatRad = toRadians(coord2.latitude - coord1.latitude)
  const deltaLonRad = toRadians(coord2.longitude - coord1.longitude)

  const a = 
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = EARTH_RADIUS_KM * c

  return distance
}

// Convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    // Show in meters if less than 1km
    return `${Math.round(distanceKm * 1000)}м`
  } else {
    // Show in kilometers with 1 decimal
    return `${distanceKm.toFixed(1)}км`
  }
}

// Check if location services are enabled
export async function checkLocationServices(): Promise<boolean> {
  const enabled = await Location.hasServicesEnabledAsync()
  
  if (!enabled) {
    Alert.alert(
      'Геолокация отключена',
      'Включите геолокацию в настройках устройства для определения ближайших туалетов',
      [{ text: 'OK' }]
    )
  }
  
  return enabled
}

// Watch user location changes
export async function watchUserLocation(
  callback: (location: Coordinates) => void,
  options?: {
    distanceInterval?: number // Minimum distance in meters
    timeInterval?: number // Minimum time in milliseconds
  }
) {
  const { status } = await Location.requestForegroundPermissionsAsync()
  
  if (status !== 'granted') {
    return null
  }

  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: options?.distanceInterval || 10, // Update every 10 meters
      timeInterval: options?.timeInterval || 5000, // Update every 5 seconds
    },
    (location) => {
      callback({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    }
  )
}

// Get region for map view
export function getMapRegion(center: Coordinates, radiusKm: number = 2) {
  const latitudeDelta = radiusKm / 111 // 1 degree latitude ≈ 111km
  const longitudeDelta = radiusKm / (111 * Math.cos(toRadians(center.latitude)))

  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta,
    longitudeDelta,
  }
}