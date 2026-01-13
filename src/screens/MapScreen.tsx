import React, { useState, useMemo } from 'react'
import { YStack, XStack, Text, View, Spinner, Input } from 'tamagui'
import { Pressable, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/navigation'
import { useNearbyToilets } from '@/hooks/useNearbyToilets'
import { getCurrentLocation, formatDistance, getMapRegion } from '@/services/location'
import { Coordinates, Filters } from '@/types'
import ToiletMapNative from '@components/ToiletMapNative'
import DataStatusBanner from '@components/DataStatusBanner'
import { Search, Locate, List, SlidersHorizontal, Settings } from 'lucide-react-native'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>

export default function MapScreen() {
  const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showToiletsList, setShowToiletsList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { 
    filteredToilets, 
    loading: toiletsLoading, 
    error,
    refresh,
    forceRefresh,
    dataSource,
    isStale,
    lastUpdated,
    cacheInfo,
    activeFilters,
    applyToiletFilters
  } = useNearbyToilets(location, 5000) // 5000km = show all toilets

  // Filter toilets based on search query - Memoized to prevent map re-renders
  const displayedToilets = useMemo(() => filteredToilets.filter(toilet => 
    toilet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    toilet.address.toLowerCase().includes(searchQuery.toLowerCase())
  ), [filteredToilets, searchQuery])

  const handleToiletPress = (toiletId: string) => {
    navigation.navigate('ToiletDetail', { toiletId })
  }

  const handleSettingsPress = () => {
    navigation.navigate('Settings')
  }

  const handleMyLocationPress = async () => {
    setLocationLoading(true)
    try {
      const currentLocation = await getCurrentLocation()
      if (currentLocation) {
        setLocation(currentLocation)
        // Force refresh when getting location to get updated nearby toilets
        await forceRefresh()
      }
    } finally {
      setLocationLoading(false)
    }
  }

  const mapRegion = location ? getMapRegion(location, 2) : undefined

  return (
    <YStack flex={1} backgroundColor="$background">
      <StatusBar style="light" />
      
      {/* Header with safe area */}
      <YStack backgroundColor="#4ECDC4" paddingTop={insets.top}>
        {/* <XStack 
          paddingVertical="$3" 
          paddingHorizontal="$4"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text color="white" fontSize={24} fontWeight="bold">
            HojaTTop
          </Text>
        </XStack> */}

        {/* Search Bar */}
        <View paddingHorizontal="$4" paddingBottom="$3">
          <XStack 
            backgroundColor="white" 
            borderRadius="$4" 
            paddingHorizontal="$3" 
            height={40} 
            alignItems="center"
          >
            <Search size={20} color="#999" />
            <Input
              flex={1}
              placeholder="Поиск..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              backgroundColor="transparent"
              borderWidth={0}
              height="100%"
              marginLeft="$2"
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Text fontSize={18} color="#999">✕</Text>
              </Pressable>
            )}
          </XStack>
        </View>
      </YStack>

      {/* Data Status Banner */}
      <DataStatusBanner
        dataSource={dataSource}
        isStale={isStale}
        lastUpdated={lastUpdated}
        toiletsCount={cacheInfo?.toiletsCount || displayedToilets.length}
        onRefresh={forceRefresh}
        loading={toiletsLoading}
      />

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
              toilets={displayedToilets}
              onToiletPress={handleToiletPress}
            />

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
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <XStack padding="$3" space="$3">
                  {displayedToilets.map((toilet) => (
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
                      <Text fontSize={11} color={toilet.features.isFree ? 'green' : '#FF6B6B'} marginTop="$1">
                        {toilet.features.isFree ? 'Бесплатно' : 'Платно'}
                      </Text>
                    </Pressable>
                  ))}
                </XStack>
              </ScrollView>
            )}
          </>
        )}

        {/* Vertical FAB Stack */}
        <YStack
          position="absolute"
          bottom={showToiletsList ? 150 : 30}
          right={20}
          space="$3"
        >
          {/* Settings Button */}
          <Pressable
            onPress={handleSettingsPress}
            style={{
              backgroundColor: '#4ECDC4',
              borderRadius: 30,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Settings size={24} color="white" />
          </Pressable>

          {/* Filters Button */}
          <Pressable
            onPress={() => navigation.navigate('Filters', {
              initialFilters: activeFilters,
              onApply: (filters: Filters) => applyToiletFilters(filters)
            })}
            style={{
              backgroundColor: '#4ECDC4',
              borderRadius: 30,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <View>
              <SlidersHorizontal size={24} color="white" />
              {/* Active filters indicator badge */}
              {(() => {
                const count = [
                  activeFilters.isAccessible,
                  activeFilters.hasBabyChanging,
                  activeFilters.hasAblution,
                  activeFilters.isFree,
                  (activeFilters.minRating ?? 0) > 0,
                  activeFilters.maxDistance !== null && activeFilters.maxDistance !== undefined
                ].filter(Boolean).length
                
                return count > 0 ? (
                  <View style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: '#FF6B6B',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}>
                    <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
                      {count}
                    </Text>
                  </View>
                ) : null
              })()}
            </View>
          </Pressable>

          {/* List Toggle Button */}
          <Pressable
            onPress={() => setShowToiletsList(!showToiletsList)}
            style={{
              backgroundColor: '#4ECDC4',
              borderRadius: 30,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <List size={24} color="white" />
          </Pressable>

          {/* My Location Button */}
          <Pressable
            onPress={handleMyLocationPress}
            disabled={locationLoading}
            style={{
              backgroundColor: '#4ECDC4',
              borderRadius: 30,
              width: 50,
              height: 50,
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
            {locationLoading ? (
              <Spinner size="small" color="white" />
            ) : (
              <Locate size={24} color="white" />
            )}
          </Pressable>
        </YStack>

        {/* Status Info - динамическое позиционирование */}
        <View style={{
          position: 'absolute',
          bottom: showToiletsList ? 150 : 30,
          left: 20,
          backgroundColor: 'rgba(76, 205, 196, 0.9)',
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 3,
        }}>
          <Text color="white" fontSize={12} fontWeight="bold">
            Найдено: {displayedToilets.length} точек
          </Text>
          {dataSource === 'cache' && (
            <Text color="white" fontSize={10} opacity={0.9}>
              Офлайн данные
            </Text>
          )}
        </View>
      </View>
    </YStack>
  )
}