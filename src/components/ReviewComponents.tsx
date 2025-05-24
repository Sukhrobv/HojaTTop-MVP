import React, { useState } from 'react'
import { YStack, XStack, Text, Progress, Button } from 'tamagui'
import { Pressable } from 'react-native'
import { 
  ThumbsUp, 
  ThumbsDown, 
  Accessibility, 
  Baby, 
  Droplets, 
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  Camera
} from 'lucide-react-native'
import { Review } from '@/types'

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

// Legacy rating stars component for backward compatibility
export const RatingStars = ({ 
  rating, 
  size = 16, 
  showValue = true 
}: { 
  rating: number
  size?: number
  showValue?: boolean 
}) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <XStack alignItems="center">
      {/* Full stars */}
      {Array(fullStars).fill(0).map((_, i) => (
        <Text key={`full-${i}`} fontSize={size} color="#FFD700">⭐</Text>
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <Text fontSize={size} color="#FFD700">⭐</Text>
      )}
      
      {/* Empty stars */}
      {Array(emptyStars).fill(0).map((_, i) => (
        <Text key={`empty-${i}`} fontSize={size} color="#E0E0E0">☆</Text>
      ))}
      
      {showValue && (
        <Text marginLeft="$2" fontSize={size - 2} color="$colorSubtle">
          {rating.toFixed(1)}
        </Text>
      )}
    </XStack>
  )
}

// Progress bar rating component (10-point scale)
export const ProgressRating = ({ 
  rating, 
  maxRating = 10,
  label,
  color = colors.primary,
  showValue = true 
}: { 
  rating: number
  maxRating?: number
  label?: string
  color?: string
  showValue?: boolean 
}) => {
  const percentage = (rating / maxRating) * 100

  return (
    <XStack alignItems="center" space="$2">
      <Text fontSize={14} color="$color" minWidth={80}>
        {label}
      </Text>
      <YStack flex={1}>
        <Progress 
          value={percentage} 
          backgroundColor="$backgroundPress"
          height={8}
          borderRadius={4}
        >
          <Progress.Indicator 
            animation="bouncy" 
            backgroundColor={color}
            borderRadius={4}
          />
        </Progress>
      </YStack>
      {showValue && (
        <Text fontSize={14} fontWeight="600" color={color} minWidth={40}>
          {rating.toFixed(1)}/10
        </Text>
      )}
    </XStack>
  )
}

// Feature counter component
export const FeatureCounter = ({ 
  icon: Icon, 
  label, 
  count 
}: { 
  icon: any
  label: string
  count: number
}) => (
  <XStack 
    alignItems="center" 
    space="$2" 
    paddingHorizontal="$3"
    paddingVertical="$2"
    backgroundColor={count > 0 ? colors.primary + '20' : '$backgroundPress'}
    borderRadius="$6"
    borderWidth={1}
    borderColor={count > 0 ? colors.primary + '40' : '$borderColor'}
  >
    <Icon 
      size={16} 
      color={count > 0 ? colors.primary : colors.neutral} 
    />
    <Text 
      fontSize={14} 
      color={count > 0 ? colors.primary : colors.neutral}
      fontWeight={count > 0 ? '600' : '400'}
    >
      {label}
    </Text>
    <Text 
      fontSize={14} 
      fontWeight="600" 
      color={count > 0 ? colors.primary : colors.neutral}
    >
      ({count})
    </Text>
  </XStack>
)
export const CompactRating = ({ 
  rating,
  reviewCount = 0,
  size = 'normal'
}: { 
  rating: number
  reviewCount?: number
  size?: 'small' | 'normal' | 'large'
}) => {
  const fontSize = size === 'small' ? 16 : size === 'large' ? 28 : 20
  const textSize = size === 'small' ? 12 : size === 'large' ? 16 : 14

  return (
    <XStack alignItems="center" space="$2">
      <Text fontSize={fontSize} fontWeight="bold" color={colors.primary}>
        {(rating * 2).toFixed(1)}
      </Text>
      <Text fontSize={textSize} color="$colorSubtle">/10</Text>
      {reviewCount > 0 && (
        <Text fontSize={textSize} color="$colorSubtle">
          ({reviewCount})
        </Text>
      )}
    </XStack>
  )
}

