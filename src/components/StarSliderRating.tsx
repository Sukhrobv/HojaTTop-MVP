import React, { useRef } from 'react'
import { YStack, XStack, Text } from 'tamagui'
import { Pressable, View, PanResponder, Dimensions } from 'react-native'
import { Star } from 'lucide-react-native'
import { useTranslation } from '@/i18n'

// Color scheme
const colors = {
  starGold: '#FFD700',
  starFilled: '#FFA500', 
  starEmpty: '#E0E0E0',
  primary: '#4ECDC4',
}

interface StarSliderRatingProps {
  value: number
  onChange: (value: number) => void
  maxStars?: number
  starSize?: number
}

export default function StarSliderRating({
  value,
  onChange,
  maxStars = 10,
  starSize = 28 // Slightly smaller to fit in one row
}: StarSliderRatingProps) {
  const { t } = useTranslation()
  const containerRef = useRef<View>(null)
  const screenWidth = Dimensions.get('window').width
  const containerWidth = screenWidth - 32 // Account for padding
  const starSpacing = containerWidth / maxStars

  // Handle direct star press
  const handleStarPress = (starIndex: number) => {
    onChange(starIndex + 1)
  }

  // Create pan responder for swipe gesture
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (event) => {
      // Handle initial touch
      handlePanMove(event.nativeEvent.locationX)
    },
    
    onPanResponderMove: (event) => {
      // Handle drag movement
      handlePanMove(event.nativeEvent.locationX)
    },
    
    onPanResponderRelease: () => {
      // Touch ended
    }
  })

  const handlePanMove = (locationX: number) => {
    // Calculate which star position based on touch location
    const clampedX = Math.max(0, Math.min(containerWidth, locationX))
    const starPosition = Math.ceil(clampedX / starSpacing)
    const newValue = Math.max(1, Math.min(maxStars, starPosition))
    
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  return (
    <YStack space="$3" alignItems="center">
      {/* Stars container with pan responder */}
      <View
        ref={containerRef}
        style={{ width: containerWidth, height: starSize + 20 }}
        {...panResponder.panHandlers}
      >
        <XStack 
          justifyContent="space-between"
          alignItems="center"
          width={containerWidth}
          paddingVertical="$2"
        >
          {Array.from({ length: maxStars }, (_, index) => {
            const starNumber = index + 1
            const isFilled = starNumber <= value
            
            return (
              <Pressable
                key={index}
                onPress={() => handleStarPress(index)}
                style={{
                  padding: 4,
                  borderRadius: 20,
                }}
              >
                <Star
                  size={starSize}
                  color={isFilled ? colors.starFilled : colors.starEmpty}
                  fill={isFilled ? colors.starGold : 'transparent'}
                />
              </Pressable>
            )
          })}
        </XStack>
      </View>
      
      {/* Rating value display - NO /10 */}
      <XStack alignItems="center" space="$2">
        <Text fontSize={24} fontWeight="bold" color={colors.primary}>
          {value}
        </Text>
      </XStack>
      
      {/* Helper text */}
      <Text fontSize={12} color="$colorSubtle" textAlign="center">
        {t('rating.slider.helper')}
      </Text>
    </YStack>
  )
}