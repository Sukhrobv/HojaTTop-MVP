import React from 'react'
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

// Custom marker component for toilets
const ToiletMarker = ({ 
  toilet, 
  onPress 
}: { 
  toilet: LocationWithDistance
  onPress: () => void 
}) => {
  const markerColor = toilet.features.isFree ? '#4ECDC4' : '#FF6B6B' // Green for free, red for paid
  
  return (
    <Marker
      coordinate={{
        latitude: toilet.latitude,
        longitude: toilet.longitude,
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      style={styles.markerContainer}
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
}

export default function ToiletMapNative({ 
  initialRegion, 
  toilets = [],
  onToiletPress 
}: ToiletMapNativeProps) {
  
  const handleMarkerPress = (toiletId: string) => {
    if (onToiletPress) {
      onToiletPress(toiletId)
    }
  }

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