import React, { useState, useEffect } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Card, Separator, Spinner } from 'tamagui'
import { Alert, Linking } from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '@/navigation'
import { useReviews } from '@/hooks/useReviews'
import { getToiletById } from '@/services/toilets'
import { Toilet } from '@/types'
import { RatingStars, ReviewsList, ReviewStats } from '@components/ReviewComponents'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToiletDetail'>
type RouteProps = RouteProp<RootStackParamList, 'ToiletDetail'>

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

export default function ToiletDetailScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProps>()
  const { toiletId } = route.params

  const [toilet, setToilet] = useState<Toilet | null>(null)
  const [toiletLoading, setToiletLoading] = useState(true)
  const [toiletError, setToiletError] = useState<string | null>(null)

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refresh: refreshReviews,
    forceRefresh: forceRefreshReviews,
    stats
  } = useReviews(toiletId)

  // Refresh reviews when screen comes into focus (after adding review)
  useFocusEffect(
    React.useCallback(() => {
      console.log('ToiletDetail screen focused, refreshing reviews...')
      forceRefreshReviews()
    }, [forceRefreshReviews])
  )

  // Load toilet details
  useEffect(() => {
    const loadToilet = async () => {
      try {
        setToiletLoading(true)
        setToiletError(null)
        
        const { toilet: toiletData } = await getToiletById(toiletId)
        
        if (toiletData) {
          setToilet(toiletData)
        } else {
          setToiletError('Туалет не найден')
        }
      } catch (error) {
        console.error('Error loading toilet:', error)
        setToiletError('Ошибка загрузки данных')
      } finally {
        setToiletLoading(false)
      }
    }

    loadToilet()
  }, [toiletId])

  const handleAddReview = () => {
    navigation.navigate('AddReview', { toiletId })
  }

  const handleBuildRoute = () => {
    if (!toilet) return
    
    // Open in Maps app
    const url = `https://maps.google.com/?q=${toilet.latitude},${toilet.longitude}`
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url)
      } else {
        Alert.alert('Ошибка', 'Не удалось открыть карты')
      }
    })
  }

  if (toiletLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color="#4ECDC4" />
        <Text marginTop="$3" color="#757575">Загрузка...</Text>
      </YStack>
    )
  }

  if (toiletError || !toilet) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
        <Text fontSize={18} color="#757575" textAlign="center" marginBottom="$4">
          {toiletError || 'Туалет не найден'}
        </Text>
        <Button onPress={() => navigation.goBack()}>
          <Text>Назад</Text>
        </Button>
      </YStack>
    )
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
                <RatingStars rating={toilet.rating} size={20} />
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
                available={toilet.features.isAccessible} 
              />
              <FeatureItem 
                label="Пеленальный столик" 
                available={toilet.features.hasBabyChanging} 
              />
              <FeatureItem 
                label="Место для омовения" 
                available={toilet.features.hasAblution} 
              />
              <FeatureItem 
                label="Бесплатно" 
                available={toilet.features.isFree} 
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

        {/* Review Statistics */}
        <ReviewStats stats={stats} />

        {/* Reviews Section */}
        <Card elevate bordered>
          <Card.Header>
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize={18} fontWeight="bold">
                Отзывы ({reviews.length})
              </Text>
              {reviewsError && (
                <Button
                  size="$2"
                  variant="outlined"
                  onPress={forceRefreshReviews}
                  disabled={reviewsLoading}
                >
                  <Text fontSize={12}>
                    {reviewsLoading ? 'Загрузка...' : 'Обновить'}
                  </Text>
                </Button>
              )}
            </XStack>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <ReviewsList 
              reviews={reviews}
              loading={reviewsLoading}
              error={reviewsError}
              emptyMessage="Отзывов о данном туалете пока нет"
            />
          </Card.Footer>
        </Card>
      </YStack>
    </ScrollView>
  )
}