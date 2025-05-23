import React from 'react'
import { ScrollView, YStack, XStack, Text, Button, Card, Separator } from 'tamagui'
import { Alert } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '@/navigation'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToiletDetail'>
type RouteProps = RouteProp<RootStackParamList, 'ToiletDetail'>

// Mock data - will be replaced with real data from Firebase
const mockToiletData = {
  toilet1: {
    id: 'toilet1',
    name: 'Кафе "Пончик"',
    address: 'ул. Амира Темура, 41',
    rating: 4.5,
    reviewCount: 23,
    features: {
      isAccessible: true,
      hasBabyChanging: true,
      hasAblution: false,
      isFree: false,
    },
    openHours: '08:00 - 22:00',
  },
  toilet2: {
    id: 'toilet2',
    name: 'ТЦ "Самарканд Дарваза"',
    address: 'ул. Коратош, 5А',
    rating: 3.8,
    reviewCount: 45,
    features: {
      isAccessible: true,
      hasBabyChanging: false,
      hasAblution: true,
      isFree: true,
    },
    openHours: '09:00 - 21:00',
  },
}

const FeatureItem = ({ label, available }: { label: string; available: boolean }) => (
  <XStack alignItems="center" marginVertical="$1">
    <Text fontSize={18} marginRight="$2">
      {available ? '✅' : '❌'}
    </Text>
    <Text color={available ? '$color' : '$colorSubtle'}>
      {label}
    </Text>
  </XStack>
)

const RatingStars = ({ rating }: { rating: number }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? '⭐' : '☆')
  return (
    <XStack>
      <Text fontSize={16}>{stars.join('')}</Text>
      <Text marginLeft="$2" color="$colorSubtle">
        {rating.toFixed(1)}
      </Text>
    </XStack>
  )
}

export default function ToiletDetailScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProps>()
  const { toiletId } = route.params

  // Get mock data
  const toilet = mockToiletData[toiletId as keyof typeof mockToiletData] || mockToiletData.toilet1

  const handleAddReview = () => {
    navigation.navigate('AddReview', { toiletId: toilet.id })
  }

  const handleBuildRoute = () => {
    Alert.alert('Навигация', 'Построение маршрута к туалету...')
    // TODO: Implement route building with Yandex Maps
  }

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$4" space="$4">
        {/* Main Info Card */}
        <Card elevate bordered>
          <Card.Header>
            <YStack>
              <Text fontSize={20} fontWeight="bold">
                {toilet.name}
              </Text>
              <Text color="$colorSubtle" marginTop="$1">
                {toilet.address}
              </Text>
            </YStack>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <YStack space="$3">
              {/* Rating */}
              <XStack alignItems="center" justifyContent="space-between">
                <RatingStars rating={toilet.rating} />
                <Text color="$colorSubtle">
                  {toilet.reviewCount} отзывов
                </Text>
              </XStack>

              {/* Open Hours */}
              <XStack alignItems="center">
                <Text fontSize={16} marginRight="$2">🕐</Text>
                <Text>{toilet.openHours}</Text>
              </XStack>
            </YStack>
          </Card.Footer>
        </Card>

        {/* Features Card */}
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize={18} fontWeight="bold">
              Особенности
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <YStack space="$2">
              <FeatureItem 
                label="Доступно для инвалидов" 
                available={toilet.features?.isAccessible || false} 
              />
              <FeatureItem 
                label="Пеленальный столик" 
                available={toilet.features?.hasBabyChanging || false} 
              />
              <FeatureItem 
                label="Место для омовения" 
                available={toilet.features?.hasAblution || false} 
              />
              <FeatureItem 
                label="Бесплатно" 
                available={toilet.features?.isFree || false} 
              />
            </YStack>
          </Card.Footer>
        </Card>

        {/* Action Buttons */}
        <YStack space="$3">
          <Button 
            size="$5" 
            backgroundColor="#4ECDC4"
            pressStyle={{ backgroundColor: '#3BA99C' }}
            onPress={handleBuildRoute}
          >
            <Text color="white" fontWeight="bold">
              Построить маршрут
            </Text>
          </Button>
          
          <Button 
            size="$5" 
            backgroundColor="#FF6B6B"
            pressStyle={{ backgroundColor: '#E55555' }}
            onPress={handleAddReview}
          >
            <Text color="white" fontWeight="bold">
              Добавить отзыв
            </Text>
          </Button>
        </YStack>

        {/* Reviews Preview */}
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize={18} fontWeight="bold">
              Последние отзывы
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <Text color="$colorSubtle" textAlign="center">
              Отзывы появятся здесь
            </Text>
          </Card.Footer>
        </Card>
      </YStack>
    </ScrollView>
  )
}