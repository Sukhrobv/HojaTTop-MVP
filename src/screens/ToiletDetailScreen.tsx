import React, { useState, useEffect } from 'react'
import { ScrollView, YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { Alert, Linking } from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { 
  Navigation, 
  MessageSquarePlus, 
  Accessibility, 
  Baby, 
  Droplets, 
  DollarSign,
  MapPin,
  Clock
} from 'lucide-react-native'
import { RootStackParamList } from '@/navigation'
import { useReviews } from '@/hooks/useReviews'
import { getToiletById } from '@/services/toilets'
import { getFeatureCounts } from '@/services/reviews'
import { Toilet, FeatureCounts } from '@/types'
import { CompactRating, ReviewsList, ReviewStats, FeatureTag } from '@components/ReviewComponents'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToiletDetail'>
type RouteProps = RouteProp<RootStackParamList, 'ToiletDetail'>

// Color scheme
const colors = {
  primary: '#4ECDC4',
  secondary: '#FF6B6B', 
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  accent: '#9C27B0',
  neutral: '#6E7AA1'
}

export default function ToiletDetailScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProps>()
  const { toiletId } = route.params

  const [toilet, setToilet] = useState<Toilet | null>(null)
  const [toiletLoading, setToiletLoading] = useState(true)
  const [toiletError, setToiletError] = useState<string | null>(null)
  const [featureCounts, setFeatureCounts] = useState<FeatureCounts | null>(null)

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
      // Also refresh feature counts
      loadFeatureCounts()
    }, [forceRefreshReviews])
  )

  // Load feature counts
  const loadFeatureCounts = async () => {
    try {
      const counts = await getFeatureCounts(toiletId)
      setFeatureCounts(counts)
    } catch (error) {
      console.error('Error loading feature counts:', error)
    }
  }

  // Load toilet details
  useEffect(() => {
    const loadToilet = async () => {
      try {
        setToiletLoading(true)
        setToiletError(null)
        
        const { toilet: toiletData } = await getToiletById(toiletId)
        
        if (toiletData) {
          setToilet(toiletData)
          // Load feature counts after toilet is loaded
          loadFeatureCounts()
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
        <Spinner size="large" color={colors.primary} />
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
      <YStack paddingHorizontal="$2" paddingVertical="$3" space="$2">
        
        {/* Main Info */}
        <YStack 
          backgroundColor="$background" 
          borderRadius="$3" 
          padding="$4"
          borderWidth={1}
          borderColor="$borderColor"
          space="$3"
        >
          <YStack space="$2">
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize={20} fontWeight="bold" flex={1}>
                {toilet.name}
              </Text>
              <XStack alignItems="center" space="$1">
                <DollarSign 
                  size={16} 
                  color={toilet.features.isFree ? colors.success : colors.error} 
                />
                <Text 
                  fontSize={14} 
                  fontWeight="600"
                  color={toilet.features.isFree ? colors.success : colors.error}
                >
                  {toilet.features.isFree ? 'Бесплатно' : 'Платно'}
                </Text>
              </XStack>
            </XStack>
            <XStack alignItems="center" space="$2">
              <MapPin size={16} color={colors.neutral} />
              <Text color="$colorSubtle" flex={1}>
                {toilet.address}
              </Text>
            </XStack>
            <XStack alignItems="center" space="$2">
              <Clock size={16} color={colors.neutral} />
              <Text color="$colorSubtle">
                {toilet.openHours}
              </Text>
            </XStack>
          </YStack>

          {/* Features */}
          <XStack space="$2" justifyContent="center">
            <FeatureTag
              icon={Accessibility}
              label=""
              available={toilet.features.isAccessible}
              compact={true}
            />
            <FeatureTag
              icon={Baby}
              label=""
              available={toilet.features.hasBabyChanging}
              compact={true}
            />
            <FeatureTag
              icon={Droplets}
              label=""
              available={toilet.features.hasAblution}
              compact={true}
            />
          </XStack>

          {/* Action Buttons */}
          <XStack space="$2">
            <Button 
              flex={1}
              size="$4" 
              backgroundColor={colors.primary}
              pressStyle={{ backgroundColor: '#3BA99C' }}
              onPress={handleBuildRoute}
              icon={Navigation}
            >
              <Text color="white" fontWeight="600">
                Маршрут
              </Text>
            </Button>
            
            <Button 
              flex={1}
              size="$4" 
              backgroundColor={colors.secondary}
              pressStyle={{ backgroundColor: '#E55555' }}
              onPress={handleAddReview}
              icon={MessageSquarePlus}
            >
              <Text color="white" fontWeight="600">
                Отзыв
              </Text>
            </Button>
          </XStack>
        </YStack>

        {/* Rating Section */}
        <YStack 
          backgroundColor="$background" 
          borderRadius="$3" 
          padding="$4"
          borderWidth={1}
          borderColor="$borderColor"
          space="$3"
        >
          <Text fontSize={18} fontWeight="bold">
            Рейтинг
          </Text>
          <ReviewStats 
            stats={stats} 
            featureCounts={featureCounts}
          />
        </YStack>

        {/* Reviews Section */}
        <YStack 
          backgroundColor="$background" 
          borderRadius="$3" 
          padding="$4"
          borderWidth={1}
          borderColor="$borderColor"
          space="$3"
        >
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
          
          <ReviewsList 
            reviews={reviews}
            loading={reviewsLoading}
            error={reviewsError}
            emptyMessage="Отзывов о данном туалете пока нет"
          />
        </YStack>
      </YStack>
    </ScrollView>
  )
}