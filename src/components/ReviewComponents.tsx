import React, { useState } from 'react'
import { Pressable } from 'react-native'
import { Button, Progress, Sheet, Text, XStack, YStack } from 'tamagui'
import {
  Accessibility,
  ArrowDown,
  ArrowUp,
  Baby,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  Droplets,
  Gift,
  MessageSquare,
  Star
} from 'lucide-react-native'
import { Review } from '@/types'
import { useTranslation } from '@/i18n' // Импорт хука

// Color scheme
const colors = {
  primary: '#4ECDC4',
  secondary: '#FF6B6B', 
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  accent: '#9C27B0',
  neutral: '#6E7AA1',
  starGold: '#FFD700',
  starFilled: '#FFA500',
  discussionPurple: '#8B5CF6',
  accessibility: '#2196F3',
  babyChanging: '#FF9800',
  ablution: '#00BCD4',
  avatarBg: '#E8EEF8'
}

// Universal reward bottom sheet with icon-only copy action
export const RewardSheet = ({
  open,
  onOpenChange,
  title, // Optional, will use default from t() if undefined
  subtitle,
  rewardLabel,
  code,
  terms,
  accentColor = colors.primary,
  icon: Icon = Gift,
  onCopy
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  subtitle?: string
  rewardLabel?: string
  code?: string
  terms?: string
  accentColor?: string
  icon?: any
  onCopy?: (code: string) => Promise<void> | void
}) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!code) return
    try {
      await onCopy?.(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.warn('Copy failed', error)
    }
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[44]}
      dismissOnSnapToBottom
      animation="medium"
    >
      <Sheet.Frame backgroundColor="$background" padding="$4" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <Sheet.Handle />

        <YStack space="$3">
          <XStack alignItems="center" space="$3">
            <YStack
              width={48}
              height={48}
              borderRadius={16}
              alignItems="center"
              justifyContent="center"
              backgroundColor={`${accentColor}22`}
              borderWidth={1}
              borderColor={`${accentColor}40`}
            >
              <Icon size={24} color={accentColor} />
            </YStack>
            <YStack flex={1} space="$1">
              <Text fontSize={18} fontWeight="700" color="$color">
                {title || t('components.reward.defaultTitle')}
              </Text>
              {subtitle && (
                <Text fontSize={14} color="$colorSubtle">
                  {subtitle}
                </Text>
              )}
            </YStack>
          </XStack>

          <YStack
            space="$2"
            backgroundColor="$backgroundPress"
            borderRadius="$4"
            padding="$3"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text fontSize={12} color="$colorSubtle" textTransform="uppercase" letterSpacing={0.5}>
              {rewardLabel || t('components.reward.defaultLabel')}
            </Text>

            <XStack alignItems="center" justifyContent="space-between" space="$2">
              <Text fontSize={20} fontWeight="700" color="$color" flexShrink={1}>
                {code || t('components.reward.placeholder')}
              </Text>

              {code && (
                <Pressable
                  onPress={handleCopy}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: accentColor,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {copied ? (
                    <Check size={18} color="#ffffff" />
                  ) : (
                    <Copy size={18} color="#ffffff" />
                  )}
                </Pressable>
              )}
            </XStack>
          </YStack>

          {terms && (
            <Text fontSize={13} color="$colorSubtle" lineHeight={18}>
              {terms}
            </Text>
          )}

          <Button
            backgroundColor={accentColor}
            pressStyle={{ opacity: 0.9 }}
            onPress={() => onOpenChange(false)}
            borderRadius="$4"
          >
            <Text color="white" fontWeight="700">
              {t('components.reward.close')}
            </Text>
          </Button>
        </YStack>
      </Sheet.Frame>
      <Sheet.Overlay
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.35)"
      />
    </Sheet>
  )
}

const InlineStars = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  const stars = Array.from({ length: 5 })
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  return (
    <XStack alignItems="center" space="$1">
      {stars.map((_, index) => {
        const filled = index < fullStars
        const half = !filled && hasHalf && index === fullStars
        return (
          <Star
            key={index}
            size={size}
            color={filled || half ? colors.starFilled : '#C6CCD9'}
            fill={filled ? colors.starGold : half ? colors.starGold : 'none'}
            strokeWidth={1.5}
          />
        )
      })}
    </XStack>
  )
}

