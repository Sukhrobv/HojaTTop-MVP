import React from 'react'
import { XStack, YStack, Text } from 'tamagui'
import { Pressable } from 'react-native'
import { Star } from 'lucide-react-native'
import { useTranslation } from '@/i18n'

interface RatingSelectorProps {
  value: number
  onChange: (value: number) => void
}

export default function RatingSelector({ value, onChange }: RatingSelectorProps) {
  const { t } = useTranslation()
  
  // Convert 10-point scale to 5-point scale for UI (1-5)
  // Internal value is still 0-10 for compatibility
  const selectedRating = Math.ceil(value / 2)

  const handleRatingPress = (rating: number) => {
    // Convert 1-5 back to 10-point scale (2, 4, 6, 8, 10)
    onChange(rating * 2)
  }

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return t('rating.label.1')
      case 2: return t('rating.label.2')
      case 3: return t('rating.label.3')
      case 4: return t('rating.label.4')
      case 5: return t('rating.label.5')
      default: return t('rating.placeholder')
    }
  }

  return (
    <YStack space="$3" alignItems="center">
      <XStack space="$2" justifyContent="center" width="100%">
        {[1, 2, 3, 4, 5].map((star) => {
          const isSelected = selectedRating >= star
          const isCurrent = selectedRating === star
          
          return (
            <Pressable
              key={star}
              onPress={() => handleRatingPress(star)}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.9 : (isCurrent ? 1.1 : 1) }],
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <YStack 
                alignItems="center" 
                justifyContent="center"
                width={50}
                height={60}
              >
                <Star 
                  size={40} 
                  fill={isSelected ? '#FFD700' : 'transparent'} 
                  color={isSelected ? '#FFD700' : '#E0E0E0'} 
                  strokeWidth={2}
                />
                <Text 
                  fontSize={12} 
                  fontWeight="bold" 
                  color={isSelected ? '#FFD700' : '#999'}
                  marginTop="$1"
                >
                  {star}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>
      
      <Text 
        fontSize={16} 
        fontWeight="bold" 
        color={selectedRating > 0 ? '#4ECDC4' : '#999'}
        animation="quick"
      >
        {getRatingLabel(selectedRating)}
      </Text>
    </YStack>
  )
}