// Feature icon with modern design
export const FeatureTag = ({ 
  icon: Icon, 
  label, 
  available = false,
  compact = false 
}: { 
  icon: any
  label: string
  available?: boolean
  compact?: boolean
}) => (
  <XStack 
    alignItems="center" 
    justifyContent="center"
    width={compact ? 40 : "auto"}
    height={compact ? 40 : "auto"}
    paddingHorizontal={label ? (compact ? "$2" : "$3") : 0}
    paddingVertical={label ? (compact ? "$1" : "$2") : 0}
    backgroundColor={available ? colors.success + '20' : '$backgroundPress'}
    borderRadius="$6"
    borderWidth={1}
    borderColor={available ? colors.success + '40' : '$borderColor'}
  >
    <Icon 
      size={compact ? 20 : 16} 
      color={available ? colors.success : colors.neutral} 
    />
    {label && (
      <Text 
        fontSize={compact ? 12 : 14} 
        color={available ? colors.success : colors.neutral}
        fontWeight={available ? '600' : '400'}
        marginLeft="$1"
      >
        {label}
      </Text>
    )}
  </XStack>
)

// Compact review card
export const ReviewCard = ({ 
  review, 
  onLike,
  onDislike
}: { 
  review: Review & { likes?: number; dislikes?: number; userLiked?: boolean; userDisliked?: boolean }
  onLike?: (reviewId: string) => void
  onDislike?: (reviewId: string) => void
}) => {
  const [expanded, setExpanded] = useState(false)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Сегодня'
    if (diffDays === 2) return 'Вчера'
    if (diffDays <= 7) return `${diffDays} дня назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <YStack 
      backgroundColor="$background" 
      borderRadius="$3" 
      padding="$3"
      borderWidth={1}
      borderColor="$borderColor"
      space="$3"
    >
      {/* Header */}
      <XStack alignItems="center" justifyContent="space-between">
        <YStack flex={1}>
          <Text fontWeight="600" fontSize={15}>
            {review.userName}
          </Text>
          <Text fontSize={12} color="$colorSubtle">
            {formatDate(review.createdAt)}
          </Text>
        </YStack>
        <CompactRating rating={review.rating} size="small" />
      </XStack>
      
      {/* Comment */}
      {review.comment && (
        <YStack space="$2">
          <Text fontSize={14} lineHeight={20} numberOfLines={expanded ? undefined : 3}>
            {review.comment}
          </Text>
          
          {review.comment.length > 100 && (
            <Pressable onPress={() => setExpanded(!expanded)}>
              <XStack alignItems="center" space="$1">
                <Text fontSize={12} color={colors.primary} fontWeight="600">
                  {expanded ? 'Свернуть' : 'Читать далее'}
                </Text>
                {expanded ? 
                  <ChevronUp size={12} color={colors.primary} /> : 
                  <ChevronDown size={12} color={colors.primary} />
                }
              </XStack>
            </Pressable>
          )}
        </YStack>
      )}
      
      {/* Actions */}
      <XStack alignItems="center" justifyContent="space-between" paddingTop="$1">
        <XStack space="$4">
          <Pressable 
            onPress={() => onLike?.(review.id)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <ThumbsUp 
              size={14} 
              color={review.userLiked ? colors.accent : colors.neutral}
              fill={review.userLiked ? colors.accent : 'transparent'}
            />
            <Text 
              fontSize={12} 
              marginLeft={4}
              color={review.userLiked ? colors.accent : colors.neutral}
            >
              {review.likes || 0}
            </Text>
          </Pressable>
          
          <Pressable 
            onPress={() => onDislike?.(review.id)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <ThumbsDown 
              size={14} 
              color={review.userDisliked ? colors.error : colors.neutral}
              fill={review.userDisliked ? colors.error : 'transparent'}
            />
            <Text 
              fontSize={12} 
              marginLeft={4}
              color={review.userDisliked ? colors.error : colors.neutral}
            >
              {review.dislikes || 0}
            </Text>
          </Pressable>
        </XStack>
      </XStack>
    </YStack>
  )
}

// Reviews list
export const ReviewsList = ({ 
  reviews, 
  loading = false, 
  error = null,
  emptyMessage = "Отзывов пока нет",
  onLike,
  onDislike 
}: { 
  reviews: Review[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  onLike?: (reviewId: string) => void
  onDislike?: (reviewId: string) => void
}) => {
  if (loading) {
    return (
      <YStack alignItems="center" padding="$3">
        <Text color="$colorSubtle">Загрузка отзывов...</Text>
      </YStack>
    )
  }

  if (error) {
    return (
      <YStack alignItems="center" padding="$3">
        <Text color={colors.error} textAlign="center">
          {error}
        </Text>
      </YStack>
    )
  }

  if (reviews.length === 0) {
    return (
      <YStack alignItems="center" padding="$4" space="$2">
        <Text fontSize={32}>💭</Text>
        <Text color="$colorSubtle" textAlign="center" fontSize={14}>
          {emptyMessage}
        </Text>
        <Text fontSize={12} color="$colorSubtle" textAlign="center">
          Станьте первым, кто оставит отзыв!
        </Text>
      </YStack>
    )
  }

  return (
    <YStack space="$2">
      {reviews.map((review) => (
        <ReviewCard 
          key={review.id} 
          review={review}
          onLike={onLike}
          onDislike={onDislike}
        />
      ))}
    </YStack>
  )
}

// Simplified review statistics - just main rating
export const ReviewStats = ({ 
  stats,
  featureCounts
}: { 
  stats: {
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
    averageCleanliness: number
    averageAccessibility: number
  } | null
  featureCounts?: {
    accessibilityCount: number
    babyChangingCount: number
    ablutionCount: number
    paidCount: number
    freeCount: number
  } | null
}) => {
  if (!stats || stats.totalReviews === 0) {
    return null
  }

  return (
    <YStack space="$4">
      {/* Main rating only */}
      <YStack alignItems="center" space="$2">
        <Text fontSize={48} fontWeight="bold" color={colors.primary}>
          {(stats.averageRating * 2).toFixed(1)}
        </Text>
        <Text fontSize={16} color="$colorSubtle">/10</Text>
        <Text fontSize={14} color="$colorSubtle">
          {stats.totalReviews} отзывов
        </Text>
      </YStack>

      {/* Feature counters (Yandex Taxi style) */}
      {featureCounts && (
        <YStack space="$3">
          <Text fontSize={16} fontWeight="bold">
            Упоминания в отзывах
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            <FeatureCounter
              icon={Accessibility}
              label="Доступность"
              count={featureCounts.accessibilityCount}
            />
            <FeatureCounter
              icon={Baby}
              label="Пеленальный столик"
              count={featureCounts.babyChangingCount}
            />
            <FeatureCounter
              icon={Droplets}
              label="Омовение"
              count={featureCounts.ablutionCount}
            />
          </XStack>
        </YStack>
      )}

      {/* Payment statistics */}
      {featureCounts && (featureCounts.paidCount > 0 || featureCounts.freeCount > 0) && (
        <YStack space="$2">
          <Text fontSize={16} fontWeight="bold">
            Стоимость по отзывам
          </Text>
          <XStack space="$3">
            <XStack alignItems="center" space="$2">
              <Text fontSize={14} color={colors.success}>Бесплатно:</Text>
              <Text fontSize={14} fontWeight="600">{featureCounts.freeCount}</Text>
            </XStack>
            <XStack alignItems="center" space="$2">
              <Text fontSize={14} color={colors.error}>Платно:</Text>
              <Text fontSize={14} fontWeight="600">{featureCounts.paidCount}</Text>
            </XStack>
          </XStack>
        </YStack>
      )}
    </YStack>
  )
}