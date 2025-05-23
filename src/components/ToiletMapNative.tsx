import React, { useRef, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import MapView, { PROVIDER_GOOGLE, Region, Marker } from 'react-native-maps'
import { LocationWithDistance, Coordinates } from '@/types'
import { Text, View } from 'tamagui'

interface ToiletMapNativeProps {
  initialRegion?: Region
  toilets: LocationWithDistance[]
  onToiletPress: (toiletId: string) => void
  userLocation?: Coordinates | null
}

// Центр Ташкента
const DEFAULT_REGION: Region = {
  latitude: 41.2995,
  longitude: 69.2401,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

export default function ToiletMapNative({ 
  initialRegion, 
  toilets = [], 
  onToiletPress,
  userLocation 
}: ToiletMapNativeProps) {
  const mapRef = useRef<MapView>(null)

  // Filter out invalid toilets
  const validToilets = toilets.filter(toilet => 
    toilet && 
    typeof toilet.latitude === 'number' && 
    typeof toilet.longitude === 'number'
  )

  // Center map on user location when it changes
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000)
    }
  }, [userLocation])

  // Function to animate to specific toilet
  const animateToToilet = (toilet: LocationWithDistance) => {
    if (mapRef.current && toilet.latitude && toilet.longitude) {
      mapRef.current.animateToRegion({
        latitude: toilet.latitude,
        longitude: toilet.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500)
    }
  }

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion || DEFAULT_REGION}
      showsUserLocation={true}
      showsMyLocationButton={false} // We use custom button
      showsCompass={false}
    >
      {/* Toilet markers */}
      {validToilets && validToilets.length > 0 && validToilets.map((toilet) => {
        const isFree = toilet.features?.isFree ?? false
        const markerColor = isFree ? '#4ECDC4' : '#FF6B6B'
        
        return (
          <Marker
            key={toilet.id}
            coordinate={{
              latitude: toilet.latitude,
              longitude: toilet.longitude,
            }}
            title={toilet.name || 'Неизвестно'}
            description={`${toilet.distance < 1000 ? Math.round(toilet.distance) + 'м' : (toilet.distance / 1000).toFixed(1) + 'км'} • ⭐${toilet.rating?.toFixed(1) || '0.0'}`}
            onPress={() => {
              animateToToilet(toilet)
              onToiletPress(toilet.id)
            }}
          >
            {/* Custom marker with toilet icon */}
            <View 
              backgroundColor={markerColor}
              borderRadius="$4"
              padding="$1.5"
              alignItems="center"
              justifyContent="center"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.25}
              shadowRadius={3}
              // Remove elevation prop - use shadowRadius instead for cross-platform shadow
            >
              <Text fontSize={20}>🚽</Text>
            </View>
          </Marker>
        )
      })}
    </MapView>
  )
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
})