import React from 'react'
import { StyleSheet } from 'react-native'
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps'

interface ToiletMapNativeProps {
  initialRegion?: Region
}

// Центр Ташкента
const DEFAULT_REGION: Region = {
  latitude: 41.2995,
  longitude: 69.2401,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

export default function ToiletMapNative({ initialRegion }: ToiletMapNativeProps) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion || DEFAULT_REGION}
      showsUserLocation={true}
      showsMyLocationButton={false} // Мы сделаем свою кнопку
      showsCompass={false}
    />
  )
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
})