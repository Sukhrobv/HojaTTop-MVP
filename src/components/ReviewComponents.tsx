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
  Camera,
  Star,
  MessageSquare
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
  neutral: '#6E7AA1',
  // Star rating colors
  starGold: '#FFD700',
  starFilled: '#FFA500',
  // GitHub-style discussion color
  discussionPurple: '#8B5CF6',
  // UNIFIED feature-specific colors (same everywhere)
  accessibility: '#2196F3', // Blue for accessibility
  babyChanging: '#FF9800',  // Orange for baby changing
  ablution: '#00BCD4',      // Light blue for ablution
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

// Feature counter component (UPDATED: circular with badge number in corner)
export const FeatureCounter = ({ 
  icon: Icon, 
  count,
  type = 'default'
}: { 
  icon: any
  count: number
  type?: 'accessibility' | 'babyChanging' | 'ablution' | 'default'
}) => {
  // Get feature-specific color
  const getFeatureColor = () => {
    switch (type) {
      case 'accessibility': return colors.accessibility
      case 'babyChanging': return colors.babyChanging
      case 'ablution': return colors.ablution
      default: return colors.primary
    }
  }

  const featureColor = getFeatureColor()
  const isActive = count > 0

  return (
    <YStack 
      alignItems="center" 
      justifyContent="center"
      width={60}
      height={60}
      backgroundColor={isActive ? featureColor + '20' : '$backgroundPress'}
      borderRadius={30} // Fully circular
      borderWidth={2}
      borderColor={isActive ? featureColor + '40' : '$borderColor'}
      position="relative"
    >
      <Icon 
        size={24} 
        color={isActive ? featureColor : colors.neutral} 
      />
      
      {/* Badge with count in corner */}
      {isActive && (
        <YStack
          position="absolute"
          top={-5}
          right={-5}
          width={20}
          height={20}
          borderRadius={10}
          backgroundColor={featureColor}
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderColor="white"
        >
          <Text 
            fontSize={10} 
            fontWeight="bold" 
            color="white"
          >
            {count}
          </Text>
        </YStack>
      )}
    </YStack>
  )
}

// NEW: Compact horizontal rating display (UPDATED: centered, GitHub discussion icon, gold stars)
export const CompactRatingDisplay = ({ 
  rating,
  reviewCount = 0,
  size = 'normal'
}: { 
  rating: number
  reviewCount?: number
  size?: 'small' | 'normal' | 'large'
}) => {
  const ratingValue = (rating * 2).toFixed(1) // Convert 5-point to 10-point scale
  
  // Size variations
  const sizes = {
    small: { text: 14, icon: 16, spacing: '$2' },
    normal: { text: 18, icon: 20, spacing: '$3' },
    large: { text: 24, icon: 28, spacing: '$4' }
  }
  
  const currentSize = sizes[size]

  return (
    <XStack alignItems="center" justifyContent="center" space={currentSize.spacing}>
      {/* Star with rating */}
      <XStack alignItems="center" space="$1">
        <Star 
          size={currentSize.icon} 
          color={colors.starFilled} 
          fill={colors.starGold}
        />
        <Text 
          fontSize={currentSize.text} 
          fontWeight="bold" 
          color={colors.primary}
        >
          {ratingValue}
        </Text>
        <Text 
          fontSize={currentSize.text - 2} 
          color="$colorSubtle"
        >
          /10
        </Text>
      </XStack>

      {/* Reviews count with GitHub discussion icon */}
      {reviewCount > 0 && (
        <XStack alignItems="center" space="$1">
          <MessageSquare 
            size={currentSize.icon - 2} 
            color={colors.discussionPurple} 
          />
          <Text 
            fontSize={currentSize.text - 2} 
            color="$colorSubtle"
          >
            {reviewCount}
          </Text>
        </XStack>
      )}
    </XStack>
  )
}

// UPDATED: More compact rating component (UPDATED: COMPLETELY remove /10 and review count)
export const CompactRating = ({ 
  rating,
  reviewCount = 0,
  size = 'normal',
  showIcon = true
}: { 
  rating: number
  reviewCount?: number
  size?: 'small' | 'normal' | 'large'
  showIcon?: boolean
}) => {
  const ratingValue = (rating * 2).toFixed(1) // Convert to 10-point scale
  
  const sizes = {
    small: { text: 12, icon: 14 },
    normal: { text: 14, icon: 16 },
    large: { text: 16, icon: 18 }
  }
  
  const currentSize = sizes[size]

  return (
    <XStack alignItems="center">
      {showIcon && (
        <Star 
          size={currentSize.icon} 
          color={colors.starFilled}
          fill={colors.starGold}
        />
      )}
      <Text fontSize={currentSize.text} fontWeight="bold" color={colors.primary} marginLeft={showIcon ? "$1" : 0}>
        {ratingValue}
      </Text>
    </XStack>
  )
}

// Feature icon with modern circular design (GitHub style)
export const FeatureTag = ({ 
  icon: Icon, 
  label, 
  available = false,
  compact = false,
  type = 'default' 
}: { 
  icon: any
  label: string
  available?: boolean
  compact?: boolean
  type?: 'accessibility' | 'babyChanging' | 'ablution' | 'default'
}) => {
  // Get unified feature-specific color
  const getFeatureColor = () => {
    switch (type) {
      case 'accessibility': return colors.accessibility
      case 'babyChanging': return colors.babyChanging
      case 'ablution': return colors.ablution
      default: return colors.success
    }
  }

  const featureColor = getFeatureColor()

  return (
    <XStack 
      alignItems="center" 
      justifyContent="center"
      width={compact ? 40 : "auto"}
      height={compact ? 40 : "auto"}
      paddingHorizontal={label ? (compact ? "$2" : "$3") : 0}
      paddingVertical={label ? (compact ? "$1" : "$2") : 0}
      backgroundColor={available ? featureColor + '20' : '$backgroundPress'}
      borderRadius={compact ? 20 : "$6"} // More circular for compact
      borderWidth={1}
      borderColor={available ? featureColor + '40' : '$borderColor'}
    >
      <Icon 
        size={compact ? 20 : 16} 
        color={available ? featureColor : colors.neutral} 
      />
      {label && (
        <Text 
          fontSize={compact ? 12 : 14} 
          color={available ? featureColor : colors.neutral}
          fontWeight={available ? '600' : '400'}
          marginLeft="$1"
        >
          {label}
        </Text>
      )}
    </XStack>
  )
}

