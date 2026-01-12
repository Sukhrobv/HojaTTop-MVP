import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { PROVIDER_GOOGLE, Region, Marker } from 'react-native-maps'
import { Toilet } from 'lucide-react-native'
import { LocationWithDistance } from '@/types'

interface ToiletMapNativeProps {
  initialRegion?: Region
  toilets?: LocationWithDistance[]
  onToiletPress?: (toiletId: string) => void
}

// Центр Ташкента
const DEFAULT_REGION: Region = {
  latitude: 41.2995,
  longitude: 69.2401,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

// Custom marker component for toilets - Optimized
const ToiletMarker = React.memo(({ 
  toilet, 
  onPress 
}: { 
  toilet: LocationWithDistance
  onPress: () => void 
}) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true)
  const markerColor = toilet.features.isFree ? '#4ECDC4' : '#FF6B6B' // Green for free, red for paid
  
  // Stop tracking view changes after initial render to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setTracksViewChanges(false)
    }, 100) // Short delay to ensure render is complete
    return () => clearTimeout(timer)
  }, [])

  // If properties that affect appearance change, re-enable tracking briefly
  useEffect(() => {
    setTracksViewChanges(true)
    const timer = setTimeout(() => {
      setTracksViewChanges(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [markerColor])
  
  return (
    <Marker
      coordinate={{
        latitude: toilet.latitude,
        longitude: toilet.longitude,
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      style={styles.markerContainer}
      tracksViewChanges={tracksViewChanges}
    >
      <View style={[styles.markerBackground, { backgroundColor: markerColor }]}>
        <Toilet 
          size={18} 
          color="white" 
          strokeWidth={2}
        />
      </View>
      
      {/* Small dot at the bottom to show exact location */}
      <View style={[styles.markerDot, { backgroundColor: markerColor }]} />
    </Marker>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.toilet.id === nextProps.toilet.id &&
    prevProps.toilet.latitude === nextProps.toilet.latitude &&
    prevProps.toilet.longitude === nextProps.toilet.longitude &&
    prevProps.toilet.features.isFree === nextProps.toilet.features.isFree
  )
})

export default function ToiletMapNative({ 
  initialRegion, 
  toilets = [],
  onToiletPress 
}: ToiletMapNativeProps) {
  
  const handleMarkerPress = useCallback((toiletId: string) => {
    if (onToiletPress) {
      onToiletPress(toiletId)
    }
  }, [onToiletPress])

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion || DEFAULT_REGION}
      showsUserLocation={true}
      showsMyLocationButton={false} // We'll make our own button
      showsCompass={false}
      toolbarEnabled={false}
      loadingEnabled={true}
      moveOnMarkerPress={false} // Prevent map movement when marker is pressed
    >
      {/* Render toilet markers */}
      {toilets.map((toilet) => (
        <ToiletMarker
          key={toilet.id}
          toilet={toilet}
          onPress={() => handleMarkerPress(toilet.id)}
        />
      ))}
    </MapView>
  )
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBackground: {
    width: 28,
    height: 28,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: -3,
    borderWidth: 1,
    borderColor: 'white',
  },
})