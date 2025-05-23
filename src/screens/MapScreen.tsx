import React, { useState, useEffect, useRef } from 'react'
import { YStack, XStack, Text, View, Spinner } from 'tamagui'
import { Pressable, Alert, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/navigation'
import { useLocation } from '@/hooks/useLocation'
import { useNearbyToilets } from '@/hooks/useNearbyToilets'
import { formatDistance, getMapRegion } from '@/services/location'
import ToiletMapNative from '@components/ToiletMapNative' // Native map

// Icons placeholder - will be replaced with actual icons later
const FilterIcon = () => <Text fontSize={20}>🔍</Text>
const LocationIcon = () => <Text fontSize={20}>📍</Text>

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>

export default function MapScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { location, loading: locationLoading, refreshLocation } = useLocation()
  const { 
    filteredToilets, 
    toilets,
    loading: toiletsLoading, 
    error,
    refresh: refreshToilets 
  } = useNearbyToilets(location, 10) // 10км радиус

  const [selectedToiletId, setSelectedToiletId] = useState<string | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  const loading = locationLoading || toiletsLoading

  const handleToiletPress = (toiletId: string) => {
    setSelectedToiletId(toiletId)
    
    // Scroll to selected toilet in the list
    const index = filteredToilets.findIndex(t => t.id === toiletId)
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * 220, animated: true })
    }
  }

  const handleToiletCardPress = (toiletId: string) => {
    navigation.navigate('ToiletDetail', { toiletId })
  }

  const handleFilterPress = () => {
    navigation.navigate('Filters')
  }

  const handleMyLocationPress = async () => {
    await refreshLocation()
    await refreshToilets()
  }

  // Get initial map region based on user location
  const mapRegion = location ? getMapRegion(location, 2) : undefined

  return (
    <YStack flex={1} backgroundColor="$background">
      <StatusBar style="light" />
      
      {/* Custom Header */}
      <XStack 
        backgroundColor="#4ECDC4" 
        paddingTop="$2" 
        paddingBottom="$3" 
        paddingHorizontal="$4"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="white" fontSize={24} fontWeight="bold">
          HojaTTop
        </Text>
        <Pressable onPress={handleFilterPress}>
          <FilterIcon />
        </Pressable>
      </XStack>

      {/* Map Container */}
      <View flex={1} backgroundColor="#E0E0E0" position="relative">
        {loading ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Spinner size="large" color="#4ECDC4" />
            <Text marginTop="$3" color="#757575">
              Загрузка данных...
            </Text>
          </YStack>
        ) : error ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text fontSize={18} color="#757575" marginBottom="$4">
              {error}
            </Text>
            <Pressable onPress={handleMyLocationPress}>
              <Text color="#4ECDC4" textDecorationLine="underline">
                Попробовать снова
              </Text>
            </Pressable>
          </YStack>
        ) : (
          <>
            {/* Native map with markers */}
            <ToiletMapNative 
              initialRegion={mapRegion}
              toilets={filteredToilets.filter(t => t && t.latitude && t.longitude)}
              onToiletPress={handleToiletPress}
              userLocation={location}
            />

            {/* Toilets List */}
            <ScrollView 
              ref={scrollViewRef}
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
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              <XStack padding="$3" space="$3">
                {filteredToilets.map((toilet) => (
                  <Pressable
                    key={toilet.id}
                    onPress={() => handleToiletCardPress(toilet.id)}
                    style={{
                      backgroundColor: selectedToiletId === toilet.id ? '#E8F8F7' : 'white',
                      borderRadius: 12,
                      padding: 12,
                      width: 200,
                      borderWidth: selectedToiletId === toilet.id ? 2 : 0,
                      borderColor: '#4ECDC4',
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
                        {formatDistance(toilet.distance / 1000)}
                      </Text>
                      <Text fontSize={12}>
                        ⭐ {toilet.rating?.toFixed(1) || '0.0'} ({toilet.reviewCount || 0})
                      </Text>
                    </XStack>
                    <XStack marginTop="$1" space="$2">
                      <Text fontSize={11} color={toilet.features?.isFree ? 'green' : '#FF6B6B'}>
                        {toilet.features?.isFree ? 'Бесплатно' : 'Платно'}
                      </Text>
                      {toilet.features?.isAccessible && (
                        <Text fontSize={11}>♿</Text>
                      )}
                      {toilet.features?.hasBabyChanging && (
                        <Text fontSize={11}>👶</Text>
                      )}
                    </XStack>
                  </Pressable>
                ))}
              </XStack>
            </ScrollView>
          </>
        )}

        {/* My Location Button */}
        <Pressable
          onPress={handleMyLocationPress}
          style={{
            position: 'absolute',
            bottom: 220,
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
          }}
        >
          <LocationIcon />
        </Pressable>
      </View>
    </YStack>
  )
}