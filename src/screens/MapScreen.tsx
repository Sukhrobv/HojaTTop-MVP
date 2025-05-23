import React, { useState } from 'react'
import { YStack, XStack, Text, View, Spinner } from 'tamagui'
import { Pressable, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/navigation'
import { useNearbyToilets } from '@/hooks/useNearbyToilets'
import { getCurrentLocation, formatDistance, getMapRegion } from '@/services/location'
import { Coordinates } from '@/types'
import ToiletMapNative from '@components/ToiletMapNative'

const FilterIcon = () => <Text fontSize={20}>🔍</Text>
const LocationIcon = () => <Text fontSize={20}>📍</Text>

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>

export default function MapScreen() {
  const navigation = useNavigation<NavigationProp>()
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showToiletsList, setShowToiletsList] = useState(false)
  
  const { 
    filteredToilets, 
    loading: toiletsLoading, 
    error,
    refresh 
  } = useNearbyToilets(location, 50) // 50km = show all toilets

  const handleToiletPress = (toiletId: string) => {
    navigation.navigate('ToiletDetail', { toiletId })
  }

  const handleFilterPress = () => {
    navigation.navigate('Filters')
  }

  const handleMyLocationPress = async () => {
    setLocationLoading(true)
    try {
      const currentLocation = await getCurrentLocation()
      if (currentLocation) {
        setLocation(currentLocation)
      }
    } finally {
      setLocationLoading(false)
    }
  }

  const mapRegion = location ? getMapRegion(location, 2) : undefined

  return (
    <YStack flex={1} backgroundColor="$background">
      <StatusBar style="light" />
      
      {/* Header - lower padding */}
      <XStack 
        backgroundColor="#4ECDC4" 
        paddingTop="$3" 
        paddingBottom="$3" 
        paddingHorizontal="$4"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="white" fontSize={24} fontWeight="bold">
          HojaTTop
        </Text>
        <XStack space="$3" alignItems="center">
          <Pressable onPress={() => setShowToiletsList(!showToiletsList)}>
            <Text fontSize={20}>📋</Text>
          </Pressable>
          <Pressable onPress={handleFilterPress}>
            <FilterIcon />
          </Pressable>
        </XStack>
      </XStack>

      {/* Map Container */}
      <View flex={1} position="relative">
        {toiletsLoading ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Spinner size="large" color="#4ECDC4" />
            <Text marginTop="$3" color="#757575">Загрузка туалетов...</Text>
          </YStack>
        ) : error ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text fontSize={18} color="#757575" marginBottom="$4">{error}</Text>
            <Pressable onPress={refresh}>
              <Text color="#4ECDC4" textDecorationLine="underline">
                Попробовать снова
              </Text>
            </Pressable>
          </YStack>
        ) : (
          <>
            <ToiletMapNative 
              initialRegion={mapRegion}
              toilets={filteredToilets}
              onToiletPress={handleToiletPress}
            />

            {/* Legend */}
            <View style={{
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 8,
              padding: 12,
            }}>
              <Text fontSize={12} fontWeight="bold" marginBottom="$2">Легенда:</Text>
              <XStack alignItems="center" marginBottom="$1">
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ECDC4', marginRight: 8 }} />
                <Text fontSize={10}>Бесплатно</Text>
              </XStack>
              <XStack alignItems="center">
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF6B6B', marginRight: 8 }} />
                <Text fontSize={10}>Платно</Text>
              </XStack>
            </View>

            {/* Toilets List (conditional) */}
            {showToiletsList && (
              <ScrollView 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  maxHeight: 200,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <XStack padding="$3" space="$3">
                  {filteredToilets.map((toilet) => (
                    <Pressable
                      key={toilet.id}
                      onPress={() => handleToiletPress(toilet.id)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        padding: 12,
                        width: 200,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3.84,
                        elevation: 3,
                      }}
                    >
                      <Text fontWeight="bold" fontSize={14} numberOfLines={1}>
                        {toilet.name}
                      </Text>
                      <Text fontSize={12} color="#757575" numberOfLines={1} marginTop="$1">
                        {toilet.address}
                      </Text>
                      <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
                        <Text fontSize={12} color="#4ECDC4" fontWeight="bold">
                          {location ? formatDistance(toilet.distance / 1000) : '—'}
                        </Text>
                        <Text fontSize={12}>
                          ⭐ {toilet.rating.toFixed(1)} ({toilet.reviewCount})
                        </Text>
                      </XStack>
                    </Pressable>
                  ))}
                </XStack>
              </ScrollView>
            )}
          </>
        )}

        {/* My Location Button - динамическое позиционирование */}
        <Pressable
          onPress={handleMyLocationPress}
          disabled={locationLoading}
          style={{
            position: 'absolute',
            bottom: showToiletsList ? 220 : 30,
            right: 20,
            backgroundColor: 'white',
            borderRadius: 30,
            width: 60,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            opacity: locationLoading ? 0.7 : 1,
          }}
        >
          {locationLoading ? <Spinner size="small" color="#4ECDC4" /> : <LocationIcon />}
        </Pressable>

        {/* Status Info - динамическое позиционирование */}
        <View style={{
          position: 'absolute',
          bottom: showToiletsList ? 220 : 30,
          left: 20,
          backgroundColor: 'rgba(76, 205, 196, 0.9)',
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}>
          <Text color="white" fontSize={12} fontWeight="bold">
            Найдено: {filteredToilets.length} туалетов
          </Text>
        </View>
      </View>
    </YStack>
  )
}