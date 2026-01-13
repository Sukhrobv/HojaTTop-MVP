import React, { useEffect, useState } from 'react'
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
  MapPin,
  Clock,
  Star
} from 'lucide-react-native'
import { RootStackParamList } from '@/navigation'
import { useReviews } from '@/hooks/useReviews'
import { getToiletById } from '@/services/toilets'
import { getFeatureCounts } from '@/services/reviews'
import { Toilet, FeatureCounts, Review } from '@/types'
import { CompactRatingDisplay, ReviewsList, ReviewStats, FeatureTag, ReviewSectionHeader, PaymentStatusBadge, FeatureCounter, RewardSheet } from '@components/ReviewComponents'
import { useTranslation } from '@/i18n'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToiletDetail'>
type RouteProps = RouteProp<RootStackParamList, 'ToiletDetail'>

type ReviewWithVotes = Review & {
  likes?: number
  dislikes?: number
  userLiked?: boolean
  userDisliked?: boolean
}

// UNIFIED color scheme
const colors = {
  primary: '#4ECDC4',
  secondary: '#FF6B6B', 
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  accent: '#9C27B0',
  neutral: '#6E7AA1',
  // Star rating colors
  starGold: '#FFD700',
  starFilled: '#FFA500',
  // UNIFIED feature-specific colors (same everywhere)
  accessibility: '#2196F3', // Blue for accessibility
  babyChanging: '#FF9800',  // Orange for baby changing
  ablution: '#00BCD4',      // Light blue for ablution
}

