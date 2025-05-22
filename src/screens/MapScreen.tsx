import React, { useState, useEffect } from 'react'
import { YStack, XStack, Text, View, Spinner } from 'tamagui'
import { Pressable, Alert, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/navigation'
import { useLocation } from '@/hooks/useLocation'
import { useNearbyToilets } from '@/hooks/useNearbyToilets'
import { formatDistance } from '@/services/location'
import ToiletMapNative from '@components/ToiletMapNative' // Нативная карта

// Icons placeholder - will be replaced with actual icons later
const FilterIcon = () => <Text fontSize={20}>🔍</Text>
const LocationIcon = () => <Text fontSize={20}>📍</Text>

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>

export default function MapScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { location, loading: locationLoading, refreshLocation } = useLocation()
  const { 
    filteredToilets, 
    loading: toiletsLoading, 
    error,
    refresh: refreshToilets 
  } = useNearbyToilets(location, 5) // 5km radius

  const loading = locationLoading || toiletsLoading

  const handleToiletPress = (toiletId: string) => {
    navigation.navigate('ToiletDetail', { toiletId })
  }

  const handleFilterPress = () => {
    navigation.navigate('Filters')
  }

  const handleMyLocationPress = async () => {
    await refreshLocation()
    await refreshToilets()
  }

  // Mock map markers based on real data
  const renderToiletMarkers = () => {
    return filteredToilets.slice(0, 5).map((toilet, index) => (
      <Pressable
        key={toilet.id}
        onPress={() => handleToiletPress(toilet.id)}
        style={{
          position: 'absolute',
          top: 100 + (index * 60),
          left: 50 + (index % 2 === 0 ? 0 : 200),
          backgroundColor: toilet.features.isFree ? '#4ECDC4' : '#FF6B6B',
          borderRadius: 20,
          padding: 8,
          minWidth: 120,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text color="white" fontWeight="bold" fontSize={12}>
          {toilet.name.length > 15 ? toilet.name.substring(0, 15) + '...' : toilet.name}
        </Text>
        <Text color="white" fontSize={10}>
          {formatDistance(toilet.distance / 1000)} • ⭐{toilet.rating.toFixed(1)}
        </Text>
      </Pressable>
    ))
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <StatusBar style="light" />
      
      {/* Custom Header */}
      <XStack 
        backgroundColor="#4ECDC4" 
        paddingTop="$5" 
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
            {/* Нативная карта */}
            <ToiletMapNative />

            {/* Real toilet markers */}
            {/* {renderToiletMarkers()} - временно отключим */}

            {/* Toilets List (temporary, until map is integrated) */}
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
                        {formatDistance(toilet.distance / 1000)}
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