// Compact review card
// Compact review card with proper author name handling
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

  // UPDATED: Handle author name display properly
  const getAuthorDisplayName = () => {
    // If userName is already formatted (e.g., "Аноним #ABC123"), use it as is
    if (review.userName.startsWith('Аноним #')) {
      return review.userName
    }
    
    // If userName is "Анонимный пользователь" (legacy), keep it
    if (review.userName === 'Анонимный пользователь') {
      return review.userName
    }
    
    // Otherwise it's a real user name
    return review.userName
  }

  const authorName = getAuthorDisplayName()
  const isAnonymous = authorName.startsWith('Аноним #') || authorName === 'Анонимный пользователь'

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
          <XStack alignItems="center" space="$2">
            <Text fontWeight="600" fontSize={15} color="#1A1A1A">
              {authorName}
            </Text>
            {isAnonymous && (
              <Text fontSize={10} color="#666666" backgroundColor="#F0F0F0" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                анонимно
              </Text>
            )}
          </XStack>
          <Text fontSize={12} color="#666666">
            {formatDate(review.createdAt)}
          </Text>
        </YStack>
        <CompactRating rating={review.rating} size="small" />
      </XStack>
      
      {/* Comment */}
      {review.comment && (
        <YStack space="$2">
          <Text fontSize={14} lineHeight={20} numberOfLines={expanded ? undefined : 3} color="#1A1A1A">
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

// NEW: Payment status badge - same style as review counter (circle with light bg + dark border + number)
export const PaymentStatusBadge = ({ 
  count, 
  type 
}: { 
  count: number
  type: 'free' | 'paid' 
}) => {
  const color = type === 'free' ? colors.success : colors.error
  
  return (
    <YStack 
      alignItems="center" 
      justifyContent="center"
      width={32}
      height={32}
      backgroundColor={color + '20'} // Light background like review counter
      borderRadius={16} // Fully circular
      borderWidth={2}
      borderColor={color + '60'} // Darker border like review counter  
    >
      <Text fontSize={12} fontWeight="bold" color={color}>
        {count}
      </Text>
    </YStack>
  )
}

// NEW: Review header with circular icon and badge (like feature counters)
export const ReviewSectionHeader = ({ 
  reviewCount = 0,
  showError = false,
  onRefresh,
  loading = false,
  paymentStats
}: { 
  reviewCount: number
  showError?: boolean
  onRefresh?: () => void
  loading?: boolean
  paymentStats?: {
    freeCount: number
    paidCount: number
  }
}) => {
  return (
    <XStack alignItems="center" justifyContent="space-between">
      <XStack alignItems="center" space="$3">
        <Text fontSize={18} fontWeight="bold">
          Отзывы
        </Text>
        
        {/* Circular icon with badge - same style as feature counters */}
        <YStack 
          alignItems="center" 
          justifyContent="center"
          width={40}
          height={40}
          backgroundColor={reviewCount > 0 ? colors.discussionPurple + '20' : '$backgroundPress'}
          borderRadius={20} // Fully circular
          borderWidth={2}
          borderColor={reviewCount > 0 ? colors.discussionPurple + '40' : '$borderColor'}
          position="relative"
        >
          <MessageSquare 
            size={18} 
            color={reviewCount > 0 ? colors.discussionPurple : colors.neutral} 
          />
          
          {/* Badge with count in corner */}
          {reviewCount > 0 && (
            <YStack
              position="absolute"
              top={-5}
              right={-5}
              width={18}
              height={18}
              borderRadius={9}
              backgroundColor={colors.discussionPurple}
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderColor="white"
            >
              <Text 
                fontSize={9} 
                fontWeight="bold" 
                color="white"
              >
                {reviewCount}
              </Text>
            </YStack>
          )}
        </YStack>
      </XStack>
      
      {/* Payment stats - same style as review counter */}
      {paymentStats && (paymentStats.freeCount > 0 || paymentStats.paidCount > 0) && (
        <XStack alignItems="center" space="$2">
          {paymentStats.freeCount > 0 && (
            <PaymentStatusBadge count={paymentStats.freeCount} type="free" />
          )}
          {paymentStats.paidCount > 0 && (
            <PaymentStatusBadge count={paymentStats.paidCount} type="paid" />
          )}
        </XStack>
      )}
      
      {/* Error refresh button */}
      {showError && onRefresh && (
        <Button
          size="$2"
          variant="outlined"
          onPress={onRefresh}
          disabled={loading}
        >
          <Text fontSize={12}>
            {loading ? 'Загрузка...' : 'Обновить'}
          </Text>
        </Button>
      )}
    </XStack>
  )
}

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
      {/* Reviews - NO duplicate count display */}
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

// UPDATED: Simplified review statistics - REMOVED payment stats (moved to ReviewSectionHeader)
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
      {/* Feature counters - circular with badges, no title */}
      {featureCounts && (
        <XStack space="$4" justifyContent="center" alignItems="center">
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
    </YStack>
  )
}