export default function ToiletDetailScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProps>()
  const { toiletId } = route.params
  const { t } = useTranslation()

  const [toilet, setToilet] = useState<Toilet | null>(null)
  const [toiletLoading, setToiletLoading] = useState(true)
  const [toiletError, setToiletError] = useState<string | null>(null)
  const [featureCounts, setFeatureCounts] = useState<FeatureCounts | null>(null)
  const [reviewList, setReviewList] = useState<ReviewWithVotes[]>([])
  const [rewardData, setRewardData] = useState<RouteProps['params']['reward'] | undefined>(route.params.reward)
  const [showRewardSheet, setShowRewardSheet] = useState<boolean>(!!route.params.reward)

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refresh: refreshReviews,
    forceRefresh: forceRefreshReviews,
    stats
  } = useReviews(toiletId)

  useEffect(() => {
    setReviewList((prev) =>
      reviews.map((review) => {
        const existing = prev.find((item) => item.id === review.id)
        const reviewWithVotes = review as ReviewWithVotes

        return {
          ...review,
          likes: reviewWithVotes.likes ?? existing?.likes ?? 0,
          dislikes: reviewWithVotes.dislikes ?? existing?.dislikes ?? 0,
          userLiked: existing?.userLiked ?? reviewWithVotes.userLiked ?? false,
          userDisliked: existing?.userDisliked ?? reviewWithVotes.userDisliked ?? false
        }
      })
    )
  }, [reviews])

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
          setToiletError(t('toilet.notFound', 'Туалет не найден'))
        }
      } catch (error) {
        console.error('Error loading toilet:', error)
        setToiletError(t('toilet.loadError', 'Ошибка загрузки данных'))
      } finally {
        setToiletLoading(false)
      }
    }

    loadToilet()
  }, [toiletId])

  const applyVoteUpdate = (prevReviews: ReviewWithVotes[], reviewId: string, direction: 'upvote' | 'downvote') => {
    return prevReviews.map((item) => {
      if (item.id !== reviewId) return item

      let likes = item.likes ?? 0
      let dislikes = item.dislikes ?? 0
      let userLiked = item.userLiked ?? false
      let userDisliked = item.userDisliked ?? false

      if (direction === 'upvote') {
        if (userLiked) {
          likes = Math.max(0, likes - 1)
          userLiked = false
        } else {
          likes += 1
          if (userDisliked) {
            dislikes = Math.max(0, dislikes - 1)
            userDisliked = false
          }
          userLiked = true
        }
      } else {
        if (userDisliked) {
          dislikes = Math.max(0, dislikes - 1)
          userDisliked = false
        } else {
          dislikes += 1
          if (userLiked) {
            likes = Math.max(0, likes - 1)
            userLiked = false
          }
          userDisliked = true
        }
      }

      return { ...item, likes, dislikes, userLiked, userDisliked }
    })
  }

  const submitVote = async (_reviewId: string, _direction: 'upvote' | 'downvote') => {
    // TODO: integrate real vote persistence with backend
    return Promise.resolve()
  }

  const handleVote = async (reviewId: string, direction: 'upvote' | 'downvote') => {
    let previousState: ReviewWithVotes[] = []

    setReviewList((prev) => {
      previousState = prev.map((item) => ({ ...item }))
      return applyVoteUpdate(prev, reviewId, direction)
    })

    try {
      await submitVote(reviewId, direction)
    } catch (error) {
      console.error('Error updating vote:', error)
      setReviewList(previousState)
    }
  }

  const handleUpvote = (reviewId: string) => {
    handleVote(reviewId, 'upvote')
  }

  const handleDownvote = (reviewId: string) => {
    handleVote(reviewId, 'downvote')
  }

  useEffect(() => {
    if (route.params?.reward) {
      setRewardData(route.params.reward)
      setShowRewardSheet(true)
    }
  }, [route.params?.reward])

  const handleRewardSheetChange = (open: boolean) => {
    setShowRewardSheet(open)
    if (!open) {
      navigation.setParams({ reward: undefined })
    }
  }

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
        Alert.alert(t('toilet.alert.errorTitle', 'Ошибка'), t('toilet.alert.mapsFail', 'Не удалось открыть карты'))
      }
    })
  }

  // LOGIC: Determine payment status by majority vote
  const getPaymentStatus = () => {
    if (!featureCounts) {
      // Fallback to base data if no feature counts
      return {
        isFree: toilet?.features.isFree || false,
        source: 'base'
      }
    }

    const { paidCount, freeCount } = featureCounts
    
    if (freeCount === 0 && paidCount === 0) {
      // No votes, use base data
      return {
        isFree: toilet?.features.isFree || false,
        source: 'base'
      }
    }

    // Majority vote wins
    if (freeCount > paidCount) {
      return { isFree: true, source: 'votes' }
    } else if (paidCount > freeCount) {
      return { isFree: false, source: 'votes' }
    } else {
      // Equal votes, use base data
      return {
        isFree: toilet?.features.isFree || false,
        source: 'equal'
      }
    }
  }

  if (toiletLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color={colors.primary} />
        <Text marginTop="$3" color="#757575">{t('toilet.loading', 'Загрузка...')}</Text>
      </YStack>
    )
  }

  if (toiletError || !toilet) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
        <Text fontSize={18} color="#757575" textAlign="center" marginBottom="$4">
          {toiletError || t('toilet.notFound', 'Туалет не найден')}
        </Text>
        <Button onPress={() => navigation.goBack()}>
          <Text>{t('toilet.buttons.back', 'Назад')}</Text>
        </Button>
      </YStack>
    )
  }

  const paymentStatus = getPaymentStatus()

  return (
    <>
      <ScrollView flex={1} backgroundColor="$background">
        <YStack paddingHorizontal="$2" paddingVertical="$3" space="$2">
        
        {/* MERGED: Main Info + Rating + Features */}
        <YStack 
          backgroundColor="$background" 
          borderRadius="$3" 
          padding="$4"
          borderWidth={1}
          borderColor="$borderColor"
          space="$5"
        >
          <YStack space="$3">
            {/* Title and Payment Status Row */}
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize={20} fontWeight="bold" flex={1} marginRight="$2">
                {toilet.name}
              </Text>
              
              {/* Payment status - text only, no icon */}
              <Text 
                fontSize={14} 
                fontWeight="600"
                color={paymentStatus.isFree ? colors.success : colors.error}
              >
                {paymentStatus.isFree ? t('toilet.payment.free', 'Бесплатно') : t('toilet.payment.paid', 'Платно')}
              </Text>
            </XStack>

            {/* Rating and Address Row */}
            <YStack space="$2">
              {stats && stats.averageRating > 0 && (
                <XStack alignItems="center" space="$1">
                  <Star 
                    size={16} 
                    color={colors.starFilled} 
                    fill={colors.starGold}
                  />
                  <Text 
                    fontSize={14} 
                    fontWeight="bold" 
                    color={colors.primary}
                  >
                    {stats.averageRating.toFixed(1)}
                  </Text>
                </XStack>
              )}
              
              <XStack alignItems="center" space="$2">
                <MapPin size={14} color={colors.neutral} />
                <Text color="$colorSubtle" fontSize={13} flex={1}>
                  {toilet.address}
                </Text>
              </XStack>
              
              <XStack alignItems="center" space="$2">
                <Clock size={14} color={colors.neutral} />
                <Text color="$colorSubtle" fontSize={13}>
                  {toilet.openHours}
                </Text>
              </XStack>
            </YStack>
          </YStack>

          {/* ONLY Feature counters (no simple icons) */}
          {featureCounts && (
            <XStack space="$3" justifyContent="center" alignItems="center">
              <FeatureCounter
                icon={Accessibility}
                count={featureCounts.accessibilityCount}
                type="accessibility"
              />
              <FeatureCounter
                icon={Baby}
                count={featureCounts.babyChangingCount}
                type="babyChanging"
              />
              <FeatureCounter
                icon={Droplets}
                count={featureCounts.ablutionCount}
                type="ablution"
              />
            </XStack>
          )}

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
                {t('toilet.buttons.route', 'Маршрут')}
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
                {t('toilet.buttons.review', 'Отзыв')}
              </Text>
            </Button>
          </XStack>
        </YStack>

        {/* Reviews Section with payment stats */}
        <YStack 
          backgroundColor="$background" 
          borderRadius="$3" 
          padding="$4"
          borderWidth={1}
          borderColor="$borderColor"
          space="$4"
        >
          {/* UPDATED: ReviewSectionHeader with payment stats */}
          <ReviewSectionHeader
            reviewCount={reviews.length}
            showError={!!reviewsError}
            onRefresh={forceRefreshReviews}
            loading={reviewsLoading}
            paymentStats={featureCounts ? {
              freeCount: featureCounts.freeCount,
              paidCount: featureCounts.paidCount
            } : undefined}
          />
          
          <ReviewsList 
            reviews={reviewList}
            loading={reviewsLoading}
            error={reviewsError}
            onLike={handleUpvote}
            onDislike={handleDownvote}
            emptyMessage={t('toilet.reviews.empty', 'Отзывов о данном туалете пока нет')}
          />
        </YStack>
        </YStack>
      </ScrollView>

      {rewardData && (
        <RewardSheet
          open={showRewardSheet}
          onOpenChange={handleRewardSheetChange}
          title={rewardData.title || t('toilet.reward.title', 'Спасибо за отзыв!')}
          subtitle={rewardData.subtitle}
          rewardLabel={rewardData.rewardLabel || t('toilet.reward.label', 'Ваш бонус')}
          code={rewardData.code}
          terms={rewardData.terms}
          accentColor={rewardData.accentColor || colors.primary}
        />
      )}
    </>
  )
}