const AvatarCircle = ({ label }: { label: string }) => {
  const initial = label.trim()[0]?.toUpperCase() || 'A'
  return (
    <YStack
      width={40}
      height={40}
      borderRadius={20}
      alignItems="center"
      justifyContent="center"
      backgroundColor={colors.avatarBg}
    >
      <Text fontWeight="700" color="#2A3550">
        {initial}
      </Text>
    </YStack>
  )
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
      {Array(fullStars).fill(0).map((_, i) => (
        <Text key={`full-${i}`} fontSize={size} color="#FFD700">⭐</Text>
      ))}
      
      {hasHalfStar && (
        <Text fontSize={size} color="#FFD700">⭐</Text>
      )}
      
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
  count,
  type = 'default'
}: { 
  icon: any
  count: number
  type?: 'accessibility' | 'babyChanging' | 'ablution' | 'default'
}) => {
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
      borderRadius={30}
      borderWidth={2}
      borderColor={isActive ? featureColor + '40' : '$borderColor'}
      position="relative"
    >
      <Icon 
        size={24} 
        color={isActive ? featureColor : colors.neutral} 
      />
      
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

export const CompactRatingDisplay = ({ 
  rating,
  reviewCount = 0,
  size = 'normal'
}: { 
  rating: number
  reviewCount?: number
  size?: 'small' | 'normal' | 'large'
}) => {
  const ratingValue = (rating * 2).toFixed(1)
  
  const sizes = {
    small: { text: 14, icon: 16, spacing: '$2' },
    normal: { text: 18, icon: 20, spacing: '$3' },
    large: { text: 24, icon: 28, spacing: '$4' }
  }
  
  const currentSize = sizes[size]

  return (
    <XStack alignItems="center" justifyContent="center" space={currentSize.spacing}>
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
  const ratingValue = (rating * 2).toFixed(1)
  
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
      borderRadius={compact ? 20 : "$6"}
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

// Compact review card with proper author name handling and translations
export const ReviewCard = ({ 
  review, 
  onLike,
  onDislike
}: { 
  review: Review & { likes?: number; dislikes?: number; userLiked?: boolean; userDisliked?: boolean }
  onLike?: (reviewId: string) => void
  onDislike?: (reviewId: string) => void
}) => {
  const { t, language } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return t('components.date.today')
    if (diffDays === 2) return t('components.date.yesterday')
    if (diffDays <= 7) return t('components.date.daysAgo').replace('{days}', diffDays.toString())
    
    const locale = language === 'ru' ? 'ru-RU' : 'uz-UZ'
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short'
    })
  }

  const authorName = review.userName || t('components.review.anonymous')
  const netScore = (review.likes || 0) - (review.dislikes || 0)
  const displayName = authorName

  return (
    <XStack paddingVertical="$3" space="$3" alignItems="flex-start">
      <AvatarCircle label={displayName} />

      <YStack flex={1} space="$2">
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between" space="$2">
          <YStack flex={1} space="$1">
            <Text fontWeight="700" fontSize={15} color="#1A1A1A" numberOfLines={1}>
              {displayName}
            </Text>
            <Text fontSize={10} color="#7A8190">
              {formatDate(review.createdAt)}
            </Text>
          </YStack>
          <InlineStars rating={review.rating} size={16} />
        </XStack>
        
        {/* Comment */}
        {review.comment && (
          <YStack space="$2.5">
            <Text fontSize={14} lineHeight={20} numberOfLines={expanded ? undefined : 3} color="#1A1A1A">
              {review.comment}
            </Text>
            
            {review.comment.length > 100 && (
              <Pressable onPress={() => setExpanded(!expanded)}>
                <XStack alignItems="center" space="$1">
                  <Text fontSize={12} color={colors.primary} fontWeight="600">
                    {expanded ? t('components.review.hide') : t('components.review.readMore')}
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
        
        {/* Actions - compact voting */}
        <XStack 
          alignItems="center" 
          space="$1" 
          paddingTop="$2.5" 
          justifyContent="flex-end"
          alignSelf="flex-end"
        >
          <Pressable 
            onPress={() => onLike?.(review.id)}
            style={{ 
              width: 24, 
              height: 24, 
              borderRadius: 12, 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: review.userLiked ? '#E6ECFF' : 'transparent'
            }}
          >
            <ArrowUp 
              size={14} 
              color={review.userLiked ? '#4C6FFF' : '#8A8F9B'}
              fill={review.userLiked ? '#4C6FFF' : 'transparent'} 
            />
          </Pressable>
          
          <Text 
            fontSize={12} 
            fontWeight="700" 
            color={netScore > 0 ? '#2EAD68' : netScore < 0 ? '#D64545' : '#7A8190'}
            minWidth={14} 
            textAlign="center"
          >
            {netScore}
          </Text>
          
          <Pressable 
            onPress={() => onDislike?.(review.id)}
            style={{ 
              width: 24, 
              height: 24, 
              borderRadius: 12, 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: review.userDisliked ? '#FFEAE2' : 'transparent'
            }}
          >
            <ArrowDown 
              size={14} 
              color={review.userDisliked ? '#FF8B60' : '#8A8F9B'}
              fill={review.userDisliked ? '#FF8B60' : 'transparent'} 
            />
          </Pressable>
        </XStack>
      </YStack>
    </XStack>
  )
}

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
      backgroundColor={color + '20'}
      borderRadius={16}
      borderWidth={2}
      borderColor={color + '60'}
    >
      <Text fontSize={12} fontWeight="bold" color={color}>
        {count}
      </Text>
    </YStack>
  )
}

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
  const { t } = useTranslation()

  return (
    <XStack alignItems="center" justifyContent="space-between">
      <XStack alignItems="center" space="$3">
        <Text fontSize={18} fontWeight="bold">
          {t('components.section.reviews')}
        </Text>
        <YStack 
          alignItems="center" 
          justifyContent="center"
          width={40}
          height={40}
          backgroundColor={reviewCount > 0 ? colors.discussionPurple + '20' : '$backgroundPress'}
          borderRadius={20}
          borderWidth={1}
          borderColor={reviewCount > 0 ? colors.discussionPurple + '40' : '$borderColor'}
          position="relative"
        >
          <MessageSquare 
            size={18} 
            color={reviewCount > 0 ? colors.discussionPurple : colors.neutral} 
          />
          {reviewCount > 0 && (
            <YStack
              position="absolute"
              top={-6}
              right={-6}
              minWidth={18}
              height={18}
              paddingHorizontal={6}
              borderRadius={9}
              backgroundColor={colors.discussionPurple}
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderColor="$background"
            >
              <Text 
                fontSize={10} 
                fontWeight="700" 
                color="white"
              >
                {reviewCount}
              </Text>
            </YStack>
          )}
        </YStack>
      </XStack>
      
      {/* Error refresh button */}
      {showError && onRefresh && (
        <Button
          size="$2"
          variant="outlined"
          onPress={onRefresh}
          disabled={loading}
        >
          <Text fontSize={12}>
            {loading ? t('components.button.loading') : t('components.button.refresh')}
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
  emptyMessage,
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
  const { t } = useTranslation()
  const displayEmptyMessage = emptyMessage || t('components.list.empty')

  if (loading) {
    return (
      <YStack alignItems="center" padding="$3">
        <Text color="$colorSubtle">{t('components.list.loading')}</Text>
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
          {displayEmptyMessage}
        </Text>
        <Text fontSize={12} color="$colorSubtle" textAlign="center">
          {t('components.list.beFirst')}
        </Text>
      </YStack>
    )
  }

  return (
    <YStack>
      {reviews.map((review, index) => (
        <React.Fragment key={review.id}>
          <ReviewCard 
            review={review}
            onLike={onLike}
            onDislike={onDislike}
          />
          {index < reviews.length - 1 && (
            <YStack height={1} backgroundColor="$borderColor" marginVertical="$2" />
          )}
        </React.Fragment>
      ))}
    </YStack>
  )
}

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
      {/* Feature counters */}
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