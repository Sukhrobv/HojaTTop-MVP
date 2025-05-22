import React, { useState } from 'react'
import { ScrollView, YStack, XStack, Text, Button, TextArea, Card, Separator, Label } from 'tamagui'
import { Alert, Pressable } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '@/navigation'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddReview'>
type RouteProps = RouteProp<RootStackParamList, 'AddReview'>

const RatingSelector = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string
  value: number
  onChange: (rating: number) => void 
}) => {
  return (
    <YStack space="$2">
      <Label>{label}</Label>
      <XStack space="$2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => onChange(star)}>
            <Text fontSize={30}>
              {star <= value ? '⭐' : '☆'}
            </Text>
          </Pressable>
        ))}
      </XStack>
    </YStack>
  )
}

export default function AddReviewScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProps>()
  const { toiletId } = route.params

  // Form state
  const [rating, setRating] = useState(0)
  const [cleanliness, setCleanliness] = useState(0)
  const [accessibility, setAccessibility] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    // Validation
    if (rating === 0) {
      Alert.alert('Ошибка', 'Пожалуйста, поставьте общую оценку')
      return
    }

    // TODO: Submit review to Firebase
    Alert.alert(
      'Успешно!', 
      'Ваш отзыв добавлен',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    )
  }

  const isFormValid = rating > 0

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$4" space="$4">
        {/* Rating Card */}
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize={18} fontWeight="bold">
              Оценка туалета
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <YStack space="$4">
              <RatingSelector
                label="Общая оценка *"
                value={rating}
                onChange={setRating}
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
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <TextArea
              placeholder="Поделитесь вашим опытом..."
              value={comment}
              onChangeText={setComment}
              numberOfLines={4}
              minHeight={100}
              backgroundColor="$backgroundFocus"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$2"
              padding="$3"
            />
          </Card.Footer>
        </Card>

        {/* Photo Upload (placeholder) */}
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize={18} fontWeight="bold">
              Фотографии
            </Text>
          </Card.Header>
          
          <Separator />
          
          <Card.Footer padded>
            <Pressable
              onPress={() => Alert.alert('Фото', 'Загрузка фото будет добавлена позже')}
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
            </Pressable>
          </Card.Footer>
        </Card>

        {/* Submit Button */}
        <Button 
          size="$5" 
          backgroundColor={isFormValid ? "#4ECDC4" : "$backgroundPress"}
          pressStyle={{ backgroundColor: isFormValid ? '#3BA99C' : '$backgroundPress' }}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <Text color={isFormValid ? "white" : "$colorSubtle"} fontWeight="bold">
            Отправить отзыв
          </Text>
        </Button>
      </YStack>
    </ScrollView>
  )
}