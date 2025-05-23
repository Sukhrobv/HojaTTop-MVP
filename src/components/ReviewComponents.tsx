import React from 'react'
import { YStack, XStack, Text, Card, Separator } from 'tamagui'
import { Review } from '@/types'

// Rating stars component
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

// Single review card
export const ReviewCard = ({ 
  review, 
  showToiletName = false 
}: { 
  review: Review
  showToiletName?: boolean 
}) => {
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
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Card elevate bordered marginVertical="$2">
      <Card.Header>
        <XStack alignItems="center" justifyContent="space-between">
          <YStack flex={1}>
            <Text fontWeight="600" fontSize={16}>
              {review.userName}
            </Text>
            <Text fontSize={12} color="$colorSubtle">
              {formatDate(review.createdAt)}
            </Text>
          </YStack>
          <RatingStars rating={review.rating} size={18} />
        </XStack>
      </Card.Header>
      
      {(review.cleanliness > 0 || review.accessibility > 0 || review.comment) && (
        <>
          <Separator />
          <Card.Footer padded>
            <YStack space="$2">
              {/* Detailed ratings */}
              {(review.cleanliness > 0 || review.accessibility > 0) && (
                <XStack space="$4">
                  {review.cleanliness > 0 && (
                    <XStack alignItems="center" space="$2">
                      <Text fontSize={12} color="$colorSubtle">Чистота:</Text>
                      <RatingStars rating={review.cleanliness} size={14} showValue={false} />
                    </XStack>
                  )}
                  {review.accessibility > 0 && (
                    <XStack alignItems="center" space="$2">
                      <Text fontSize={12} color="$colorSubtle">Доступность:</Text>
                      <RatingStars rating={review.accessibility} size={14} showValue={false} />
                    </XStack>
                  )}
                </XStack>
              )}
              
              {/* Comment */}
              {review.comment && (
                <Text fontSize={14} lineHeight={20}>
                  {review.comment}
                </Text>
              )}
              
              {/* Photos placeholder */}
              {review.photos && review.photos.length > 0 && (
                <XStack space="$2">
                  {review.photos.slice(0, 3).map((photo, index) => (
                    <Text key={index} fontSize={24}>📷</Text>
                  ))}
                  {review.photos.length > 3 && (
                    <Text fontSize={12} color="$colorSubtle">
                      +{review.photos.length - 3} ещё
                    </Text>
                  )}
                </XStack>
              )}
            </YStack>
          </Card.Footer>
        </>
      )}
    </Card>
  )
}

// Reviews list component
export const ReviewsList = ({ 
  reviews, 
  loading = false, 
  error = null,
  emptyMessage = "Отзывов пока нет" 
}: { 
  reviews: Review[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
}) => {
  if (loading) {
    return (
      <YStack alignItems="center" padding="$4">
        <Text color="$colorSubtle">Загрузка отзывов...</Text>
      </YStack>
    )
  }

  if (error) {
    return (
      <YStack alignItems="center" padding="$4">
        <Text color="red" textAlign="center">
          {error}
        </Text>
      </YStack>
    )
  }

  if (reviews.length === 0) {
    return (
      <YStack alignItems="center" padding="$4">
        <Text fontSize={48} marginBottom="$2">💭</Text>
        <Text color="$colorSubtle" textAlign="center">
          {emptyMessage}
        </Text>
        <Text fontSize={12} color="$colorSubtle" textAlign="center" marginTop="$2">
          Станьте первым, кто оставит отзыв!
        </Text>
      </YStack>
    )
  }

  return (
    <YStack>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </YStack>
  )
}

// Review statistics component
export const ReviewStats = ({ 
  stats 
}: { 
  stats: {
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
    averageCleanliness: number
    averageAccessibility: number
  } | null
}) => {
  if (!stats || stats.totalReviews === 0) {
    return null
  }

  return (
    <Card elevate bordered>
      <Card.Header>
        <Text fontSize={18} fontWeight="bold">
          Статистика отзывов
        </Text>
      </Card.Header>
      
      <Separator />
      
      <Card.Footer padded>
        <YStack space="$3">
          {/* Overall rating */}
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize={16} fontWeight="600">
              Общая оценка:
            </Text>
            <XStack alignItems="center" space="$2">
              <RatingStars rating={stats.averageRating} size={20} />
              <Text fontSize={14} color="$colorSubtle">
                ({stats.totalReviews} отзывов)
              </Text>
            </XStack>
          </XStack>

          {/* Detailed ratings */}
          {stats.averageCleanliness > 0 && (
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize={14}>Чистота:</Text>
              <RatingStars rating={stats.averageCleanliness} size={16} />
            </XStack>
          )}
          
          {stats.averageAccessibility > 0 && (
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize={14}>Доступность:</Text>
              <RatingStars rating={stats.averageAccessibility} size={16} />
            </XStack>
          )}

          {/* Rating distribution */}
          <YStack space="$2">
            <Text fontSize={14} fontWeight="600" marginTop="$2">
              Распределение оценок:
            </Text>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star] || 0
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
              
              return (
                <XStack key={star} alignItems="center" space="$2">
                  <Text fontSize={12} width={20}>{star}⭐</Text>
                  <YStack 
                    flex={1} 
                    height={8} 
                    backgroundColor="$backgroundPress" 
                    borderRadius={4}
                    overflow="hidden"
                  >
                    <YStack 
                      height="100%" 
                      width={`${percentage}%`}
                      backgroundColor="#FFD700"
                    />
                  </YStack>
                  <Text fontSize={12} color="$colorSubtle" width={30}>
                    {count}
                  </Text>
                </XStack>
              )
            })}
          </YStack>
        </YStack>
      </Card.Footer>
    </Card>
  )
}