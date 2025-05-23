import React, { useState } from 'react'
import { ScrollView, YStack, XStack, Text, Button, TextArea, Card, Separator, Label, Spinner } from 'tamagui'
import { Alert, Pressable } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '@/navigation'
import { useReviews } from '@/hooks/useReviews'
import { Review } from '@/types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddReview'>
type RouteProps = RouteProp<RootStackParamList, 'AddReview'>

const RatingSelector = ({ 
  label, 
  value, 
  onChange,
  required = false 
}: { 
  label: string
  value: number
  onChange: (rating: number) => void
  required?: boolean
}) => {
  return (
    <YStack space="$2">
      <Label>
        {label}
        {required && <Text color="red"> *</Text>}
      </Label>
      <XStack space="$2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => onChange(star)}>
            <Text fontSize={30}>
              {star <= value ? '⭐' : '☆'}
            </Text>
          </Pressable>
        ))}
      </XStack>
      {value > 0 && (
        <Text fontSize={12} color="$colorSubtle">
          {value === 1 && 'Ужасно'}
          {value === 2 && 'Плохо'}
          {value === 3 && 'Нормально'}
          {value === 4 && 'Хорошо'}
          {value === 5 && 'Отлично'}
        </Text>
      )}
    </YStack>
  )
}

export default function AddReviewScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProps>()
  const { toiletId } = route.params

  const { addNewReview } = useReviews(toiletId)

  // Form state
  const [rating, setRating] = useState(0)
  const [cleanliness, setCleanliness] = useState(0)
  const [accessibility, setAccessibility] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Validation
    if (rating === 0) {
      Alert.alert('Ошибка', 'Пожалуйста, поставьте общую оценку')
      return
    }

    if (comment.length > 500) {
      Alert.alert('Ошибка', 'Комментарий не должен превышать 500 символов')
      return
    }

    setSubmitting(true)

    try {
      const reviewData: Omit<Review, 'id' | 'createdAt'> = {
        toiletId,
        userId: 'anonymous', // TODO: Add proper user management
        userName: 'Анонимный пользователь',
        rating,
        cleanliness,
        accessibility,
        comment: comment.trim(),
        photos: [] // TODO: Add photo upload functionality
      }

      const success = await addNewReview(reviewData)

      if (success) {
        Alert.alert(
          'Успешно!', 
          'Ваш отзыв добавлен и будет виден другим пользователям',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Small delay to ensure data is synced
              setTimeout(() => {
                navigation.goBack()
              }, 500)
            }
          }]
        )
      } else {
        Alert.alert(
          'Ошибка',
          'Не удалось добавить отзыв. Проверьте интернет-соединение и попробуйте снова.'
        )
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      Alert.alert(
        'Ошибка',
        'Произошла ошибка при отправке отзыва'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = rating > 0
  const commentLength = comment.length

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$4" space="$4">
        {/* Rating Card */}
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize={18} fontWeight="bold">
              Оценка туалета
            </Text>
            <Text fontSize={14} color="$colorSubtle" marginTop="$1">
              Поставьте оценки по разным критериям
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <YStack space="$4">
              <RatingSelector
                label="Общая оценка"
                value={rating}
                onChange={setRating}
                required={true}
              />
              
              <RatingSelector
                label="Чистота"
                value={cleanliness}
                onChange={setCleanliness}
              />
              
              <RatingSelector
                label="Доступность"
                value={accessibility}
                onChange={setAccessibility}
              />
            </YStack>
          </Card.Footer>
        </Card>

        {/* Comment Card */}
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize={18} fontWeight="bold">
              Комментарий
            </Text>
            <Text fontSize={14} color="$colorSubtle" marginTop="$1">
              Расскажите о своем опыте (необязательно)
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <YStack space="$3">
              <TextArea
                placeholder="Поделитесь вашим опытом: что понравилось, что можно улучшить..."
                value={comment}
                onChangeText={setComment}
                numberOfLines={4}
                minHeight={100}
                maxLength={500}
                backgroundColor="$backgroundFocus"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$2"
                padding="$3"
              />
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={12} color="$colorSubtle">
                  Максимум 500 символов
                </Text>
                <Text fontSize={12} color={commentLength > 450 ? 'red' : '$colorSubtle'}>
                  {commentLength}/500
                </Text>
              </XStack>
            </YStack>
          </Card.Footer>
        </Card>

        {/* Photo Upload (placeholder) */}
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize={18} fontWeight="bold">
              Фотографии
            </Text>
            <Text fontSize={14} color="$colorSubtle" marginTop="$1">
              Добавьте фото для других пользователей
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <Pressable
              onPress={() => Alert.alert('Скоро', 'Загрузка фото будет добавлена в следующих версиях')}
              style={{
                backgroundColor: '#F5F5F5',
                borderRadius: 8,
                padding: 20,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#E0E0E0',
                borderStyle: 'dashed',
              }}
            >
              <Text fontSize={40} marginBottom="$2">📷</Text>
              <Text color="$colorSubtle">Добавить фото</Text>
              <Text color="$colorSubtle" fontSize={12} marginTop="$1">
                Скоро будет доступно
              </Text>
            </Pressable>
          </Card.Footer>
        </Card>

        {/* Tips Card */}
        <Card elevate bordered backgroundColor="$backgroundHover">
          <Card.Header>
            <Text fontSize={16} fontWeight="bold">
              💡 Советы для хорошего отзыва
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <YStack space="$2">
              <Text fontSize={12} color="$colorSubtle">
                • Будьте честными и объективными
              </Text>
              <Text fontSize={12} color="$colorSubtle">
                • Упомяните состояние чистоты
              </Text>
              <Text fontSize={12} color="$colorSubtle">
                • Отметьте удобства для людей с ограниченными возможностями
              </Text>
              <Text fontSize={12} color="$colorSubtle">
                • Укажите время посещения если важно
              </Text>
            </YStack>
          </Card.Footer>
        </Card>

        {/* Submit Button */}
        <Button 
          size="$5" 
          backgroundColor={isFormValid ? "#4ECDC4" : "$backgroundPress"}
          pressStyle={{ backgroundColor: isFormValid ? '#3BA99C' : '$backgroundPress' }}
          onPress={handleSubmit}
          disabled={!isFormValid || submitting}
        >
          {submitting ? (
            <XStack alignItems="center" space="$2">
              <Spinner size="small" color="white" />
              <Text color="white" fontWeight="bold">
                Отправка...
              </Text>
            </XStack>
          ) : (
            <Text color={isFormValid ? "white" : "$colorSubtle"} fontWeight="bold">
              Отправить отзыв
            </Text>
          )}
        </Button>
      </YStack>
    </ScrollView>
  )
}